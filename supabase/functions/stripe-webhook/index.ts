// Stripe webhook receiver — normalizes checkout/subscription lifecycle
// events into the subscriptions table (docs/05: "admin dashboard needs
// visibility into subscription status per client"). This is the only place
// subscription status transitions from trialing -> active/past_due/canceled.
//
// Security boundary: Stripe signs every webhook payload with
// STRIPE_WEBHOOK_SECRET; verifyStripeSignature() below is what actually
// authenticates the caller (not our Supabase apikey — Stripe doesn't send
// one, hence verify_jwt = false in config.toml for this function). Never
// trust an unsigned request here.
//
// Written as a plain Deno.serve handler — see the comment at the top of
// supabase/functions/create-booking/index.ts for the key-format rationale.
//
// CREDENTIAL GAP (flagged in docs/logs.md): STRIPE_WEBHOOK_SECRET is not yet
// configured — until it is, this function returns 501 rather than silently
// accepting unsigned/unverifiable webhook calls, which would be a real
// security hole (anyone could POST a fake "subscription active" event).
//
// To register locally once keys exist: `stripe listen --forward-to
// http://127.0.0.1:54321/functions/v1/stripe-webhook` (Stripe CLI).

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

/**
 * Verifies a Stripe webhook signature per Stripe's documented algorithm
 * (HMAC-SHA256 over "{timestamp}.{payload}", compared against the v1
 * signature(s) in the Stripe-Signature header) without pulling in the full
 * Stripe SDK, which isn't needed for signature verification alone.
 */
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === signature;
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "active";
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return jsonResponse(
      { error: "Stripe webhook is not configured yet — STRIPE_WEBHOOK_SECRET missing." },
      501,
    );
  }

  const signatureHeader = req.headers.get("stripe-signature");
  if (!signatureHeader) return jsonResponse({ error: "Missing stripe-signature header" }, 400);

  const rawBody = await req.text();
  const isValid = await verifyStripeSignature(rawBody, signatureHeader, webhookSecret);
  if (!isValid) {
    console.error("stripe webhook signature verification failed");
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(rawBody);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const { error } = await admin
          .from("subscriptions")
          .update({
            gateway_customer_id: session.customer,
            status: "active",
            current_period_start: new Date().toISOString(),
          })
          .eq("gateway", "stripe")
          .eq("gateway_subscription_id", session.subscription);
        if (error) console.error("failed to update subscription on checkout.session.completed", error);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object;
      const { error } = await admin
        .from("subscriptions")
        .update({
          status: mapStripeStatus(sub.status),
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        })
        .eq("gateway", "stripe")
        .eq("gateway_subscription_id", sub.id);
      if (error) console.error("failed to update subscription on customer.subscription.updated", error);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { error } = await admin
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("gateway", "stripe")
        .eq("gateway_subscription_id", sub.id);
      if (error) console.error("failed to update subscription on customer.subscription.deleted", error);
      break;
    }

    default:
      // Unhandled event types are expected and fine to ignore — Stripe
      // sends many event types this integration doesn't need to act on.
      break;
  }

  return jsonResponse({ received: true });
});

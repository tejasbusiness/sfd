// Razorpay webhook receiver — normalizes subscription lifecycle events into
// the subscriptions table (docs/05: "admin dashboard needs visibility into
// subscription status per client"). Counterpart to stripe-webhook for INR
// transactions.
//
// Security boundary: Razorpay signs every webhook payload with
// RAZORPAY_WEBHOOK_SECRET (HMAC-SHA256 over the raw request body, sent in
// the X-Razorpay-Signature header); verifyRazorpaySignature() below is what
// actually authenticates the caller. Never trust an unsigned request here.
//
// CREDENTIAL GAP (flagged in docs/logs.md): RAZORPAY_WEBHOOK_SECRET is not
// yet configured — until it is, this function returns 501 rather than
// silently accepting unsigned webhook calls. Also note create-checkout-
// session's Razorpay path itself isn't wired up yet (needs a Plan synced to
// pricing_tiers first), so this webhook has nothing to receive until that
// lands — written now so the whole payments surface is complete and ready
// for real credentials in one pass, per docs/05's architecture note to keep
// gateway logic behind one abstraction.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

async function verifyRazorpaySignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === signatureHeader;
}

function mapRazorpayStatus(razorpayStatus: string): string {
  switch (razorpayStatus) {
    case "created":
    case "authenticated":
      return "trialing";
    case "active":
      return "active";
    case "pending":
    case "halted":
      return "past_due";
    case "cancelled":
    case "expired":
      return "canceled";
    default:
      return "active";
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return jsonResponse(
      { error: "Razorpay webhook is not configured yet — RAZORPAY_WEBHOOK_SECRET missing." },
      501,
    );
  }

  const signatureHeader = req.headers.get("x-razorpay-signature");
  if (!signatureHeader) return jsonResponse({ error: "Missing X-Razorpay-Signature header" }, 400);

  const rawBody = await req.text();
  const isValid = await verifyRazorpaySignature(rawBody, signatureHeader, webhookSecret);
  if (!isValid) {
    console.error("razorpay webhook signature verification failed");
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(rawBody);
  const entity = event.payload?.subscription?.entity;

  if (entity) {
    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged":
      case "subscription.updated": {
        const { error } = await admin
          .from("subscriptions")
          .update({
            status: mapRazorpayStatus(entity.status),
            current_period_start: entity.current_start
              ? new Date(entity.current_start * 1000).toISOString()
              : null,
            current_period_end: entity.current_end
              ? new Date(entity.current_end * 1000).toISOString()
              : null,
          })
          .eq("gateway", "razorpay")
          .eq("gateway_subscription_id", entity.id);
        if (error) console.error(`failed to update subscription on ${event.event}`, error);
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const { error } = await admin
          .from("subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("gateway", "razorpay")
          .eq("gateway_subscription_id", entity.id);
        if (error) console.error(`failed to update subscription on ${event.event}`, error);
        break;
      }

      default:
        // Unhandled event types are expected and fine to ignore.
        break;
    }
  }

  return jsonResponse({ received: true });
});

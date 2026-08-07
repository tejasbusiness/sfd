// Server-side checkout session creation for Razorpay (INR) / Stripe (USD).
// This is the ONLY place gateway secret keys are used — client code never
// sees RAZORPAY_KEY_SECRET or STRIPE_SECRET_KEY, only the checkout URL this
// function returns. src/lib/payments/index.ts (Rule A) calls this function
// rather than any gateway SDK directly, so the currency-to-gateway routing
// lives in exactly one place (mirrored here and in migration 0003's
// payment_gateway_map setting — see the routing logic below).
//
// Written as a plain Deno.serve handler — see the comment at the top of
// supabase/functions/create-booking/index.ts for why (@supabase/server's
// withSupabase wrapper rejects this project's classic JWT key format).
//
// CREDENTIAL GAP (flagged in docs/logs.md): RAZORPAY_KEY_ID/KEY_SECRET and
// STRIPE_SECRET_KEY are not yet configured in .env.local — this function
// fails soft with a clear 501 "not configured" response rather than a raw
// gateway SDK error, so the rest of the checkout UI can be built and tested
// (error state, loading state) before real test-mode keys are supplied.
//
// To invoke locally once keys exist:
//   curl -X POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
//     --header 'apikey: <ANON_KEY>' --header 'Content-Type: application/json' \
//     --data '{"tierId":"...","currency":"USD","clientEmail":"jane@example.com"}'

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CreateCheckoutRequest {
  tierId: string;
  currency: "INR" | "USD";
  clientEmail: string;
  clientFullName?: string;
  leadId?: string;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

function jsonOk(payload: unknown) {
  return Response.json(payload, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function createRazorpaySubscription(
  _tier: { id: string; name: string; price_inr_paise: number },
  _clientEmail: string,
): Promise<{ gatewaySubscriptionId: string; checkoutUrl: string }> {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    throw new Error("NOT_CONFIGURED:Razorpay");
  }

  // Razorpay Subscriptions requires a pre-created Plan; in a fully wired
  // setup the plan_id would be stored on the pricing_tiers row (e.g. a
  // gateway_plan_id column) once tiers are synced to Razorpay's dashboard.
  // Left as a clear runtime error rather than guessed at, since inventing a
  // plan ID would silently produce a broken checkout.
  throw new Error(
    "RAZORPAY_PLAN_NOT_CONFIGURED: pricing_tiers has no Razorpay plan_id mapping yet — sync tiers to Razorpay and store the plan_id before enabling INR checkout.",
  );
}

async function createStripeCheckoutSession(
  tier: { id: string; name: string; price_usd_cents: number },
  clientEmail: string,
): Promise<{ gatewaySubscriptionId: string; checkoutUrl: string }> {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("NOT_CONFIGURED:Stripe");
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": tier.name,
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][unit_amount]": String(tier.price_usd_cents),
    "line_items[0][quantity]": "1",
    customer_email: clientEmail,
    success_url: `${siteUrl}/pricing?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=canceled`,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("stripe checkout session error", JSON.stringify(data));
    throw new Error(`Stripe error: ${data.error?.message ?? "unknown"}`);
  }

  return { gatewaySubscriptionId: data.id, checkoutUrl: data.url };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  let body: CreateCheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { tierId, currency, clientEmail } = body;
  if (!tierId || !currency || !clientEmail) {
    return jsonError("tierId, currency, and clientEmail are required", 400);
  }
  if (currency !== "INR" && currency !== "USD") {
    return jsonError("currency must be INR or USD", 400);
  }

  const { data: tier, error: tierError } = await admin
    .from("pricing_tiers")
    .select("id, name, price_usd_cents, price_inr_paise, is_published")
    .eq("id", tierId)
    .maybeSingle();

  if (tierError) return jsonError("Failed to look up pricing tier", 500);
  if (!tier || !tier.is_published) return jsonError("Pricing tier not found", 404);

  try {
    // Currency-to-gateway routing (mirrors migration 0003's
    // payment_gateway_map setting: INR -> razorpay, USD -> stripe).
    const gateway = currency === "INR" ? "razorpay" : "stripe";
    const result =
      gateway === "razorpay"
        ? await createRazorpaySubscription(tier, clientEmail)
        : await createStripeCheckoutSession(tier, clientEmail);

    const { error: insertError } = await admin.from("subscriptions").insert({
      tier_id: tier.id,
      lead_id: body.leadId ?? null,
      gateway,
      gateway_subscription_id: result.gatewaySubscriptionId,
      currency,
      status: "trialing",
    });

    if (insertError) {
      console.error("subscription insert error", JSON.stringify(insertError));
      // The gateway session was already created at this point — do not fail
      // the checkout over a logging issue; the webhook will reconcile state
      // once the subscription activates. Surfacing this as a 500 here would
      // strand a paying customer who already has a valid checkout URL.
    }

    return jsonOk({ checkoutUrl: result.checkoutUrl, gateway });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("NOT_CONFIGURED:")) {
      const gatewayName = message.split(":")[1];
      return jsonError(
        `${gatewayName} is not configured yet. Add API keys to your environment to enable checkout.`,
        501,
      );
    }
    if (message.startsWith("RAZORPAY_PLAN_NOT_CONFIGURED:")) {
      return jsonError(
        "Razorpay checkout isn't fully set up yet — pricing tiers need to be synced to Razorpay first.",
        501,
      );
    }
    console.error("checkout session creation failed", message);
    return jsonError("Failed to start checkout. Please try again.", 500);
  }
});

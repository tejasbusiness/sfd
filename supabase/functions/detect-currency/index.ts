// Server-side IP geolocation for the pricing page's default currency, per
// docs/05: India-based visitors default to INR, everyone else to USD. Runs
// server-side (not client-side) since geolocation-by-IP requires seeing the
// real client IP, which is only reliably available server-side behind Kong's
// X-Forwarded-For header, not from the browser.
//
// Written as a plain Deno.serve handler — see the comment at the top of
// supabase/functions/create-booking/index.ts for why (@supabase/server's
// withSupabase wrapper rejects this project's classic JWT key format).
//
// No GEOLOCATION_API_KEY is configured yet (flagged as a Phase 3 credential
// gap — see docs/logs.md). This function is written to prefer a paid
// provider via GEOLOCATION_API_KEY if one is ever configured, but defaults
// to ip-api.com's free, no-key-required tier so currency detection works
// out of the box. Free-tier rate limits (45 req/min) are a real constraint
// worth reconsidering before high traffic — see the fallback below.
//
// Always fails soft: any lookup failure returns USD (the safer default,
// since showing USD to an Indian visitor is a worse rate but not a broken
// price, whereas showing INR to a non-Indian visitor understates the price).
//
// To invoke locally (loopback IP will not resolve to a country, expect the
// USD fallback unless you pass a real IP via X-Forwarded-For):
//   curl 'http://127.0.0.1:54321/functions/v1/detect-currency' \
//     --header 'apikey: <ANON_KEY from `supabase status`>' \
//     --header 'X-Forwarded-For: 103.21.244.0'

import "@supabase/functions-js/edge-runtime.d.ts";

interface DetectCurrencyResponse {
  currency: "INR" | "USD";
  countryCode: string | null;
  source: "geolocation" | "fallback";
}

function jsonResponse(payload: DetectCurrencyResponse) {
  return Response.json(payload, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

function extractClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // First entry is the original client; later entries are proxies.
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip");
}

async function lookupCountryCode(ip: string): Promise<string | null> {
  const apiKey = Deno.env.get("GEOLOCATION_API_KEY");

  try {
    if (apiKey) {
      // Placeholder for a paid provider (e.g. ipapi.co, ipinfo.io) once the
      // user configures one — shape left generic since no provider is
      // confirmed yet; adjust the URL/response parsing to match whichever
      // provider's key format ends up in GEOLOCATION_API_KEY.
      const res = await fetch(`https://ipapi.co/${ip}/country/?key=${apiKey}`);
      if (res.ok) {
        const code = (await res.text()).trim();
        if (code && code.length === 2) return code.toUpperCase();
      }
    }

    // Free, no-key fallback.
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.countryCode === "string" ? data.countryCode : null;
  } catch (err) {
    console.error("geolocation lookup failed", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  const ip = extractClientIp(req);

  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    // Local/loopback — no meaningful geolocation possible.
    return jsonResponse({ currency: "USD", countryCode: null, source: "fallback" });
  }

  const countryCode = await lookupCountryCode(ip);

  if (!countryCode) {
    return jsonResponse({ currency: "USD", countryCode: null, source: "fallback" });
  }

  return jsonResponse({
    currency: countryCode === "IN" ? "INR" : "USD",
    countryCode,
    source: "geolocation",
  });
});

// Sends a real test email for the admin Settings > Email/SMTP "Send a test
// mail to" field. Admin-only: the caller's JWT is checked against
// profiles.role manually (verify_jwt = false, same reasoning as every other
// function in this project — see google-drive-oauth-start/index.ts for the
// full rationale on this repo's classic-JWT-key standardization).
//
// SMTP connection config + credentials are read from the `smtp` settings row
// (DB-stored per this session's secrets-handling decision — see
// docs/logs.md), not environment variables.
//
// SMTP protocol implementation lives in ../_shared/smtp.ts (extracted so
// send-email, Phase 5's automated-sequence sender, reuses the exact same,
// already-verified client instead of a second copy that could drift) — see
// docs/logs.md's 2026-08-07 entries for the two real hang bugs found and
// fixed against a real Hostinger server.
//
// CREDENTIAL GAP: until real SMTP host/user/password are saved via the
// Settings UI, this fails soft with a clear "not configured" message.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { type SmtpSettingsValue, sendSingleEmail } from "../_shared/smtp.ts";

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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

  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return jsonResponse({ error: "Missing Authorization header" }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return jsonResponse({ error: "Invalid session" }, 401);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return jsonResponse({ error: "Admins only" }, 403);
  }

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const to = body.to?.trim();
  if (!to) return jsonResponse({ error: "A recipient email address is required" }, 400);

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "smtp")
    .maybeSingle();

  if (settingError) return jsonResponse({ error: "Failed to load SMTP settings" }, 500);

  const smtp = (setting?.value as SmtpSettingsValue | null) ?? {};
  if (!smtp.host || !(smtp.from_email || smtp.from_address)) {
    return jsonResponse(
      { error: "SMTP is not fully configured yet — host and from email are required. Save them in Settings first." },
      501,
    );
  }

  try {
    await sendSingleEmail(
      smtp,
      to,
      "SynergyFirst Digital — SMTP test email",
      "This is a test email sent from the SynergyFirst Digital admin Settings page to confirm your SMTP configuration is working.",
    );
    return jsonResponse({ sent: true, to });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-test-email failed", message);
    return jsonResponse({ error: `Failed to send test email: ${message}` }, 502);
  }
});

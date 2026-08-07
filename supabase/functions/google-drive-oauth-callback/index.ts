// Google OAuth redirect target — receives the authorization `code`,
// exchanges it for access/refresh tokens via Google's token endpoint, and
// upserts them into public.integration_tokens (service role, bypasses RLS —
// this table has no client-writable policy at all, only this function and
// the admin-only read policy touch it, see 0020_google_drive_tokens.sql).
//
// Redirects back to /admin/settings with a ?google_drive= query param so the
// Settings UI can show a success/error toast-equivalent message. No secrets
// are ever placed in that redirect URL — only a status flag.
//
// verify_jwt is off for this function (see supabase/config.toml) since
// Google, not our own app, calls this endpoint directly with no Supabase
// session attached — the same reasoning as stripe-webhook/razorpay-webhook.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function redirectTo(siteUrl: string, status: "success" | "error", message?: string) {
  const url = new URL(`${siteUrl}/admin/settings`);
  url.searchParams.set("google_drive", status);
  if (message) url.searchParams.set("google_drive_message", message);
  return Response.redirect(url.toString(), 302);
}

Deno.serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
  const reqUrl = new URL(req.url);
  const code = reqUrl.searchParams.get("code");
  const oauthError = reqUrl.searchParams.get("error");

  if (oauthError) {
    return redirectTo(siteUrl, "error", oauthError);
  }
  if (!code) {
    return redirectTo(siteUrl, "error", "missing_code");
  }

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "integration")
    .maybeSingle();

  if (settingError) {
    console.error("failed to load integration settings", settingError);
    return redirectTo(siteUrl, "error", "settings_load_failed");
  }

  const googleDrive = (setting?.value as { google_drive?: { client_id?: string; client_secret?: string } } | null)
    ?.google_drive;
  const clientId = googleDrive?.client_id;
  const clientSecret = googleDrive?.client_secret;

  if (!clientId || !clientSecret) {
    return redirectTo(siteUrl, "error", "not_configured");
  }

  const redirectUri = `${siteUrl}/google-drive-oauth-callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("google token exchange failed", JSON.stringify(tokenData));
    return redirectTo(siteUrl, "error", "token_exchange_failed");
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  const { error: upsertError } = await admin
    .from("integration_tokens")
    .upsert(
      {
        provider: "google_drive",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? null,
        expires_at: expiresAt,
      },
      { onConflict: "provider" },
    );

  if (upsertError) {
    console.error("failed to store google drive token", upsertError);
    return redirectTo(siteUrl, "error", "token_store_failed");
  }

  return redirectTo(siteUrl, "success");
});

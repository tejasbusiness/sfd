// Builds and returns the Google OAuth consent URL for the admin Settings >
// Company > Integration > Google Drive "Connect" button. Admin-only: the
// caller's JWT (forwarded from the browser session) is checked against
// profiles.role directly, since verify_jwt is off for this function (see
// supabase/config.toml — same reasoning as every other function in this
// project: this repo standardized on classic JWT anon/service-role keys,
// so the caller's access token is validated manually here rather than via
// @supabase/server's withSupabase wrapper, which only supports the newer
// sb_publishable_/sb_secret_ key format).
//
// client_id/client_secret are read from the `integration` settings row
// (DB-stored per this session's explicit secrets-handling decision — see
// docs/logs.md), not environment variables.
//
// CREDENTIAL GAP: until a real Google Cloud OAuth app's client_id/secret are
// saved via the Settings UI, this fails soft with a clear "not configured"
// message rather than building a broken consent URL.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

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

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "integration")
    .maybeSingle();

  if (settingError) return jsonResponse({ error: "Failed to load integration settings" }, 500);

  const googleDrive = (setting?.value as { google_drive?: { client_id?: string; client_secret?: string } } | null)
    ?.google_drive;
  const clientId = googleDrive?.client_id;

  if (!clientId) {
    return jsonResponse(
      { error: "Google Drive client ID/secret not configured. Save them in Settings first." },
      501,
    );
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
  const redirectUri = `${siteUrl}/google-drive-oauth-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return jsonResponse({ url });
});

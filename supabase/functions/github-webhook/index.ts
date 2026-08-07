// GitHub webhook receiver — verifies the X-Hub-Signature-256 header (HMAC
// SHA-256 over the raw request body, keyed by the stored webhook token) per
// GitHub's documented algorithm, then persists push-event commits into
// public.github_webhook_events (service role). Mirrors the exact signature-
// verification shape already used in stripe-webhook/razorpay-webhook — see
// that file's comment for why this is a plain Deno.serve handler rather than
// @supabase/server's withSupabase wrapper.
//
// Security boundary: the webhook_token stored in the `integration` settings
// row IS the shared secret configured on the GitHub repository's webhook —
// never trust an unsigned or wrongly-signed request here.
//
// task_id is extracted from a trailing "#<id>" in each commit message per
// this project's documented convention (e.g. "Fixes login bug #10"). This
// function does NOT attempt to link task_id to any tickets/tasks row — no
// generic "task" entity exists in this schema yet (closest analog is
// `tickets`), so linking stays at "extracted and stored" only.
//
// The URL path segment after /github-webhook/ is expected to be the caller's
// webhook_token — GitHub doesn't let us inject custom query params easily
// into every webhook UI, so the token doubles as both the signing secret and
// a path segment for easy identification in logs; the signature check below
// is still the actual security boundary, not the path match.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

async function verifyGithubSignature(payload: string, signatureHeader: string, secret: string): Promise<boolean> {
  const [algo, signature] = signatureHeader.split("=");
  if (algo !== "sha256" || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === signature;
}

function extractTaskId(commitMessage: string): string | null {
  const match = commitMessage.match(/#(\d+)\s*$/);
  return match ? match[1] : null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "integration")
    .maybeSingle();

  if (settingError) {
    console.error("failed to load integration settings", settingError);
    return jsonResponse({ error: "Failed to load integration settings" }, 500);
  }

  const github = (setting?.value as { github?: { enabled?: boolean; webhook_token?: string } } | null)?.github;

  if (!github?.enabled || !github?.webhook_token) {
    return jsonResponse(
      { error: "GitHub integration is not configured yet — enable it and save a webhook token in Settings." },
      501,
    );
  }

  const signatureHeader = req.headers.get("x-hub-signature-256");
  if (!signatureHeader) return jsonResponse({ error: "Missing X-Hub-Signature-256 header" }, 400);

  const rawBody = await req.text();
  const isValid = await verifyGithubSignature(rawBody, signatureHeader, github.webhook_token);
  if (!isValid) {
    console.error("github webhook signature verification failed");
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const eventType = req.headers.get("x-github-event") ?? "unknown";
  const payload = JSON.parse(rawBody);

  if (eventType === "push" && Array.isArray(payload.commits)) {
    const rows = payload.commits.map((commit: { message?: string }) => ({
      event_type: eventType,
      commit_message: commit.message ?? null,
      task_id: commit.message ? extractTaskId(commit.message) : null,
      raw_payload: commit,
    }));

    if (rows.length > 0) {
      const { error: insertError } = await admin.from("github_webhook_events").insert(rows);
      if (insertError) console.error("failed to insert github_webhook_events", insertError);
    }
  } else {
    const { error: insertError } = await admin.from("github_webhook_events").insert({
      event_type: eventType,
      commit_message: null,
      task_id: null,
      raw_payload: payload,
    });
    if (insertError) console.error("failed to insert github_webhook_events", insertError);
  }

  return jsonResponse({ received: true });
});

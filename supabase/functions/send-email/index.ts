// Sends one automated-sequence email (docs/09) by trigger_key: loads the
// matching row from email_templates, renders {{merge_field}} substitutions,
// sends via SMTP (settings.smtp — same shared client as send-test-email),
// and logs the attempt to email_trigger_log regardless of success/failure,
// so admins can audit what actually went out and scheduled sweeps
// (run-email-sweeps) can dedup against it.
//
// Called from two places: (1) instant triggers, right after the code path
// that created the notifying row (submitLead, create-booking, ticket status
// update to "resolved") — same "client/caller fires it, Postgres can't call
// HTTP itself" pattern already used for send-push; (2) run-email-sweeps, for
// the two triggers that are time-based rather than event-based
// (booking_reminder_24h, lead_followup_nudge, project_completed_whatsapp_intro).
//
// Privileged (service-role): needs to read email_templates/settings and
// write email_trigger_log regardless of caller — this is an internal
// automation entry point, not something the browser calls with a user JWT
// (verify_jwt = false, same as every other function in this repo).
//
// CREDENTIAL GAP: if SMTP isn't configured, or the trigger_key has no
// matching template, this fails soft (501/404) and still logs the attempt
// with a status of "failed" + error_message, rather than silently no-op'ing —
// so a misconfigured deployment is visible in email_trigger_log, not just
// silent lost mail.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { type SmtpSettingsValue, sendSingleEmail } from "../_shared/smtp.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

interface SendEmailRequest {
  triggerKey?: string;
  to?: string;
  /** Alternative to `to` — resolves the recipient's email from auth.users, for
   * callers that only have a client_id on hand (e.g. ticket status updates:
   * tickets/profiles carry no email column, only auth.users does, which
   * isn't reachable via a client-side RLS-scoped query). */
  clientId?: string;
  mergeFields?: Record<string, string>;
  leadId?: string;
  bookingId?: string;
  ticketId?: string;
}

/** Replaces every {{field}} in text with mergeFields[field], leaving unknown fields as literal text rather than throwing — a template referencing a field the caller forgot to pass shouldn't crash the send. */
function renderTemplate(text: string, mergeFields: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, field) =>
    Object.prototype.hasOwnProperty.call(mergeFields, field) ? mergeFields[field] : match,
  );
}

async function logAttempt(params: {
  triggerKey: string;
  to: string;
  status: "sent" | "failed";
  errorMessage?: string;
  leadId?: string;
  bookingId?: string;
  ticketId?: string;
}) {
  await admin.from("email_trigger_log").insert({
    trigger_key: params.triggerKey,
    recipient_email: params.to,
    status: params.status,
    error_message: params.errorMessage ?? null,
    lead_id: params.leadId ?? null,
    booking_id: params.bookingId ?? null,
    ticket_id: params.ticketId ?? null,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: SendEmailRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const triggerKey = body.triggerKey?.trim();
  if (!triggerKey) return jsonResponse({ error: "triggerKey is required" }, 400);

  let to = body.to?.trim();
  if (!to && body.clientId) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(body.clientId);
    if (userError || !userData?.user?.email) {
      return jsonResponse({ error: `Could not resolve an email for clientId ${body.clientId}` }, 404);
    }
    to = userData.user.email;
  }
  if (!to) return jsonResponse({ error: "Either to or clientId is required" }, 400);
  const mergeFields = body.mergeFields ?? {};

  const { data: template, error: templateError } = await admin
    .from("email_templates")
    .select("subject, body_html, is_active")
    .eq("trigger_key", triggerKey)
    .maybeSingle();

  if (templateError) {
    console.error("failed to load email template", templateError);
    return jsonResponse({ error: "Failed to load email template" }, 500);
  }
  if (!template) {
    return jsonResponse({ error: `No email template found for trigger_key "${triggerKey}"` }, 404);
  }
  if (!template.is_active) {
    // Deliberately not an error — an admin disabling a sequence is a normal
    // config state, not a failure. Still logged, so the audit trail shows
    // why nothing was sent.
    await logAttempt({ triggerKey, to, status: "failed", errorMessage: "Template is inactive", ...idsFrom(body) });
    return jsonResponse({ sent: false, reason: "Template is inactive" });
  }

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "smtp")
    .maybeSingle();

  if (settingError) {
    await logAttempt({ triggerKey, to, status: "failed", errorMessage: "Failed to load SMTP settings", ...idsFrom(body) });
    return jsonResponse({ error: "Failed to load SMTP settings" }, 500);
  }

  const smtp = (setting?.value as SmtpSettingsValue | null) ?? {};
  if (!smtp.host || !(smtp.from_email || smtp.from_address)) {
    const message = "SMTP is not fully configured yet — set it up in Settings first.";
    await logAttempt({ triggerKey, to, status: "failed", errorMessage: message, ...idsFrom(body) });
    return jsonResponse({ error: message }, 501);
  }

  const subject = renderTemplate(template.subject, mergeFields);
  const html = renderTemplate(template.body_html, mergeFields);

  try {
    await sendSingleEmail(smtp, to, subject, html, true);
    await logAttempt({ triggerKey, to, status: "sent", ...idsFrom(body) });
    return jsonResponse({ sent: true, to, triggerKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`send-email failed for trigger_key=${triggerKey}`, message);
    await logAttempt({ triggerKey, to, status: "failed", errorMessage: message, ...idsFrom(body) });
    return jsonResponse({ error: `Failed to send email: ${message}` }, 502);
  }
});

function idsFrom(body: SendEmailRequest) {
  return { leadId: body.leadId, bookingId: body.bookingId, ticketId: body.ticketId };
}

// Periodic sweep for the three time-based email triggers (docs/09) that
// aren't a reaction to a single insert/update: booking_reminder_24h,
// lead_followup_nudge, project_completed_whatsapp_intro. Postgres has no
// pg_cron enabled in this project (deliberately — see docs/logs.md, same
// "minimize VPS infra footprint" reasoning that kept pg_net-based DB
// webhooks out of the Web Push design), so this function is meant to be hit
// periodically by a plain OS-level cron job (VPS crontab + curl), not
// triggered by the database itself.
//
// Protected by a shared secret (CRON_SECRET) rather than a user JWT, since
// the caller is a cron job, not a signed-in admin — verify_jwt = false like
// every function in this repo (classic-JWT-key standardization), but this
// one additionally checks a bearer secret because it's meant to be called
// unauthenticated-by-Supabase-standards on a schedule, not on demand by the
// admin app.
//
// Dedup: email_trigger_log is checked before sending each category so a
// sweep run twice (e.g. cron overlap, manual re-trigger) doesn't double-send
// — see the email_trigger_log_key_lead_idx index (migration 0009) and its
// comment, which anticipated exactly this use.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

const FOLLOWUP_NUDGE_DAYS = 3;
const REMINDER_WINDOW_START_HOURS = 23;
const REMINDER_WINDOW_END_HOURS = 25; // a ~2h window around "24h before" so an hourly-or-finer cron never misses or double-fires a given booking

async function callSendEmail(params: {
  triggerKey: string;
  to: string;
  mergeFields: Record<string, string>;
  leadId?: string;
  bookingId?: string;
  ticketId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      triggerKey: params.triggerKey,
      to: params.to,
      mergeFields: params.mergeFields,
      leadId: params.leadId,
      bookingId: params.bookingId,
      ticketId: params.ticketId,
    }),
  });
  if (res.ok) return { ok: true };
  const json = await res.json().catch(() => ({}));
  return { ok: false, error: json.error ?? `HTTP ${res.status}` };
}

async function alreadySent(triggerKey: string, params: { leadId?: string; bookingId?: string }): Promise<boolean> {
  let query = admin
    .from("email_trigger_log")
    .select("id", { count: "exact", head: true })
    .eq("trigger_key", triggerKey)
    .eq("status", "sent");
  if (params.leadId) query = query.eq("lead_id", params.leadId);
  if (params.bookingId) query = query.eq("booking_id", params.bookingId);
  const { count, error } = await query;
  if (error) {
    console.error("alreadySent check failed", error);
    return true; // fail closed — better to skip a send than risk a duplicate on a query error
  }
  return (count ?? 0) > 0;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function sweepBookingReminders(): Promise<{ sent: number; skipped: number; failed: number }> {
  const windowStart = new Date(Date.now() + REMINDER_WINDOW_START_HOURS * 3600_000).toISOString();
  const windowEnd = new Date(Date.now() + REMINDER_WINDOW_END_HOURS * 3600_000).toISOString();

  const { data: bookings, error } = await admin
    .from("bookings")
    .select("id, starts_at, client_full_name, client_email, service:services(name)")
    .in("status", ["confirmed", "rescheduled"])
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd)
    .eq("is_test", false);

  if (error) {
    console.error("sweepBookingReminders query failed", error);
    return { sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0, skipped = 0, failed = 0;
  for (const booking of bookings ?? []) {
    if (!booking.client_email) { skipped++; continue; }
    if (await alreadySent("booking_reminder_24h", { bookingId: booking.id })) { skipped++; continue; }

    const service = booking.service as unknown as { name: string } | null;
    const result = await callSendEmail({
      triggerKey: "booking_reminder_24h",
      to: booking.client_email,
      mergeFields: { name: booking.client_full_name, service: service?.name ?? "your appointment", date: formatDateTime(booking.starts_at) },
      bookingId: booking.id,
    });
    if (result.ok) sent++; else failed++;
  }
  return { sent, skipped, failed };
}

async function sweepLeadFollowups(): Promise<{ sent: number; skipped: number; failed: number }> {
  const cutoff = new Date(Date.now() - FOLLOWUP_NUDGE_DAYS * 24 * 3600_000).toISOString();

  const { data: leads, error } = await admin
    .from("leads")
    .select("id, full_name, email, created_at, entry_service:services(name)")
    .eq("status", "new")
    .lt("created_at", cutoff)
    .eq("is_test", false);

  if (error) {
    console.error("sweepLeadFollowups query failed", error);
    return { sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0, skipped = 0, failed = 0;
  for (const lead of leads ?? []) {
    if (await alreadySent("lead_followup_nudge", { leadId: lead.id })) { skipped++; continue; }

    const entryService = lead.entry_service as unknown as { name: string } | null;
    const result = await callSendEmail({
      triggerKey: "lead_followup_nudge",
      to: lead.email,
      mergeFields: { name: lead.full_name, service: entryService?.name ?? "our services" },
      leadId: lead.id,
    });
    if (result.ok) sent++; else failed++;
  }
  return { sent, skipped, failed };
}

async function sweepProjectCompletedWhatsappIntro(): Promise<{ sent: number; skipped: number; failed: number }> {
  // project_status is a free-text column (not an enum — see migration 0005's
  // comment), so this deliberately only matches the exact "completed" value
  // that AdminBookingFormPage's status control writes, not a loose pattern.
  const { data: bookings, error } = await admin
    .from("bookings")
    .select("id, client_full_name, client_email, service:services(name)")
    .eq("project_status", "completed")
    .eq("is_test", false);

  if (error) {
    console.error("sweepProjectCompletedWhatsappIntro query failed", error);
    return { sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0, skipped = 0, failed = 0;
  for (const booking of bookings ?? []) {
    if (!booking.client_email) { skipped++; continue; }
    if (await alreadySent("project_completed_whatsapp_intro", { bookingId: booking.id })) { skipped++; continue; }

    const service = booking.service as unknown as { name: string } | null;
    const result = await callSendEmail({
      triggerKey: "project_completed_whatsapp_intro",
      to: booking.client_email,
      mergeFields: {
        name: booking.client_full_name,
        service: service?.name ?? "your project",
        practice_name: booking.client_full_name,
      },
      bookingId: booking.id,
    });
    if (result.ok) sent++; else failed++;
  }
  return { sent, skipped, failed };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) {
    return jsonResponse({ error: "run-email-sweeps is not configured yet — CRON_SECRET missing." }, 501);
  }
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const [bookingReminders, leadFollowups, whatsappIntro] = await Promise.all([
    sweepBookingReminders(),
    sweepLeadFollowups(),
    sweepProjectCompletedWhatsappIntro(),
  ]);

  return jsonResponse({
    booking_reminder_24h: bookingReminders,
    lead_followup_nudge: leadFollowups,
    project_completed_whatsapp_intro: whatsappIntro,
  });
});

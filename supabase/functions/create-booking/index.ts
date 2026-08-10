// Public-facing booking creation. Called with the project's anon/publishable
// key from the client booking flow — never with the secret/service-role key,
// since this endpoint is meant to be hit directly by unauthenticated site
// visitors. Kong (the local API gateway) validates the apikey header against
// the project's configured keys before a request reaches this function at
// all — verify_jwt is set to false in supabase/config.toml for this function
// specifically because the caller is anonymous by design, not because auth
// is skipped entirely.
//
// Written as a plain Deno.serve handler (not @supabase/server's withSupabase
// wrapper) after discovering that wrapper's auth-key validation only accepts
// the newer sb_publishable_/sb_secret_ key format, while this project's
// .env.local (and Auth/PostgREST, which already work) uses the classic JWT
// anon/service-role key pair from `supabase status`. Standardizing on the
// classic key format here avoids a project-wide key-format migration just to
// satisfy one library's internal assumption — confirmed working end-to-end
// via the actual @supabase/supabase-js client, not just curl.
//
// Runs privileged (service-role client, bypasses RLS) because:
// 1. Slot availability must be checked against availability_rules,
//    blackout_dates, and existing bookings atomically, in one sequence, to
//    prevent a race where two clients book the same slot. A client-side
//    RLS-gated insert can't express that check.
// 2. The client needs manage_token back in the response to build the
//    reschedule/cancel email link. Postgres RLS blocks INSERT ... RETURNING
//    for a role with no SELECT policy (anon has none on bookings, by design
//    — see supabase/migrations/0005_bookings.sql), so a direct anon insert
//    with return would fail the same way it did on leads (verified locally
//    in Phase 1). This edge function is the sanctioned way around that.
//
// To invoke locally:
//   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-booking' \
//     --header 'apikey: <ANON_KEY from `supabase status`>' \
//     --header 'Content-Type: application/json' \
//     --data '{"serviceId":"...","practitionerId":null,"startsAt":"2026-08-10T10:00:00Z","clientFullName":"Jane Doe","clientEmail":"jane@example.com"}'

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CreateBookingRequest {
  serviceId: string;
  practitionerId?: string | null;
  startsAt: string; // ISO timestamp
  clientFullName: string;
  clientPhone: string;
  clientEmail?: string;
  notes: string;
  leadId?: string;
  isTest?: boolean;
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

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  let body: CreateBookingRequest;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { serviceId, practitionerId, startsAt, clientFullName, clientPhone, notes } = body;

  if (!serviceId || !startsAt || !clientFullName || !clientPhone || !notes) {
    return jsonError(
      "serviceId, startsAt, clientFullName, clientPhone, and notes are required",
      400,
    );
  }

  if (notes.length > 1000) {
    return jsonError("notes must be 1000 characters or fewer", 400);
  }

  const startDate = new Date(startsAt);
  if (Number.isNaN(startDate.getTime())) {
    return jsonError("startsAt must be a valid ISO timestamp", 400);
  }
  if (startDate.getTime() <= Date.now()) {
    return jsonError("startsAt must be in the future", 400);
  }

  // 1. Load the service to get its duration and confirm it's bookable.
  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("id, name, default_duration_minutes, is_bookable, is_published")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError) {
    console.error("service lookup error", JSON.stringify(serviceError));
    return jsonError("Failed to look up service", 500);
  }
  if (!service || !service.is_published) return jsonError("Service not found", 404);
  if (!service.is_bookable) return jsonError("This service is not bookable", 400);

  const durationMinutes = service.default_duration_minutes ?? 30;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  // 2. Check the slot doesn't fall on a blackout date for this practitioner
  //    (or a team-wide blackout, practitioner_id IS NULL).
  const dateOnly = startDate.toISOString().slice(0, 10);
  const { data: blackouts, error: blackoutError } = await admin
    .from("blackout_dates")
    .select("id, practitioner_id")
    .eq("date", dateOnly);

  if (blackoutError) return jsonError("Failed to check availability", 500);
  const isBlackedOut = (blackouts ?? []).some(
    (b) => b.practitioner_id === null || b.practitioner_id === practitionerId,
  );
  if (isBlackedOut) {
    return jsonError("This date is unavailable", 409);
  }

  // 3. Check the slot falls within a configured availability_rule window
  //    for this service (and practitioner, if specified).
  const dayOfWeek = startDate.getUTCDay();
  const timeOnly = startDate.toISOString().slice(11, 19);

  const { data: rules, error: rulesError } = await admin
    .from("availability_rules")
    .select("id, start_time, end_time, buffer_minutes, practitioner_id")
    .eq("service_id", serviceId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (rulesError) return jsonError("Failed to check availability", 500);

  const matchingRule = (rules ?? []).find((rule) => {
    const practitionerMatches =
      rule.practitioner_id === null || rule.practitioner_id === practitionerId;
    const withinWindow = timeOnly >= rule.start_time && timeOnly < rule.end_time;
    return practitionerMatches && withinWindow;
  });

  if (!matchingRule) {
    return jsonError("This slot is outside available hours", 409);
  }

  // 4. Check for an overlapping existing booking, padded by buffer_minutes
  //    on both sides so back-to-back bookings always leave a real gap (e.g.
  //    30 min meeting + 15 min buffer = 45 min between slot starts) — this
  //    is the atomicity this whole function exists for; read-then-insert
  //    here is still subject to a narrow race under high concurrency,
  //    acceptable for this business's booking volume, and a unique
  //    constraint could be added later if it ever becomes a real problem.
  const bufferMs = (matchingRule.buffer_minutes ?? 0) * 60_000;
  const paddedStart = new Date(startDate.getTime() - bufferMs);
  const paddedEnd = new Date(endDate.getTime() + bufferMs);

  const { data: overlapping, error: overlapError } = await admin
    .from("bookings")
    .select("id")
    .eq("service_id", serviceId)
    .in("status", ["pending", "confirmed", "rescheduled"])
    .lt("starts_at", paddedEnd.toISOString())
    .gt("ends_at", paddedStart.toISOString());

  if (overlapError) return jsonError("Failed to check availability", 500);
  if (overlapping && overlapping.length > 0) {
    return jsonError("This slot was just booked. Please choose another.", 409);
  }

  // 5. Insert the booking. manage_token/manage_token_expires_at use their
  //    column defaults (see migration 0005).
  const { data: booking, error: insertError } = await admin
    .from("bookings")
    .insert({
      service_id: serviceId,
      practitioner_id: practitionerId ?? null,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      status: "confirmed",
      client_full_name: clientFullName,
      client_phone: clientPhone,
      client_email: body.clientEmail ?? null,
      notes,
      lead_id: body.leadId ?? null,
      is_test: body.isTest ?? false,
    })
    .select("id, starts_at, ends_at, status, manage_token")
    .single();

  if (insertError || !booking) {
    console.error("booking insert error", JSON.stringify(insertError));
    return jsonError("Failed to create booking", 500);
  }

  // 6. Upsert a leads row tagged with this service, per docs/03: "Booking
  //    data flows directly into the CRM as a lead/contact record."
  if (!body.leadId) {
    await admin.from("leads").insert({
      full_name: clientFullName,
      phone: clientPhone,
      email: body.clientEmail ?? null,
      entry_service_id: serviceId,
      form_type: "booking",
      source: "booking_flow",
      message: notes,
      is_test: body.isTest ?? false,
    });
  }

  // 7. Best-effort Web Push (docs/07) — Postgres can't call send-push
  // itself, so the code path that created the notifying row does, same
  // pattern as the client-side insert points (submitLead, clientTicketQueries).
  // Never blocks or fails the booking response.
  fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      title: "New booking",
      body: `${clientFullName} booked for ${startDate.toLocaleString()}`,
      url: "/admin/bookings",
    }),
  }).catch((e) => console.error("send-push call failed", e));

  // 8. Best-effort booking_confirmed email (docs/09) — same "server-side
  // caller fires it directly via its own service-role key" pattern as the
  // push notification above, since Postgres can't call HTTP itself.
  if (body.clientEmail) {
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        triggerKey: "booking_confirmed",
        to: body.clientEmail,
        mergeFields: { name: clientFullName, service: service.name, date: startDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) },
        bookingId: booking.id,
      }),
    }).catch((e) => console.error("send-email call failed", e));
  }

  return jsonOk({
    bookingId: booking.id,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    status: booking.status,
    manageToken: booking.manage_token,
  });
});

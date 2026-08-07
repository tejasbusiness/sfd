// Token-based booking lookup, reschedule, and cancel — no login required, per
// docs/03. The token is opaque (32+ random hex chars, see migration 0005 and
// the reissue logic below) and passed as a query param / body field, never
// derived from anything guessable.
//
// Written as a plain Deno.serve handler, not @supabase/server's withSupabase
// wrapper — see the comment at the top of supabase/functions/create-booking/
// index.ts for why (that wrapper's key-format validation rejects this
// project's classic JWT anon/service-role keys, confirmed via direct testing
// with the real @supabase/supabase-js client).
//
// Token lifecycle (decided here, since docs/03 left expiry/reuse unspecified):
// - manage_token_expires_at: 30 days from booking creation (column default).
//   After expiry, the link stops working — client must contact support
//   directly rather than self-serve, since a stale link a client bookmarked
//   for months is a bigger risk surface than a short-lived one.
// - Cancel is idempotent-safe: canceling an already-canceled booking with the
//   same token just returns success, since a client double-clicking "cancel"
//   shouldn't see a scary error.
// - Reschedule reissues a NEW manage_token, so a leaked/previously-emailed
//   link can't be replayed to move a booking again after the client already
//   rescheduled it via a fresher link (e.g. from a follow-up reminder
//   email). The new token is returned in the response so the caller can
//   update the confirmation email / manage-booking page URL.
//
// Runs privileged (service-role client) because token validation itself must
// happen server-side — an RLS policy keyed only on manage_token would let
// anyone who obtains a token bypass expiry/used-at checks by talking to
// PostgREST directly, per the rationale already documented in
// supabase/migrations/0005_bookings.sql.
//
// To invoke locally:
//   curl 'http://127.0.0.1:54321/functions/v1/manage-booking?token=<manage_token>' \
//     --header 'apikey: <ANON_KEY from `supabase status`>'
//
//   curl -X POST 'http://127.0.0.1:54321/functions/v1/manage-booking' \
//     --header 'apikey: <ANON_KEY>' --header 'Content-Type: application/json' \
//     --data '{"token":"...","action":"cancel"}'

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

interface ManageBookingActionRequest {
  token: string;
  action: "cancel" | "reschedule";
  newStartsAt?: string; // required when action === "reschedule"
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

async function loadValidBooking(client: SupabaseClient, token: string) {
  const { data: booking, error } = await client
    .from("bookings")
    .select(
      "id, service_id, practitioner_id, starts_at, ends_at, status, client_full_name, client_email, manage_token_expires_at, manage_token_used_at",
    )
    .eq("manage_token", token)
    .maybeSingle();

  if (error) return { booking: null, errorResponse: jsonError("Lookup failed", 500) };
  if (!booking) return { booking: null, errorResponse: jsonError("Booking not found", 404) };

  if (new Date(booking.manage_token_expires_at).getTime() < Date.now()) {
    return {
      booking: null,
      errorResponse: jsonError(
        "This link has expired. Please contact us to make changes to your booking.",
        410,
      ),
    };
  }

  if (booking.manage_token_used_at) {
    return {
      booking: null,
      errorResponse: jsonError(
        "This link is no longer valid — this booking has already been rescheduled. Please use the most recent confirmation email.",
        410,
      ),
    };
  }

  return { booking, errorResponse: null };
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return jsonError("token query param is required", 400);

    const { booking, errorResponse } = await loadValidBooking(admin, token);
    if (errorResponse) return errorResponse;

    return jsonOk({
      bookingId: booking!.id,
      serviceId: booking!.service_id,
      startsAt: booking!.starts_at,
      endsAt: booking!.ends_at,
      status: booking!.status,
      clientFullName: booking!.client_full_name,
    });
  }

  if (req.method === "POST") {
    let body: ManageBookingActionRequest;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    if (!body.token || !body.action) {
      return jsonError("token and action are required", 400);
    }

    const { booking, errorResponse } = await loadValidBooking(admin, body.token);
    if (errorResponse) return errorResponse;

    if (body.action === "cancel") {
      // Idempotent: already-canceled is treated as success, not an error.
      if (booking!.status !== "canceled") {
        const { error: updateError } = await admin
          .from("bookings")
          .update({ status: "canceled" })
          .eq("id", booking!.id);
        if (updateError) return jsonError("Failed to cancel booking", 500);
      }
      return jsonOk({ status: "canceled", bookingId: booking!.id });
    }

    if (body.action === "reschedule") {
      if (!body.newStartsAt) {
        return jsonError("newStartsAt is required for reschedule", 400);
      }
      const newStart = new Date(body.newStartsAt);
      if (Number.isNaN(newStart.getTime()) || newStart.getTime() <= Date.now()) {
        return jsonError("newStartsAt must be a valid future timestamp", 400);
      }

      const durationMs =
        new Date(booking!.ends_at).getTime() - new Date(booking!.starts_at).getTime();
      const newEnd = new Date(newStart.getTime() + durationMs);

      // Re-check for an overlapping booking at the new slot, same logic as
      // create-booking's step 4 — a reschedule is just a move, and the
      // destination slot needs the same collision check as a fresh booking.
      const { data: overlapping, error: overlapError } = await admin
        .from("bookings")
        .select("id")
        .eq("service_id", booking!.service_id)
        .neq("id", booking!.id)
        .in("status", ["pending", "confirmed", "rescheduled"])
        .lt("starts_at", newEnd.toISOString())
        .gt("ends_at", newStart.toISOString());

      if (overlapError) return jsonError("Failed to check availability", 500);
      if (overlapping && overlapping.length > 0) {
        return jsonError("That slot is unavailable. Please choose another.", 409);
      }

      const newToken = generateToken();
      const { data: updated, error: updateError } = await admin
        .from("bookings")
        .update({
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
          status: "rescheduled",
          manage_token: newToken,
          manage_token_used_at: null,
          manage_token_expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq("id", booking!.id)
        .select("id")
        .single();

      if (updateError || !updated) return jsonError("Failed to reschedule booking", 500);

      return jsonOk({
        status: "rescheduled",
        bookingId: booking!.id,
        newStartsAt: newStart.toISOString(),
        newManageToken: newToken,
      });
    }

    return jsonError("action must be 'cancel' or 'reschedule'", 400);
  }

  return jsonError("Method not allowed", 405);
});

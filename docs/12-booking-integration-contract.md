# Booking Integration Contract (n8n)

Technical addendum to `docs/07-booking-engine.md`. This defines the request/response shapes the frontend booking modal (`assets/js/booking.js`, `templates/partials/booking-dialog.njk`) expects from the secure backend. **None of this is implemented yet** — the frontend currently calls a local mock (`mockSubmitBooking`) that always succeeds after a simulated delay, clearly commented as a demo in the source. n8n is the confirmed backend/orchestration layer (Google Calendar availability and event creation, unique Google Meet generation, Google Sheets insertion, notifications and reminders).

No endpoint here is public yet; URLs and the shared secret belong in `.env` (see `.env.example`) and `data/integrations.public.json`'s `booking.webhookUrl`, never in committed source.

## Why this isn't "atomic"

The flow below is **recheck-then-create**, not a single atomic operation: availability is queried, the frontend renders it, time passes while the visitor fills in details, and only then is the slot rechecked and the event created. A genuine race (two people booking the same slot within that recheck-to-create window) is still possible. The contract handles this by having the create endpoint return a distinct "slot no longer available" response rather than erroring silently, so the frontend can send the visitor back to pick a new time — implemented today in `booking.js`'s `if (!result.ok)` branch.

## Endpoint 1: Get availability

`GET {N8N_WEBHOOK_URL}/availability?start=<ISO date>&end=<ISO date>&timezone=<IANA tz>`

Response:
```json
{
  "slots": [
    { "date": "2026-09-21", "times": ["09:00", "09:30", "10:00"] },
    { "date": "2026-09-22", "times": ["09:00", "14:00"] }
  ],
  "timezone": "America/New_York"
}
```
Backend responsibilities: query Google Calendar Free/Busy, apply buffers/minimum notice/daily limits/booking window (all BLOCKING in `docs/10`), and return only the derived available slots — never raw calendar data.

## Endpoint 2: Create booking

`POST {N8N_WEBHOOK_URL}/bookings`

Headers: `Idempotency-Key: <uuid>` — the same key the frontend generates once a slot is chosen (`crypto.randomUUID()` in `booking.js`) and reuses on retry, so a network failure followed by a resubmit cannot create a duplicate event.

Request body:
```json
{
  "date": "2026-09-21",
  "time": "09:00",
  "timezone": "America/New_York",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "countryCode": "+1",
  "mobileNumber": "5550100",
  "businessName": "Doe Plumbing",
  "website": "",
  "country": "",
  "message": "Looking to replace our outdated site and add online booking.",
  "sourcePage": "/pricing/",
  "utm": {}
}
```

Success response (`200`):
```json
{
  "ok": true,
  "idempotencyKey": "…",
  "eventId": "…",
  "meetUrl": "https://meet.google.com/…",
  "confirmedStart": "2026-09-21T09:00:00-04:00"
}
```

Slot-taken response (`409`, not an HTTP error the frontend treats as a hard failure — it's an expected outcome):
```json
{ "ok": false, "reason": "slot_unavailable" }
```

Backend responsibilities on this endpoint: recheck the specific slot immediately before creating anything; if free, create the 15-minute Calendar event with a unique Google Meet conference, add the visitor as an attendee, append a row to Google Sheets (see column list in `docs/07-booking-engine.md`), and return the confirmation. Server-side validation of email/country code/mobile number and rate limiting happen here too — the frontend's validation in `booking.js` is a UX convenience, not the security boundary.

## Not yet defined here (still BLOCKING per docs/10)

Calendar owner/account, calendar timezone, available weekdays/hours, minimum notice, booking window, buffers, daily limit, reminder schedule, cancellation/reschedule policy, and the final Google Sheet column set. This contract's shapes are written to accommodate all of them without changes to the frontend once they're confirmed.

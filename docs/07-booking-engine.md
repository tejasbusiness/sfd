# 15-Minute Booking Engine

## CTA label

Use exactly: **Book a 15-Minute Call**.

Every sitewide booking CTA opens the same accessible modal. `/book-a-call/` provides a direct, shareable fallback using the same booking component.

## Modal flow

### Step 1: Date

- Show available dates only.
- Detect visitor timezone and allow correction.
- Disable unavailable days, holidays and dates outside the booking window.

### Step 2: Slot

- Display times in the visitor's selected timezone.
- Show only real Google Calendar availability.
- Respect buffers, minimum notice and daily limits.

### Step 3: Details

Required:

- Full name.
- Email address.
- Mobile number with international country code.
- Business name.

Optional:

- Existing website.
- Country.
- Message.
- Service interest.

### Step 4: Confirmation

Recheck availability immediately before creating the booking. After success, do not close the modal abruptly. Display the confirmed date, time, timezone and email destination. Allow manual close and optionally close after 8–10 seconds.

## Secure integration

The static browser calls a secure backend endpoint. Recommended first implementation: n8n webhooks with securely stored Google credentials.

Backend responsibilities:

1. Query Google Calendar Free/Busy.
2. Calculate valid slots.
3. Recheck the selected slot.
4. Create a 15-minute Calendar event.
5. Generate a unique Google Meet conference.
6. Add the visitor email as an attendee.
7. Send calendar updates.
8. Append the record to Google Sheets.
9. Return a safe confirmation response.
10. Send optional internal alerts and reminders.

No Google or n8n secret may appear in frontend code.

## Sheet fields

- Booking ID.
- Created timestamp.
- Call date, start and end.
- Visitor timezone and SFD timezone.
- Full name, email and phone.
- Business name, website, country and message.
- Source page and campaign/UTM values.
- Google Event ID.
- Google Meet URL.
- Booking status.

## Reliability and privacy

- Server-side validation.
- Email and international phone validation.
- Atomic slot recheck.
- Idempotency to prevent duplicate bookings.
- Rate limiting and anti-spam control.
- Consent acknowledgement and Privacy Policy link.
- Friendly failure and retry behaviour.
- No credentials or private event data logged in the browser.
- Cancellation and rescheduling support should be planned even if delivered later.

## Settings still required

See `docs/10-decisions-and-todos.md` for availability hours, calendar timezone, buffer, booking window, reminder policy and cancellation rules.


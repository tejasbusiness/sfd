# Decisions and Outstanding Inputs

## Confirmed decisions

- Complete website, not homepage-only.
- Strategic content rewrite.
- Light theme.
- Framework-independent static output.
- Nunjucks plus Node build tools; no production runtime.
- JSON content and shared data.
- Clean trailing-slash URLs.
- Website-as-a-Service positioning.
- Free private previews with seven-day expiry.
- Non-Indian target market.
- USA, Canada, Australia, New Zealand, Germany and other European markets.
- USD-only pricing.
- Public monthly pricing.
- Primary CTA: Request Your Free Preview Website.
- Immediate CTA: Book a Free 30-Minute Discovery Call.
- Google Meet booking, Calendar event and Google Sheets record.
- SEO/AI/WhatsApp/automation presented as upgrades.

## BLOCKING before final pricing copy

- Exact monthly plan names and USD prices.
- Activation fee, minimum term, annual option or month-to-month policy.
- Page and update allowance for each plan.
- Website buyout/source-transfer policy.
- Add-on pricing.
- Tax wording and third-party charges.

## BLOCKING before final booking integration

- Calendar owner/account.
- Calendar timezone.
- Available weekdays and hours.
- Minimum booking notice.
- Booking window.
- Buffer before/after calls.
- Daily booking limit.
- Reminder schedule.
- Cancellation and rescheduling policy.
- Google Sheet owner and final column approval.

## BLOCKING before final public copy

- Final company legal name and business address presentation.
- Public email and phone/WhatsApp details.
- Confirmed response time.
- Founder biography and approved photograph.
- Verified years-of-experience wording.
- Real client logos and permissions.
- Testimonials and sources.
- Portfolio URLs and screenshots.
- Verified metrics and case-study results.
- Social profile URLs.

## BLOCKING before legal launch

- Privacy Policy reviewed for targeted jurisdictions.
- General Terms.
- Subscription Terms.
- Refund/cancellation policy.
- Cold-outreach compliance process and suppression list.
- Data retention policy for preview applicants and bookings.
- Cookie/analytics consent requirements.

## Later decisions

- German and other localized landing pages.
- Payment and subscription platform.
- CRM integration.
- Customer onboarding workflow.
- Automated preview-generation pipeline.
- Reschedule/cancel self-service.
- Niche starter repositories.

## Progress log

### 2026-09-18 — Booking modal and forms polish

- Restyled and restructured the booking modal (wider panel, no scrollbars on
  any step, elegant step-3 details layout).
- Replaced static labels with a CSS-only floating-label pattern across all
  form fields sitewide (booking modal + Free Preview form): label rests
  inside the field, floats above the border on focus or once filled.
- Restyled the homepage hero stat strip (`300+ Websites Delivered`,
  `4.8★ Ratings on Google`, `8+ Years in Business`) into a bordered,
  divided card with hover states — figures confirmed accurate by the client
  before shipping as live (non-placeholder) content, per the no-invented-
  statistics rule.
- Built two reusable custom dropdown components to replace unstyled native
  `<select>` elements everywhere on the site:
  - `assets/js/custom-select.js` — themed listbox-button widget (WAI-ARIA
    select-only combobox pattern) for ordinary selects (timezone override,
    Free Preview category).
  - `assets/js/country-select.js` — searchable country-code picker showing
    flag + dial code, built on `data/country-codes.json`.
  Both keep the original native `<select>` in the DOM (visually hidden) so
  existing form-submission code keeps working unmodified.
- Split the single phone field into two: a searchable country-code dropdown
  and a 10-digit-only mobile number input, each posted as a separate value
  (`countryCode`, `mobileNumber`) so the eventual Google Sheet gets two
  columns instead of one combined phone string. Added live sanitization and
  validation (`assets/js/phone-input.js`) to reject non-numeric input.
- Fixed browser autofill repainting form fields with a blue/yellow
  background (Chrome's autofill styling ignores `background`); added the
  standard inset-box-shadow override to `.field__control` so autofilled
  fields stay on-theme.
- Made the booking modal's Message field required — it's used as call-prep
  context ahead of the Google Meet call, so an empty message was no longer
  acceptable. Updated `docs/07-booking-engine.md` and
  `docs/12-booking-integration-contract.md` accordingly.
- Updated `docs/07-booking-engine.md`, `docs/12-booking-integration-contract.md`
  and `docs/04-page-blueprints.md` to reflect the country-code/mobile-number
  split and the now-required Message field.

## Claude instruction

Do not silently choose values for any blocking item. Use clearly labelled temporary placeholders in development and surface the unresolved decision before production-ready copy or integration is claimed complete.


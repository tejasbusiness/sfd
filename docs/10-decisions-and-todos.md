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

### 2026-09-20 — Contact page

- Built `/contact/` from `data/pages/contact.json`: hero, three "ways to get
  in touch" cards (discovery call, Free Preview, How It Works), FAQ (four new
  `contact-*` items in `faqs.json`), closing CTA. `ContactPage` + `FAQPage`
  JSON-LD via `schema.njk`.
- New `contact-details` section renders legal name, email and address only
  when `company.json` holds a non-`TBD` value, so the section stays hidden
  until those BLOCKING decisions (legal name/address, public email) are made.
- Deliberately no contact form (no backend/endpoint exists yet) and no
  response-time or phone/WhatsApp copy — all still BLOCKING. When decided,
  fill `company.json`; add a response-time line to `contact.json`.

### 2026-09-20 — Contact page, second pass (inspired by icreateyoursite.com/contact/)

- Principles taken (no copy/layout reused): several contact channels up front,
  an on-page enquiry form, a stated response expectation, trust proof near the
  top.
- Added a proof strip (the client-confirmed 300+ / 4.8★ / 8+ figures, same as
  the homepage) and a `contact-form` section (`assets/js/contact-form.js`).
- The contact form is frontend-only, like the Free Preview form: it validates
  and shows a mock success, but delivers nothing until a secure endpoint is
  wired (`integrations.public.json` webhookUrl is null). Do not launch
  publicly with it in this state.
- `company.json` gained `phone` and `responseTime` (both `TBD`, BLOCKING).
  Phone shows in the details section, and the response line under the form,
  only once real values replace `TBD`.

### 2026-09-20 — Unified form system

- Every form now uses the booking modal design (floating labels, two-column
  compact grid, shared validation): new `templates/partials/form-fields.njk`
  macros, `assets/js/form-utils.js`, and `.sfd-form` CSS (renamed from
  `.booking-modal__form`). Booking modal, Free Preview and Contact all
  converted; rule recorded in `docs/03-design-system.md`.
- Contact form fields: name, email, mobile (required), business (optional),
  existing website (optional, no protocol needed), topic, how-did-you-hear
  (Other reveals a required text field), message.
- Website fields are validated and normalised to `https://` everywhere;
  error attribute is now `data-error-for` everywhere (was `data-booking-error-for`
  in the modal).
- Fixed: phone number input now fills its cell; custom-select triggers use the
  shared field font size.

### 2026-09-20 — Contact form layout

- Contact form now sits beside a dark "Contact details" card (email, phone,
  address, plus a discovery-call button) on desktop; the card stacks below the
  form on narrow screens. Values come from `company.json`; while they are
  `TBD` the card shows a muted "To be confirmed" (production builds still
  fail on `TBD`, so this cannot ship). Replaces the old `contact-details`
  section, which was removed.
- Page forms get more vertical spacing between fields and above the privacy line.

### 2026-09-20 — Contact details supplied

- `company.json` now holds the public address, two phone numbers (support and
  business inquiry), `hello@synergyfirstdigital.com` and the customer portal
  (`crm.synergyfirstdigital.com`), shown in the Contact card. Still open:
  final legal name and confirmed response time.
- Form-field border is now `--color-field-border` (#C2C2C2, 20% darker than
  `--color-border`) and stays the same on focus; the sitewide focus outline
  remains the visible focus indicator.

### 2026-09-20 — Card consistency audit

- Unified all cards on `.card` (8px radius, 1px border, 1.5rem padding, H3
  titles). Fixed: base radius 4px→8px; FAQ items, Growth Modules, form success
  and the contact card now follow it; one shared hover for clickable cards
  (link cards, portfolio/case-study links); removed the hover lift from
  non-clickable Industry tiles and the grey "supporting" fill on the homepage
  industry bento. Rule recorded in docs/03 and CLAUDE.md.

### 2026-09-20 — Client testimonials added

- Seven real Google reviews supplied by the owner are stored in
  `data/testimonials.json` (verbatim; … marks trims; source "Google review").
  Owner approved the selection and trims. Owner confirmed (2026-09-20) that
  reviewer names and roles may be shown.
- `testimonials` section now picks reviews by id (`featuredId`, `itemIds`).
  Placed on Home (before pricing), Pricing (after plan cards) and Contact
  (above the form). Reviews mention "Web Vectors" (former name); wording kept.

### 2026-09-20 — Testimonials band restyled and extended

- Testimonials are now one brand-purple band (dark cards, gold glow, linked
  "4.8★ Ratings on Google" pill) used identically on every page.
- Added to About (right after the credibility strip), Free Preview, How It
  Works, Healthcare, Professional Services and Portfolio, in addition to Home,
  Pricing and Contact. Case Studies waits until real case studies exist.
- Restaurants, Home Services and Financial Services pages have no matching
  reviews yet, so they intentionally have none.

### 2026-09-20 — Testimonials placement audit

- Added an optional in-band call to action to the testimonials section
  (gold button under the cards) on Home, About, Pricing, How It Works,
  Healthcare, Professional Services and Portfolio; Contact and Free Preview
  omit it because the form is on the same page.
- Contact: reviews moved below the form (form is the conversion, keep it
  higher). Free Preview: compact band so the form stays near the top.
- Open ideas: star ratings per review (not supplied), more reviews for
  Restaurants/Home Services/Financial Services, Case Studies once real.

## Claude instruction

Do not silently choose values for any blocking item. Use clearly labelled temporary placeholders in development and surface the unresolved decision before production-ready copy or integration is claimed complete.


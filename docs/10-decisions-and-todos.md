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
- Website buyout/source-transfer policy. **Resolved 2026-09-20:** free full-site transfer after 3 continuous months (reduced from 6 on 2026-09-20) of paid subscription on any plan, no hidden charges (the 6 months are paying months; cancelling and returning later does not count).
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

### 2026-09-20 — Pricing decisions

- Buyout/transfer policy decided by the owner: after 3 continuous months of paid subscription on any plan the
  complete website can be transferred to the client's own hosting at no
  charge, with no exit fees or hidden charges. Applied to plans.json, the
  Pricing page and the ownership/cancellation FAQs (all "TBD" removed).
- Unlimited updates replaced by defined allowances (Lite 10, Business 20,
  E-Commerce 40). "Most Popular" is now "Best Value".
- Clarified by the owner: the 3 months are a continuous paying period, so a client who pays briefly, cancels and returns later does not qualify. Resolved 2026-09-20: cancel before 3 months = keep the domain and receive all
  own content (code and design stay with SFD); page allowances 5/10/20 (blog
  posts, legal and thank-you pages excluded; E-Commerce product listings scoped
  separately); e-commerce removed from Business and owned by the E-Commerce plan.

### 2026-09-20 — Pricing page copy pass

- Pricing plan cards now show each plan's "Best for…" line; plan buttons read
  "Start with Lite / Business / E-Commerce" (unique accessible names) on the
  Pricing and Home pages; custom-plan button reads "Tell Us What You Need";
  Pricing hero gets a "PRICING" eyebrow. Layout pass (equal-height cards,
  comparison table) is next.

### 2026-09-20 — AI Prompts Playbook signup band

- New lavender signup band above the footer on every page ("Get Your AI
  Prompts Playbook for Free!"): name and email only, built on the shared form
  system (.sfd-form--inline). Copy is in data/footer.json ("playbook").
- Frontend-only demo like the other forms: nothing is stored or sent and no
  playbook is delivered until a secure endpoint (and the playbook file) exist.
  Marketing-consent wording still needs legal review (docs/10 legal list).

### 2026-09-20 — Consent checkbox on every form

- Added a required consent checkbox (with Privacy Policy link) to the booking
  modal, Contact and playbook forms; Free Preview already had one. Wording is
  tailored per form and needs legal review with the privacy policy.

### 2026-09-20 — Country flag images

- The country picker (booking modal, Free Preview, Contact) now shows real flag
  images instead of flag emoji, which Windows browsers render as plain letters
  such as "IN". Flags are 194 self-hosted SVGs in assets/images/flags/ (about
  1.3 MB, lazy loaded, MIT-licensed flag-icons; licence file included).

### 2026-09-20 — Trust strip, footer and link polish

- Homepage/About trust strip restyled as a dark brand band (gold glow, hairlines, gold-ringed icons, dividers). Homepage fourth item now "Serving businesses across the world!" (About unchanged). This is broader than the target markets in docs/01, which are unchanged.
- Footer: Legal group moved out of the columns into a centred horizontal row above the copyright; four columns remain with the logo column width unchanged; column headings gold with a gradient hairline.
- Centre-grow gold underline hover applied to footer links and header top-level links (not sub-menus).
- Docs updated in full for this session: 02, 03, 04, 05, 08, 09, 10, 13. Session rule: docs must be fully updated before every session ends (CLAUDE.md).

## Claude instruction

Do not silently choose values for any blocking item. Use clearly labelled temporary placeholders in development and surface the unresolved decision before production-ready copy or integration is claimed complete.


### Pricing layout and company details (2026-09-20)

- `company.json`: `legalName` = "SynergyFirst Digital"; `responseTime` = "We reply to every enquiry within 1 business day." Both confirmed by the owner. `validate:production` now passes with no TBD placeholders.
- Pricing plan cards are equal height: the include list grows and the CTA button is pinned to the bottom. Summary and "best for" blocks share a minimum height (desktop) so the include lists start on one line; list text tightened to 14px.
- Pricing hero-to-cards gap reduced; "(One-time)" no longer splits across lines.
- No separate comparison table was built: the three cards already show the plan differences side by side, so a table would repeat the same information.
- Homepage plan cards now reuse the Pricing page's `.pricing-summary__*` classes and show a concise `homeHighlights` list per plan (data/plans.json); the Pricing page keeps the full `includes` list. Link relabelled "Compare every feature".

### Legal pages and hero band (2026-09-20)

- Built `/privacy-policy/`, `/terms-and-conditions/`, `/subscription-terms/` and `/refund-policy/` on one shared `legal-document` section (`templates/sections/legal-document.njk`; copy in each page JSON). The Privacy Policy is the approved reference: every legal page keeps its structure, styling and tone. Footer links are live.
- Owner decisions: governing law India with Surat courts; generic entity ("SynergyFirst Digital"); Razorpay, paid in advance from the sign-up day; cancel before the next renewal, no refunds for a started month; failed payment suspends the site immediately; data retained 24 months after last contact; Google Workspace, Razorpay, n8n/CRM and analytics named as processors.
- Drafting assumptions still to confirm: automatic monthly renewal (vs payment link); 30-day window to request content or transfer after cancelling; 30 days' notice of price changes; downgrades apply at next billing date; refund requests within 30 days of the charge; liability capped at 12 months' fees; taxes shown before payment; privacy requests answered within 30 days.
- All four pages still need review by a qualified lawyer before launch (BLOCKING before legal launch). The cookie/analytics wording must be revisited once analytics and a consent banner exist.
- Every internal page hero (not the homepage) now uses the dark `hero--band` style; the contents list on legal pages uses `assets/js/legal-toc.js` so the URL never shows `#section-id`.

### SEO infrastructure (2026-09-20)

- Hosting confirmed: Contabo VPS with CloudPanel (nginx). Built: real 404 page (`dist/404.html`), `sitemap.xml`, `robots.txt`, `deploy/nginx-redirects.conf` from `data/redirects.json` (currently empty: no legacy URLs yet), SEO build checks and output audit, and a local server that mirrors the nginx behaviour. Details in docs/02, 08, 09 and 11.
- New BLOCKING before launch: add the real `assets/images/og-default.jpg` (1200x630). Production validation fails until it exists.
- Deployment to-do: paste `deploy/nginx-redirects.conf` into the CloudPanel vhost; confirm CloudPanel's default static-site config does not already define a conflicting `location /` or `error_page`.
- Open: security headers and `X-Robots-Tag` for the preview host are not yet defined.

### Cookie consent, backend plan (2026-09-20)

- Built the cookie banner and footer "Cookie settings" trigger (docs/08).
- Decided with the owner: MySQL database, `migrations/` folder, PHP API under `/api/` on a CloudPanel PHP site (Contabo VPS), local preview reaches the live DB through an SSH tunnel, Google Calendar/Meet plus SMTP email, `.env` and `.env-local` gitignored. This supersedes the n8n plan in docs/07 and docs/12 and amends the "no Node in production" wording (PHP is allowed; Node is still not needed). Still to do in order: Cookie Policy page, migrations, working forms. Legal review and pending content stay open.

### Cookie Policy page (2026-09-20)

- Added `/cookie-policy/` on the shared `legal-document` section (same structure as the Privacy Policy), linked from the footer legal row, the banner, the Privacy Policy cookie clause and the "related policies" line of all legal pages. It lists the one cookie actually set (`sfd_consent`) and notes that Google Fonts are loaded from Google until fonts are self-hosted.
- Needs lawyer review with the other legal pages. When analytics or marketing tools are added, update the page and bump `cookieConsent.version` in `data/footer.json`. When the MySQL backend ships, the Privacy Policy must name the database and email providers (it currently names Google Sheets for records).

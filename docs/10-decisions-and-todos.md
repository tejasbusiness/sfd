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
- ~~BLOCKING: add the real `assets/images/og-default.jpg` (1200x630).~~ Resolved 2026-09-21.
- Deployment to-do: paste `deploy/nginx-redirects.conf` into the CloudPanel vhost; confirm CloudPanel's default static-site config does not already define a conflicting `location /` or `error_page`.
- Open: security headers and `X-Robots-Tag` for the preview host are not yet defined.

### Cookie consent, backend plan (2026-09-20)

- Built the cookie banner and footer "Cookie settings" trigger (docs/08).
- Decided with the owner: MySQL database, `migrations/` folder, PHP API under `/api/` on a CloudPanel PHP site (Contabo VPS), local preview reaches the live DB through an SSH tunnel, Google Calendar/Meet plus SMTP email, `.env` and `.env-local` gitignored. This supersedes the n8n plan in docs/07 and docs/12 and amends the "no Node in production" wording (PHP is allowed; Node is still not needed). Still to do in order: Cookie Policy page, migrations, working forms. Legal review and pending content stay open.

### Cookie Policy page (2026-09-20)

- Added `/cookie-policy/` on the shared `legal-document` section (same structure as the Privacy Policy), linked from the footer legal row, the banner, the Privacy Policy cookie clause and the "related policies" line of all legal pages. It lists the one cookie actually set (`sfd_consent`) and notes that Google Fonts are loaded from Google until fonts are self-hosted.
- Needs lawyer review with the other legal pages. When analytics or marketing tools are added, update the page and bump `cookieConsent.version` in `data/footer.json`. When the MySQL backend ships, the Privacy Policy must name the database and email providers (it currently names Google Sheets for records).

### MySQL migrations (2026-09-20)

- Added `migrations/001` to `009`, the forward-only runner `api/bin/migrate.php`, `npm run tunnel`, `.env` and `.env-local` (placeholders only, gitignored) and `docs/14-database-and-api.md`.
- Not yet run against the real database: needs DB name, user, password and the SSH host/user in `.env-local`.
- Placeholder booking defaults in migration 009 need the owner's confirmation. Call length is inconsistent across the site (30 vs 15 minutes).

- 2026-09-20: migrations 001 to 009 applied to the live database; tunnel and migration runner verified. Server created as a CloudPanel PHP site (PHP 8.3), SSH user `sfd-deploy`. Still open: deploy permissions for `sfd-deploy` on the site folder, SMTP and Google details, booking-default confirmation.

### Working forms (2026-09-20)

- Built the PHP API (`api/`), wired the booking modal, Free Preview, Contact and playbook forms and the cookie-consent record to it, added honeypot spam traps, per-IP rate limits, an email outbox with SMTP, and optional Google Calendar/Meet creation. Details, endpoints and deploy steps: `docs/14-database-and-api.md`.
- Playbook success text no longer says the file is on its way instantly; the owner is emailed for each sign-up and sends the playbook by hand until delivery is automated.
- Open: SMTP password and a real send test; Google OAuth credentials; deploy permissions for `sfd-deploy`; a retry script for the email outbox; confirm booking defaults and call length; Privacy Policy provider wording needs lawyer review (edited to name our own database and email hosts instead of Google Sheets).

### Booking hours decided (2026-09-20)

- Discovery call is **30 minutes** everywhere (site copy, docs, CLAUDE.md, calendar event length). Available **Monday to Friday, 10:00 to 13:00 and 17:00 to 19:00 in the visitor's local time**; slots are shown in the visitor's timezone. Migration 010 applied to the live database.
- Removed the booking modal's "Demo" notice and its old "once this connects" text. Still open: buffer (currently 15 minutes), notice, window and daily limit (see docs/14); SMTP password; Google credentials.

## Pending task list (updated 2026-09-20; do each in a fresh session)

Next up, in suggested order:

1. **Google Calendar and Meet:** create the Google OAuth client, refresh token and calendar ID, put them in `.env` and `.env-local` (`GOOGLE_*`, then `GOOGLE_ENABLED=1`), and test that a booking creates the event, the Meet link and the invite. The code exists (`api/src/Google.php`) but is untested.
2. **Browser test of every form locally:** run `npm run tunnel` and `npm run serve` (restart it; it now proxies `/api/`), then try the booking modal (dates, times, timezone change, slot-taken case), Contact, Free Preview, playbook and the cookie banner. Use `MAIL_LOCAL=1` only when testing real emails.
3. **Production deploy** (steps in `docs/14-database-and-api.md`): fix write permissions for `sfd-deploy` on the site folder (or upload through CloudPanel), upload `dist/`, `api/`, `migrations/` and `.env`, run `composer install --no-dev` and the migrations on the server, paste `deploy/nginx-redirects.conf` into the CloudPanel vhost, add the cron job for `api/bin/send-outbox.php`, and verify `.env` is not downloadable.
4. ~~Add `assets/images/og-default.jpg`~~ **Done 2026-09-21** (1200x630, 72 KB); `npm run build:production` passes. Optional polish only: see docs/08.
5. **Confirm the booking placeholders** in the `booking_settings` table: buffer (15 min, which hides the slot after each booking), minimum notice (12 h), window (30 days), daily limit (6).

Then, from the roadmap and earlier open items:

- Preview-mode system (CLAUDE.md step 10, `docs/06`) and the preview host's `X-Robots-Tag` and security headers.
- Cross-browser, responsive, performance and accessibility QA (step 12), including self-hosting and subsetting the fonts and image optimisation.
- Playbook: the file itself, automated delivery email, and the consent wording (legal review).
- Analytics and consent: choose a tool, load it only after consent, then update the Cookie Policy and Privacy Policy and bump `cookieConsent.version` in `data/footer.json`.
- Keep pending as agreed: lawyer review of all five legal pages (and the drafting assumptions listed above), and pending content (more reviews for Restaurants, Home Services and Financial Services; a Case Studies band once real case studies exist).

### About Mission and Vision (2026-09-20)

- Replaced the About page trust strip with a Mission and Vision section. The wording is a draft based on existing About and offer copy; the owner should approve or edit it in `data/pages/about.json`.

### Portfolio mockups (2026-09-20)

- Replaced the Recent work cards with responsive device mockups built from real screenshots of the three live client sites (already listed with permission). Details in docs/04. The Google-hosted client sites can change, so refresh the images with `scripts/capture-portfolio.js` when they do.

### Portfolio: three more projects (2026-09-20)

- Added The BrandBook Company, Siddhant Cinevision Pvt. Ltd. and EV WORLD360 to `data/projects.json` and the portfolio page (six projects, two rows of three). Descriptions only state what each live site visibly shows. Note: the live EV WORLD360 site still shows placeholder contact details (address "99 Roving St., Big City", phone "123-456-789"), which appear in its screenshot; refresh the screenshot with `node scripts/capture-portfolio.js ev-world360` once the client fixes them.

### Case study pages (2026-09-20)

- Built the case-study index and six detail pages (same six projects as the portfolio) with SEO copy written only from what the live sites show. No results, metrics or quotes were invented. Open: ask each client for a real challenge, result and quote if you want fuller case studies; add them to the page JSON (`outcome`). The Case Studies testimonials band on this page stays pending until real project reviews exist.

### Insights renamed to Blog (2026-09-20)

- `/resources/insights/` is now `/resources/blog/` (page `resources-blog.json`, nav and footer label "Blog", title and H1 "Blog"). A 301 redirect from the old URL is in `data/redirects.json`, so `deploy/nginx-redirects.conf` includes it. If you meant a top-level `/blog/`, say so and it is a one-line change plus a new redirect.

### Services replace Industries in header and footer (2026-09-20)

- Owner decision: Industries removed from the header and footer (industry pages kept, unlinked from navigation); Services added with five sub-items from the About page (Website Design & Development, Local SEO & Google Visibility, Website Care & WordPress Maintenance, Digital Marketing & Social Media, Automation & Custom Solutions). Built `/services/` plus five service pages with SEO copy checked against `plans.json`. Open: owner review of the service copy, and whether Industries should get a new home in the navigation later.

### How It Works moved under About Us (2026-09-21)

- Owner decision: parent is **About Us**, and the mobile tab bar entry **stays**. In `data/navigation.json`, About Us now has a simple `children` dropdown (About Us, How It Works) and the top-level How It Works item is removed. The dropdown reuses the existing CSS-only hover/focus-within component; no template or CSS change.
- Unchanged: `/how-it-works/` URL (no redirect), the footer link, the mobile tab bar entry, the More drawer and all in-page calls to action.
- Checks: `npm run rebuild`, `validate` and `test:validation` pass. The dropdown is reviewed by code and built HTML, not in an interactive browser: About Us stays a real link to `/about/` (so touch users reach it without hover), the dropdown opens on `:focus-within` so keyboard Tab reaches both items, and it is desktop-only (nav shown at 1080px and above; below that the tab bar and More drawer carry navigation). Still to do in the QA session: confirm in real browsers (keyboard, touch laptop, tablet and phone widths).
- Open: on `/how-it-works/` the About Us parent is not highlighted as the current section (nav active state only matches the parent's own path). Change the template if you want that.

### Service pages rebuilt to match Websites (2026-09-21)

- Owner decisions: SEO moves to `/services/seo/` (label "SEO") as a standalone service with a **free website audit**; Automation becomes **AI & Automation** at `/services/ai-automation/`; the reference's "1-on-1 Website Help" is not added as a page (Website Care covers it); all five service pages get the same structure and hero (docs/04). 301s from both old URLs. Logos now live once in `data/client-logos.json`.
- Built in one generator pass; all four pages reuse existing copy and `plans.json` facts. Process steps are ours (audit, fix the foundation, build local presence, report), not the reference's. The reference's statistic ("93% of online experiences start with a search engine") and industry use-case examples were not used because they are unsourced or not our offer.
- Confirmed by the owner (2026-09-21): the free audit wording and the new service copy are approved. Forms will be tested by the owner after the production deploy, not in a local session.
- Open: the audit request currently arrives as a normal enquiry with topic `SEO`, so decide if it needs its own follow-up flow. No pricing is shown for standalone SEO (none has been decided).
- Checks: rebuild, validate and `test:validation` pass; all five pages return 200 and the old URLs redirect in one hop; layout checked in headless Chrome. Form submission is still untested against the live API (form-testing session).

### Websites service page rebuilt as a landing page (2026-09-21)

- Owner decisions: `/services/website-design-development/` becomes `/services/websites/` (301 from the old URL) and is labelled **Websites** everywhere; `/websites/` stays as the Our Work hub; the page doubles as the Meta ads landing page; hero form fields are Name, Email, Phone and Message plus a hidden `topic` of `Websites`; the 8 client logos in `assets/images/customer-logos/` go in a logo strip (owner confirmed permission for all 8, including 123 Silva and NextWorld Communications); site types shown: business websites, redesigns and booking sites.
- Assumption to confirm: I also listed **e-commerce websites**, because the E-Commerce plan exists in `plans.json`. Remove that card in `data/pages/service-websites.json` if you do not want it on this page.
- Built: new `hero-form` and `client-logos` sections, CSS, the page content, and the API change that makes `source` optional (plus page and campaign in the owner email). The consent checkbox stays on the hero form because the API requires it. Structure and design notes: docs/04 and docs/03.
- Checks: rebuild, validate and `test:validation` pass; PHP lint passes; the old URL returns one 301; layout checked in headless Chrome at desktop and 500px widths.
- **Not tested:** a real submission against the API and database (needs `npm run tunnel`), and keyboard and screen-reader use of the hero form. Do these in the form-testing session.
- Open: EV WORLD360 and Siddhant Cinevision logos are about 190 KB each for a 72px display; compress them in the image-optimisation QA task. Featured work shows three projects (Budget Opticals, CAWT, EV WORLD360); change `itemIds` to swap. Ad readiness still to do: a thank-you page or conversion event, and the Meta pixel loaded only after consent (update the Cookie and Privacy Policies and bump `cookieConsent.version`). The old `docs/SFD_About_Page_Copy_and_Claude_Prompt.md` still says "Website Design & Development" (historical prompt, left as is).

### Link and 404 audit (2026-09-21)

- Crawled the local build (37 pages plus the 404 page): every internal link, image, script, stylesheet, CSS `url()` and `#anchor` resolves, with **zero 404s and zero broken anchors**. Unknown URLs return a real 404; missing trailing slashes, `/index.html` and the four renamed or old URLs (`/services/website-design-development/`, `/services/local-seo-google-visibility/`, `/services/automation-custom-solutions/`, `/resources/insights/`) each return a single 301. All six client sites and the Google Maps link respond.
- **Fixed 2026-09-21:** both items below. `/build-check/` (`internal-diagnostic` pages) is now excluded from production builds, and `build:production` now cleans `dist/` first so stale files cannot ship. The contact card's Customer Portal link is hidden by `customerPortalLive: false` in `data/company.json`; set it to `true` once `crm.synergyfirstdigital.com` serves a valid HTTPS site. The Privacy Policy still names the portal address and the Subscription Terms still mention cancelling through the portal; review those with the lawyer.
- **Found, fixed above:** (1) `crm.synergyfirstdigital.com` (`company.customerPortal`, shown on `/contact/` and named in the Privacy Policy) resolves in DNS but fails the TLS handshake, so the "Customer Portal" link does not load yet; hide it or launch the portal first. (2) The `/build-check/` diagnostic page still ships in the production build (noindex, not in the sitemap, not linked); exclude it from production output before deploy (it is the documented exception to rule 8).
- Notes: `synergyfirstdigital.com` currently answers "Hello World :-)" for every path (a placeholder), so there are no legacy URLs to redirect, and after deploy nginx must return real 404s. The five industry pages are reachable only from `/industries/`, which is linked from About and the homepage but not the header or footer.

### Production deploy (2026-09-21)

- The site is live at https://synergyfirstdigital.com. Deploy steps, the vhost layout and the verification results are in docs/14. Lessons: set the CloudPanel Root Directory to `dist` before uploading `.env`; a 200 on a probe URL is not proof of a leak while the placeholder site answers every path, so check response bodies.
- Next: owner tests the forms and emails on the live site; connect Google Calendar/Meet; add the outbox cron; submit `sitemap.xml` to Google Search Console; then the remaining QA, analytics and legal-review items in the pending list.

### Live form and email test (2026-09-21)

- Owner submitted the forms on the live site. The database holds 1 booking and 2 contact enquiries (Contact page and the Websites hero form, which posts to the same endpoint), but **0 Free Preview applications and 0 playbook sign-ups**, so those submissions never arrived.
- Emails: the first three (booking owner and visitor, one enquiry) were left `queued` with "SMTP Error: Could not connect to SMTP host" between 06:34 and 06:38 UTC; later ones sent normally. After a manual run of `api/bin/send-outbox.php` all six show `sent`, so SMTP (Hostinger, port 465) works and the failures were transient. Mail DNS is correct (MX at Hostinger, SPF, DKIM, DMARC `p=none`).
- The `preview-applications` endpoint timed out on two probes shortly after, then answered normally (HTTP 422 validation, under 1 second) on repeat, so the cause was a transient server stall, not a code fault. Retest Free Preview and the playbook form.
- To do: add the outbox retry cron (CloudPanel, as the site user, every 10 minutes): `php /home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com/api/bin/send-outbox.php`. Until it exists, an email that fails once stays queued until someone runs the script. Consider a longer SMTP timeout than 10 seconds in `api/src/Mailer.php`.
- If `hello@` still receives nothing while the outbox says `sent`, the problem is on the mailbox side: check the Hostinger mailbox exists, its spam folder and any bounce in the `noreply@` mailbox.

### Toast confirmations and form reset (2026-09-21)

- Owner request: replace the inline "thank you" blocks with a dismissible toast and clear the form after a successful submit. Done for Contact, the Websites hero form, Free Preview and the playbook; the booking modal keeps its confirmation step (it shows the booked time). Details in docs/03.
- Tested in headless Chrome with a mocked API: each form shows the toast, resets fully (including the country code and the Contact "Other" text field), clears errors, and the toast closes with its button. Real submissions still need the owner's check after redeploy.
- SMTP timeout raised from 10 to 20 seconds. The outbox cron command needs the `php` prefix (see docs/14).
- Needs a redeploy (`dist/` and `api/src/Mailer.php`).

### Faster form responses, loading state, 5-second toast (2026-09-21)

- Problem: forms took 10 to 30 seconds to confirm because the API sent the emails (SMTP) before replying. Fix: emails are still saved to `email_outbox` first but are delivered after the response is sent (`fastcgi_finish_request()`), so confirmation should take about a second. Failed sends stay queued for the cron. Google Calendar creation, when enabled, still runs before the reply because the Meet link is part of the booking response.
- Every submit button now shows a spinner and busy label and stays disabled while sending (and, for a confirmed booking, until the modal form is reset). Toasts now auto-dismiss after 5 seconds; the timer pauses only while the pointer is over the toast or focus is inside it.
- Tested in headless Chrome with a delayed fake API: in-flight state, reset, and dismissal all behave. The server change needs a live check after redeploy: submit a form and time the response.

### Rate limit message and error toasts (2026-09-21)

- The "Too many attempts" message was the rate limiter working as coded, not a bug in the form: the old limit was 5 contact requests per hour per client and counted every request, including failed validation, double clicks during the slow 10 to 30 second waits, and the owner's test probes. It was too strict for real use, so limits were reworked (generous request buckets, plus 5 per hour only for stored submissions; see docs/14) and the client address now comes from `X-Real-IP` so visitors are not lumped together behind the proxy.
- All submit-level errors (rate limit, server, network, slot taken) now appear as a red, dismissible, 5-second toast; field errors stay inline (docs/03). The empty inline error lines were removed from the form templates.
- Tested in headless Chrome with a faked API (429, 500, network failure): red toast, button re-enabled, typed values kept; success path unchanged. Needs a redeploy; then re-test on the live site.

### Compact toasts with a progress bar, green and red (2026-09-21)

- Owner request: show a reverse 5-second progress bar, make toasts compact, green for success and red for errors on every toast. Done in `assets/js/toast.js` and `assets/css/components.css`; new token `--color-success` in `tokens.css`. Details and the rule 17 exception (the toast is not a `.card`) are in docs/03.
- Tested in headless Chrome: green `rgb(31,122,61)` and red `rgb(179,38,30)` backgrounds, bar shrinks at 20% per second, hover pauses both the bar and the timer and it resumes with the time left, white text on both. A first version had a dark title on the coloured background; fixed before commit.
- Front-end only: redeploy `dist/` (no API change this time).

### Free Preview page layout (2026-09-21)

- The form moved into the "Tell us about your business" section (its intro text now sits above the form), the "Your details" section was removed, and the form now spans the full container in a two-column (tablet) or three-column (desktop) grid instead of a narrow 46rem column. The client reviews section now follows the form. Checked in headless Chrome at desktop, tablet and phone widths; the submit flow still works. Front-end only: redeploy `dist/`.

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
- Primary CTA: Start My Free Website Preview (renamed 2026-11-02 from "Show Me My New Website", after trying "Request My Free Website Preview", which wrapped).
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

### Free Preview: Primary & Secondary Services field (2026-09-21)

- The "Primary service" field is now labelled "Primary & Secondary Services" with a small italic hint: "Separate services with commas. The first is your primary service; the rest are secondary." The value is stored as typed in the existing `primary_service` column (max 200 characters, enforced by `maxlength` and the API), so no migration was needed; the owner email row is now "Services (first is primary)". Required-field message: "Add at least one service." If you later want the services stored as separate rows or columns, that needs a migration and splitting on commas in the API.
- Front end plus a small API label change (`api/src/App.php`): redeploy `dist/` and `api/src`.

### Tablet and mobile header logo (2026-09-21)

- Owner request: on tablet and mobile show `SFD-Black-logo.png`, centred, in the header; desktop stays as is. Done with a `<picture>` source at 1399px and below (see docs/13). The 358 KB master was too heavy for a 28px-tall logo, so a 9 KB header-sized copy is served instead. Checked in headless Chrome at 500, 900, 1398/1400 and 1858px. Front-end only: redeploy `dist/`.

### Offer renamed to "Free Website Preview" (2026-09-21)

- Decision (owner approved my recommendation): the offer is now **Free Website Preview** everywhere, replacing "Free Preview Website". Button label: **Get My Free Website Preview**. Page titles, H1 and OG titles: **Request Your Free Website Preview**. Prose: "a Free Website Preview" (plural "Free Website Previews"). Reasons: natural English, matches the existing "website preview" body copy and "Free Website Audit", "free website" reads first, and the free part is clearly the preview.
- Unchanged on purpose: the `/free-preview/` URL, the short nav and tab-bar label "Free Preview", the "Free Preview application" wording, and phrases that describe the site itself ("we build your preview website"). Earlier log entries in this file still use the old name as history.
- Touched 42 files (page data, header and section templates, owner-email text in the API, README, CLAUDE.md, docs/01). Two legal pages (Terms and Conditions, Refund Policy) changed only in this terminology; they still need the lawyer review already listed. Button text is a good candidate for an A/B test once ad traffic exists.
- Redeploy `dist/` and `api/src`.

### deploy.md added (2026-09-21)

- Owner request: one file with every deployment step and command, usable from a fresh PowerShell window. Added `deploy.md` at the project root (variables step, pull, validate and production build, access check, upload, backup-and-swap, optional dependency, migration, nginx and `.env` steps, live verification, browser and form tests, rollback, troubleshooting table, the full vhost and one-time server setup). README, docs/14 and CLAUDE.md point to it; CLAUDE.md now requires keeping it in sync with any change to the build, server layout, vhost, environment variables or deploy commands.

### One-command deploy (2026-09-21)

- Owner request: run the whole deployment with one command. Added `scripts/deploy.ps1` (PowerShell 5.1, ASCII only), `deploy.bat` (double-click or terminal) and `npm run deploy`. It follows `deploy.md`: preflight, validate, tests, production build and clean-build checks, server access check, change detection (composer.lock, new migrations, nginx redirects), a confirmation, upload, backup and swap, optional `composer install`, migrations only with `-Migrate` or a prompt, and live verification (status codes and page bodies). Switches: `-Yes`, `-UploadEnv` (refuses a non-production `.env`), `-Migrate`, `-BuildOnly`, `-VerifyOnly`, `-Rollback`. It reads SSH details from `.env-local`.
- Not automated on purpose: the CloudPanel vhost (redirect changes are detected with a stored hash in the site folder, the new file is copied to the clipboard and you are asked to confirm) and database migrations without an explicit choice.
- Tested without touching production: parse check, `-BuildOnly`, `-VerifyOnly` against the live site (all checks pass), and a run answered "no" at the final confirmation.

### Contact page: pinned details strip (2026-09-21)
A `position: sticky` card cannot work on `/contact/`: it only moves inside its own row (the form section), and the form and card are about the same height, so it scrolled away with the section. Replaced by a slim strip (`.contact-pin` in `templates/sections/contact-form.njk`) fixed under the desktop header (top 80px, 61em and up). `initContactPin()` in `assets/js/contact-form.js` shows it once the `.contact-card` has scrolled out of view above and hides it when the card is back. It carries the company phones, support email and the "Book a Free 30-Minute Discovery Call" button (opens the booking modal) from the same company data as the card, so nothing is new content. Not shown on tablet or mobile. Tested at 1440x680: hidden while the card is visible, shown at 80px once it has gone.

### First production run of the one-command deploy (2026-09-21)
- `npm run deploy` ran end to end (upload, swap, `dist.bak` kept) and the live checks passed on a second run. The first verify pass showed five `000` results (no answer from the server for a moment after the swap), so the script now retries a check up to three times, 3 seconds apart, before failing.
- npm on the owner's machine swallowed `-Flag` after `--` (the run behaved like a plain deploy and stopped at the confirmation). Options are now documented as `.\deploy.bat -Flag` in `deploy.md`.
- Still open: add the outbox retry cron in CloudPanel (command must start with `php`), retest all five forms and emails on the live site, delete `dist.bak` when satisfied.

### E-Commerce plan replaced with Custom Solutions (2026-10-02)

- Owner decision: the fixed-price "E-Commerce" pricing plan ($749+/month, 20 pages, 40 updates) is removed from `data/plans.json`. E-commerce and bespoke/custom development remain available as capabilities — they are no longer sold as a standardized plan with a fixed price or allowance. The new 3rd plan is "Custom Solutions" (`id: "custom-solutions"`), with no `priceMonthly` and a `cta` (`{label: "Let's Talk", href: "/book-a-call/", dialogTarget: "booking-modal"}`) that opens the sitewide booking modal instead of linking to `/free-preview/`.
- `templates/sections/pricing-summary.njk` and `pricing-highlight.njk`: the per-card CTA is now conditional — a plan with a `cta` object renders it (href/label/optional dialogTarget), otherwise the existing "Start with {name}" → `/free-preview/` behavior is unchanged for Lite and Business. No validator or CSS changes were needed: `scripts/validate-data.js` has no plan-shape schema, and `.pricing-summary__plan` cards already flex to equal height regardless of content.
- The "Need something different?" `customPlan` block (section `pricing-summary` on `data/pages/pricing.json`, previously rendered in `pricing-summary.njk`) was removed as dead code — it's now redundant with the Custom Solutions card itself. Confirmed `customPlan` had no other references in the codebase before deleting.
- Reworded every stale "E-Commerce plan" reference to remove fixed allowance claims that no longer apply: `data/faqs.json` (ids `cost`, `updates`, `page-allowance`, `add-pages`), `data/pages/subscription-terms.json` (clauses `plans-and-fees`, `whats-included` — legal page, "Last updated" bumped to 2 October 2026), `data/pages/service-websites.json` (e-commerce feature card), `data/pages/service-seo.json`, `service-website-care-maintenance.json` and `service-ai-automation.json` (feature-grid items naming the old plan by name or allowance). No new numbers or claims were invented; capability descriptions were kept, fixed-figure claims (page/update counts, "same-day support") were replaced with "scoped and quoted individually" language already used elsewhere in the site.
- `data/pages/pricing.json` `seo.metaDescription` updated from "Lite, Business and E-Commerce" to "Lite, Business and Custom Solutions".
- Resolves the open TODO logged on 2026-09-21 about the e-commerce card in `service-websites.json` — it now references Custom Solutions instead of the removed E-Commerce plan.

### Custom Solutions card: no feature checklist (2026-10-02)
Owner feedback: a non-packaged "talk to us" plan shouldn't list fixed feature bullets like a priced plan does — nothing on it is actually fixed. Removed `homeHighlights`/`includes` from the Custom Solutions entry in `data/plans.json`, and `pricing-summary.njk`/`pricing-highlight.njk` now skip the bullet list entirely when `plan.cta` is set (the same flag already used to switch the CTA). `.pricing-summary__plan-cta` already has `margin-top: auto` in a flex card, so the button still sits at the bottom and the card still matches Lite/Business height — confirmed in headless Chrome (660px on `/pricing/`, all three cards equal).

### Pricing cards: compact Custom Solutions, taglines, bold descriptions (2026-10-02)
Owner feedback on the Custom Solutions card: stretching it to match Lite/Business's height (grid `align-items: stretch`) left a large empty gap below its two short paragraphs. Added `.pricing-summary__plan--compact` (applied whenever `plan.cta` is set, same flag the CTA already branches on): `align-self: start` so the card hugs its own content instead of stretching, plus a soft `--color-lavender-soft` tint so it still reads as a finished, deliberate card rather than an empty one. Confirmed in headless Chrome at desktop, the homepage teaser and mobile widths — Lite/Business are visually unchanged.
Also per owner instruction: Lite and Business each got a `tagline` field rendered under the plan name (`.pricing-summary__tagline`, small uppercase accent-warm label) — "Professional Website" and "Website + Local Growth". Their `idealFor` copy was reworded (no longer starting with "Best for") and is now semi-bold (`.pricing-summary__ideal--bold`, applied when `not plan.cta`, so Custom Solutions' equivalent text stays regular weight). `data/plans.json`, `pricing-summary.njk` and `pricing-highlight.njk` all updated together so the Pricing page and homepage teaser stay identical.

### Pricing page: one tab per service (2026-10-02)
- Owner request: pricing for every service on one page, no separate pricing pages. `/pricing/` now has service tabs (Websites, SEO, Website Care, Digital Marketing, AI & Automation); Websites opens first, so the main product stays the first thing visitors see. Website plans are unchanged (owner: "they are okay").
- No prices exist yet for the other four services and none may be invented (CLAUDE.md rule 13), so per the owner each shows a placeholder: "Pricing is being updated." plus a free-call button and a link to the service page. The owner's wording was "under updation"; it is phrased as "Pricing is being updated." on the site and can be changed in `data/pages/pricing.json` (`placeholder`).
- Built: `services`/`placeholder` in `data/pages/pricing.json`, tabbed `pricing-summary.njk` (plan cards unchanged, inside the Websites tab), `assets/js/pricing-tabs.js` (ARIA tabs, keyboard, `#pricing-<id>` deep links), CSS in `components.css`. Tested in headless Chrome: default tab, click, arrow keys, deep link on load, `hashchange`, desktop and 390px mobile.
- Open (owner): per-service pricing model, plan names, USD prices, inclusions and limits, terms, ad-spend handling, bundle discounts. When they arrive: replace each placeholder with plan cards, add "See pricing" links from the service pages to their tab, review the page hero line and the "Included on every plan" / "Commitment and ownership" sections (they describe website plans only), and extend the Subscription Terms if the other services are subscriptions (legal review).

### Pricing: one URL per service, no "Compare plans" heading (2026-10-02)
- Owner: `#pricing-seo` URLs are not SEO-friendly; use `/pricing/{service}/`. Fragments are never indexed separately, so each service now has a real page: `/pricing/seo/`, `/pricing/website-care/`, `/pricing/digital-marketing/`, `/pricing/ai-automation/`. Built with a new page `variants` mechanism (docs/05), so they get their own H1, title, meta description, canonical, sitemap entry and BreadcrumbList schema, and pass the same validation as every page.
- Decision: Websites stays at `/pricing/` instead of moving to `/pricing/websites/`. `/pricing/` is the page the nav, footer, homepage, 404 page and search engines already use, and it is the main product's pricing, so it keeps the shortest URL; `/pricing/websites/` 301-redirects to it. Easy to reverse if the owner prefers `/pricing/websites/` as the main URL.
- The pills are now plain links (one panel per page) instead of in-page ARIA tabs; `pricing-tabs.js` keeps the scroll position across the switch. The mobile tab bar now highlights "Pricing" on every `/pricing/...` page (same prefix match as the header).
- Service pages leave out the website-only sections (pricing FAQ, "Included on every plan", "Commitment and ownership") via `onlyFor`, so they don't describe website plans.
- Removed the "Compare plans" heading (owner). A visually hidden "Websites plans" H2 keeps the heading order for screen readers.
- Deploy: `deploy/nginx-redirects.conf` changed (new `/pricing/websites/` rule), so the CloudPanel vhost needs the updated redirect block pasted in; `deploy.ps1` detects this and copies it to the clipboard.

### Pricing pills switch without a reload (2026-10-02)
- Owner: switching service pills looked like a flicker and a page load. It was one: each pill was a normal link, so the new page painted at the top, jumped to the saved scroll position and replayed the card fade-ins.
- Now `pricing-tabs.js` fetches the target page's static HTML (prefetched on hover/focus), swaps `<main>` and the head tags, and uses `history.pushState`, so the switch is instant and the pills don't move. Every URL is still a complete static page, so search engines and users without JavaScript see the same content (CLAUDE.md rule 4 is about not building content from JSON in the browser; this only loads our own pages). Back/Forward work; any error falls back to a normal load.
- `initDialogTriggers` in `main.js` became re-runnable (skips triggers already bound) so booking buttons in swapped content open the modal.
- Tested in headless Chrome at 1440px and 390px: no reload, pills stay at the same position, URL/title/canonical update, Back/Forward, booking modal from a swapped placeholder.


### Business plan badge: "Recommended for local businesses" (2026-10-02)
Owner: replace the "★ Best Value" badge on the Business plan (Pricing page and homepage) with "Recommended for local businesses" (shown uppercase). The text is now the plan's `badge` field in `data/plans.json` instead of being hard-coded in `pricing-summary.njk` and `pricing-highlight.njk`, so it can change without touching templates. The longer label stays on one line: `white-space: nowrap`, and below 48em a slightly smaller size and tighter left offset (below 22.5em the offset tightens again). Checked at 1440, 768, 360 and 320px.

### Pricing page copy and ownership policy: 6 months (2026-10-02)
Owner-supplied copy applied on `/pricing/` and the service pricing pages (see docs/04): new H1 and hero line, hero secondary button "Book a Free 20-Minute Call", reworded Business and Custom Solutions descriptions, "Standard booking or CRM integration", "Routine" / "Priority content updates included" on the Lite / Business cards, "Managed for you", and a rewritten "Commitment and ownership" section (H3 line, No Minimum Term, Website Ownership, third-party charges).
- **Policy change:** website ownership now comes after **6 consecutive paid months** (was 3), and on leaving we **provide the website files** at no additional charge (was: transfer to the client's own hosting). To avoid contradicting the pricing page, the same change was made in `data/faqs.json` (ownership, cancellation), `data/pages/subscription-terms.json` (clause "Ownership and transfer", and the failed-payment clause), `data/pages/service-website-care-maintenance.json` and `data/plans.json` (`buyoutPolicy`). Adapted wording, not new terms; **needs the owner's legal review**, together with the other legal pages already pending review.
- Where two instructions overlapped, the more detailed one was used: the card is titled "Website Ownership" with the longer text that also covers cancelling earlier.
- **Open, owner to decide:**
  1. The booking modal, the closing call-to-action on the pricing pages, the placeholder buttons, the meta descriptions and every other page still say "30-Minute", and the booking slots are 30 minutes. A "20-Minute" hero button now promises a different length than the call booked. Either change the call length everywhere, or revert this button.
  2. Update counts (10 / 20 a month) are gone from the plan cards but still appear in the pricing FAQ ("What if I need something updated?", "What counts as a content update?"), in Subscription Terms ("Allowances and fair use") and on the Website Care page.
  3. `$15` per extra Google Workspace address is gone from the pricing page but still stated in Subscription Terms.
  4. The H1 repeats "managed" ("A professionally managed website, managed for one simple monthly price"); used exactly as supplied.

### Pricing: H1, two FAQs, commercial closing, no playbook banner (2026-10-02)
- Owner copy: new `/pricing/` H1 (see docs/04); two new trust FAQs ("Why is there no upfront website design fee?", "Is the free website preview really free?"); the playbook banner removed from pricing pages and the closing section replaced by "Ready to see your business with a better website?" with a single "Get My Free Website Preview" button, as proposed in the owner's review notes. The "Commitment and ownership" H3 line was left exactly as it is.
- The hero subheading instruction (item 2) gave identical old and new text ("Custom design, hosting, maintenance and ongoing support included — with no large upfront website fee."), so nothing changed there.
- The new FAQ says there is "no payment or obligation to review your preview"; the existing FAQ "Am I guaranteed a free preview?" still says previews are reviewed first and not automatic. Both are consistent (free, but not guaranteed to every applicant).
- Open: the booking pop-up and other pages still say 30 minutes while the hero button says 20 (see the previous entry).

### FAQ redesign, sitewide (2026-10-02)
Owner: the "Pricing questions" section looked plain, dated and too long. Because docs/03 requires one FAQ style everywhere (no page-specific FAQ styling), the shared component was redesigned rather than the pricing page alone: numbered rows, round plus/minus button, a white raised panel on hover and when open, one answer open at a time, smooth open/close where supported (details in docs/03). It applies to every FAQ (Home, Pricing, How It Works, About, Contact, Industries). The Pricing FAQ also moved to the `faq-split` layout (heading, intro and "Ask Us a Question" on the left), which makes it shorter and easier to scan. Checked on Pricing, Home and Contact at 1440px and on Pricing at 390px.

### Homepage hero: local service businesses (2026-10-02)
Owner brief: position the homepage for local service businesses in general, with no single niche. All copy below was supplied by the owner and is stored in `data/pages/home.json` (`hero-split`).
- **Copy:**
  - Eyebrow: "Websites for local service businesses".
  - H1: "See your *new website* before you pay for it." The highlight stays on "new website".
  - Supporting text: two paragraphs, covering design, hosting and management, and the private preview.
  - Buttons: "Get My Free Website Preview" and "Book a Free 20-Minute Call".
  - New reassurance line (`reassurance`): "No payment. No obligation. See the preview first."
  - Stats: "300+ Websites Delivered", "4.8★ Google Rating", "8+ Years Building Websites".
- **Before/after visual:**
  - The After mock-up's headline and button text now come from `visual` in the JSON and read "Trusted Local Service. Done Right." and "Request a Free Quote".
  - The visual was `aria-hidden`. It is now a single labelled image (`role="img"`, with the label "Before and after example of a professionally designed website for a local service business").
- **SEO:** the homepage title, meta description and OG text were aligned with the new positioning. They now mention professional website design, hosting, maintenance, managed and conversion-focused websites, the monthly fee and the free preview. There is still exactly one H1.
- **CSS:**
  - The stat value no longer wraps, and its mid-range size is slightly smaller, so "8+ Years" fits on one line on tablet.
  - The mock-up's quote button is slightly smaller so it fits on one line on desktop.
- **Docs:** docs/01 and docs/13 example headlines updated.
- **Open:** the "20-Minute" button vs. the 30-minute booking call (see "Pricing page copy" above) now also applies to the homepage hero.

### Homepage trust strip: new statements (2026-10-02)
- **New statements** (owner copy, in this order):
  1. "See your website before you pay"
  2. "No contract. No obligation to continue"
  3. "Hosting, maintenance & support included"
  4. "Built for local service businesses"
- **What they replace:** these supersede the 2026-09-20 wording, including "Serving businesses across the world!". The strip no longer names any countries.
- **Markup:** the strip is now a list (`<ul role="list">` with `<li>` items) instead of paragraphs. The layout and icons are unchanged.
- **Line breaks:**
  - `text-wrap: balance` evens out wrapped lines.
  - A non-breaking space in "No obligation" stops "No" being left alone at the end of a line.

### Homepage "How your free website preview works" (2026-10-02)
- **Copy:** the owner supplied a new heading and four steps (exact text in `data/pages/home.json`).
  - The wording no longer says "If you qualify" or "Activate", and no longer reads as an application.
  - The FAQ "Am I guaranteed a free preview?" still says that requests are reviewed. This is consistent with "We'll review your current online presence".
- **Step 1 call to action:** "Request My Preview" (`/free-preview/`) is now a real button. Before, there was only a decorative "Apply for preview" pill inside the hidden visual, which screen readers and keyboards couldn't reach.
- **Step 2:** adds the optional reassurance line "No payment is required to review it."
- **Step 4 visual chip:** changed from "Live & approved" to "Live & managed", so it no longer implies an approval step.
- **CSS:**
  - Step copy is capped at a 40rem measure. The longer text ran the full width on desktop, and right-aligned steps crossed the timeline line.
  - On tablet and up, even steps reserve the numeral's space on the left.

### Homepage industries section: local service trades (2026-10-02)
- **Copy:** the owner supplied a new heading, intro and five cards:
  - Garage Door Services (featured)
  - Tree Services
  - Roofing & Exterior
  - Plumbing, HVAC & Electrical
  - Fencing, Concrete & Remodeling
- **Removed:** Home Services, Restaurants, Healthcare, Financial and Professional Services are gone from the homepage.
- **Icons:** each card has a new simple line icon (garage door, tree, roof, bolt, fence). Icons stay decorative; the card titles carry the meaning.
- **Links:**
  - The cards are still not links.
  - The old `href` values pointed to the five generic industry pages and were removed from the data. No URLs were invented for the new trades.
- **Phones:** below 560px the grid is now one column. At 390px, two columns made "Fencing, Concrete & Remodeling" overflow its card.
- **Open, owner to decide:** the generic industry pages still exist and are still linked from the navigation, footer and `/industries/`:
  - Home Services
  - Restaurants
  - Healthcare
  - Financial Services
  - Professional Services

  This now conflicts with the homepage's local-service focus. Options:
  1. Keep them as they are.
  2. Retire them with redirects.
  3. Replace them with pages for these trades.

### Homepage "What every managed website includes" (2026-10-02)
- **Copy:** owner copy for all six cards, plus a six-item checklist in the "Everything handled" card.
- **Backups:** kept. Backups were already stated as included across the site: the old version of this card, the pricing "Managed for you" card (owner copy), Website Care, the services menu and the About page. However, they are not listed in the plan feature lists in `data/plans.json`.
- **Uptime monitoring:** matches "Monthly uptime monitoring" in the Lite plan.
- **"Enquiry performance" in the analytics card:** owner copy. The plans only promise "Basic analytics" (Lite) and "Monthly analytics reporting" (Business). Confirm that enquiry/form tracking is part of basic analytics.
- **No ranking claims:** the decorative SEO graphic showed "#1", which implied a ranking. It is now a tick.
- **Headings:** the small cards were H4 directly under an H3 they don't belong to. They are now H3, styled at the previous H4 size.
- **Links:** no card links were added. Only Website Care and SEO have service pages, and the brief allowed links but didn't require them.

### Homepage monthly-model comparison (2026-10-02)
- **Copy:** owner copy for the dark comparison section.
  - Heading: "Your website shouldn't become outdated the moment it launches.", with "the moment it launches." in gold italic.
  - New supporting sentence.
  - Column labels: "Traditional website project" and "The SFD managed website model".
  - Three items in each column.
- **Tone:** the old lines "Stop paying for a website once and abandoning it" and "You're on your own after launch" were removed. They implied that other agencies abandon their clients.
- **Copy moved to data:** the column labels used to be hard-coded in the template. They now live in the JSON file (`traditionalLabel`, `sfdLabel`).
- **Accessibility:** the column labels are now H3s, and each list is labelled by its heading.

### Homepage concept examples: local service trades (2026-10-02)
- **Copy:** owner copy for the heading, intro and three concepts:
  - Garage Door Services (featured)
  - Tree Services
  - Roofing & Exterior

  These replace the Home Services, Restaurant and Healthcare / Professional Services concepts.
- **Disclaimer:** both the intro and each card's fixed caption still say these are illustrative, not client projects.
- **Mock-ups:**
  - The header button and the main button now have separate text, so each can say something different (`mockNavCta`, `mockHeroCta`).
  - A mock-up can list several trust points (`mockTrustCues`):
    - The garage door concept shows Licensed & Insured, Same-Day Service and Free Estimates.
    - The tree and roofing concepts show one each.
  - Each concept has a new icon (garage door, tree, roof).
  - No ratings, review counts or statistics appear in any mock-up.
- **Accessibility:** each mock-up is now one labelled image (for example, "Illustrative garage door service website concept"). Before, screen readers read out its sample text, such as "Call Now".
- **Links:** the cards are still not links; no URLs were invented.
- **Layout fix:**
  - The grid had three columns, with the featured concept spanning all three. That left an empty third column beside the two smaller cards. From 640px the grid now has two columns: the featured concept spans the full row and the two smaller cards share the row below.
  - The two smaller cards use CSS subgrid, so their mock-ups, labels, titles and captions line up even when one mock-up headline wraps.

### Homepage "Grow beyond your website" (2026-10-02)
- **Copy:** owner copy for the intro and four optional add-on services:
  - Local SEO & Google Business Profile
  - AI & Lead Automation
  - Messaging & Customer Communication (replaces the "WhatsApp" card; WhatsApp is still a supporting service per CLAUDE.md, now covered by "messaging channels")
  - CRM & Lead Tracking
- **Tone:** absolute claims removed: "Get found first", "Never miss an enquiry", "none slip through the cracks".
- **Markup:**
  - The cards are now a labelled list ("Optional services you can add to your website").
  - The titles were H4 directly under the H2. They are now H3, at the same visual size.
- **Responsive:** one column below 560px. From 560px to 1023px (tablet) the cards form a 2 x 2 grid, because at 820px "Communication" overflowed a quarter-width card. Four across from 1024px.

### Homepage final call to action (2026-10-02)
- **Copy:** owner copy, now consistent with the hero.
  - Heading: "See your new website before you pay for it."
  - A private-preview line underneath.
  - Buttons: "Get My Free Website Preview" and "Book a Free 20-Minute Call".
  - Reassurance line: "No payment. No obligation. See the preview first."
- **Removed:** "Apply for a complimentary preview" and "Free to apply".
- **Scope:** only the homepage data changed. The `cta-editorial` template is also used by About and Contact, and was left untouched.
- **Open:**
  - The homepage now has three "20-Minute" buttons (hero, final call to action and the pricing pages) while the booking pop-up offers 30 minutes. See "Pricing page copy" above.
  - The homepage FAQ intro still says "Everything you need to know before applying."

### Homepage lead offer: Free Website Review replaces the AI playbook (2026-10-02)
- **What changed:** the homepage band above the footer is now a **Free Website Review** form, using owner copy:
  - Eyebrow: "Free website review".
  - Heading: "Find out what’s holding your website back".
  - Button: "Review My Website".
  - Fields: business name (optional), website URL (required) and email (required), plus a consent checkbox.
- **Customer journey:** the Free Preview is the high-intent offer; the review is the lower-intent alternative for owners who already have a website.
- **Scope:**
  - Only the homepage changed (`"leadOffer": "website-review"` in `data/pages/home.json`).
  - **Every other page still shows the AI Prompts Playbook band**, and Pricing still hides it.
  - **Open, owner to decide:** replace the playbook sitewide (one-line change), or keep it elsewhere.
- **Backend (real, not a demo):**
  - New migration `011_create_website_reviews.sql`.
  - New endpoint `POST /api/website-review`:
    - stores the request with a `WR-` reference;
    - emails the owner and sends the visitor a confirmation.
  - Rate limits: 30 requests and 5 saved per hour.
  - Website check: `Validator::website()` gained a `required` flag.
  - Consent records use purpose `website_review`, and `Consent::WORDING_VERSION` was bumped to `2026-10-02`.
  - **The migration must be applied on deploy** (`.\deploy.bat -Migrate`). Until then the form returns a server error.
  - The review itself is prepared and emailed by hand.
- **Frontend:**
  - `templates/partials/website-review.njk` reuses the playbook band layout and the shared form system.
  - New `assets/js/website-review-form.js`.
  - New `.sfd-form--review` grid: two rows of two from 40em, one column on phones.
- **Privacy Policy** (updated 2 October 2026): now lists the review request in "Information we collect", adds a "How we use it" line, and sets retention at 24 months. **Needs legal review** with the other legal pages.


### Homepage final polish and QA pass: HOMEPAGE FROZEN (2026-10-02)
The homepage is production-ready and **frozen**. Do not redesign or rework its copy without a new owner instruction. Next phase: the Garage Door Services industry page, then Tree Services.

- **Locked CTA hierarchy:**
  - Primary: **Show Me My New Website**, every preview button → `/free-preview/`.
  - Secondary: **Book a Free 20-Minute Call**, every call button → booking modal.
  - Tertiary: **Free Audit Report** (eyebrow "Free Website Audit"), homepage band above the footer.
- **Where each label now appears:**
  - Primary: hero, preview-steps button, comparison, testimonials, homepage pricing plan buttons (Lite and Business), FAQ panel, final call to action, and the **sitewide header** button.
  - Secondary: the sitewide header link, the mega-menu promo buttons, the "More" menu, the booking modal title, and every page's call buttons.
  - Custom Solutions keeps "Let's Talk" (owner's earlier choice); it opens the same booking modal.
- **Call length is now 20 minutes everywhere:**
  - Migration `013_call_duration_20_minutes.sql`.
  - Booking modal title, booking emails and the Calendar event title.
  - All page CTAs and mentions, the Terms ("Discovery calls" clause), Book a Call, Contact and Pricing.
  - Generic "discovery call" wording remains in some service and legal body text (Privacy, Refund, Terms intro, SEO and Digital Marketing pages, a Contact FAQ). Tidy it when those pages are next edited.
- **Free Preview request simplified:**
  - Required: name, email, business name, and one "Website or Google Business Profile URL".
  - Optional: phone, main service, message.
  - Removed: country, city and the category list (which still offered Restaurants, Healthcare and so on).
  - Request wording throughout, with no "application" or "qualify".
  - Migration `012` makes the dropped columns nullable; the API mirrors the change. See docs/04 and docs/14.
- **Audit offer:** "Free Website Audit" / "Free Audit Report", in the copy, consent text, emails and Privacy Policy. The API and table names stay `website-review` / `website_reviews` (internal only). The button is now the outlined secondary style, so it does not compete with the primary CTA.
- **SEO:**
  - Title "Managed Websites for Local Service Businesses | SynergyFirst Digital", and the owner's meta description.
  - Open Graph text aligned with the title and description.
  - FAQ intro, pricing intro ("Two simple monthly plans and Custom Solutions") and the FAQ "application" wording updated.
- **Structured data:**
  - Organization (now with email and description from `data/company.json`), plus the new WebSite, Service (`page.service`, with no price, area or rating) and FAQPage (from the visible FAQs).
  - Nothing fabricated: no AggregateRating, Review, address or prices.
- **Accessibility:**
  - Mega-menu promo "We can build it for you." is no longer an H3 (it came before the H1).
  - Exactly one H1; no heading jumps in `<main>`.
  - All controls are labelled, and the audit and preview forms are checked.
- **Performance:**
  - Footer wordmark: 6667 px / 1 MB PNG → `SFD-White-logo-footer.png` (836 × 150, 42 KB), with dimensions and lazy loading.
  - Hero photo: 1400 × 1700 / 394 KB → `hero-photo-640.jpg` (66 KB).
  - The original files stay in `assets/images/` as sources (unreferenced).
- **Responsive:**
  - Hero buttons and the step-1 button no longer wrap on phones (smaller side padding below 30em).
  - Preview form fields stay aligned (`align-items: start`); the URL field is full width below 64em.
- **QA:** checked at 1920, 1440, 1400 (the header breakpoint), 1024, 820, 390 and 360px.
  - No horizontal scroll and no broken internal links.
  - One title, description, canonical and viewport; `index, follow`.
- **Preview indexing:** preview-mode builds are not implemented (`scripts/build.js` refuses `--mode=preview`). Prospect previews are therefore hosted outside this codebase and must carry `noindex, nofollow` there (docs/06).
- **Needs manual verification:**
  - Hero stats: 300+ websites, 4.8★ Google rating, 8+ years.
  - The Google-rating link and the testimonials.
  - That backups and enquiry tracking are included in every plan.
  - The 10 / 20 update counts still in the FAQ.
- **Deploy with migrations** `011` to `013`: `.\deploy.bat -Migrate`.
- **Hero amendment (owner, 2026-10-02, after the freeze):** the second hero paragraph is removed ("We’ll create a private preview using your real business information, services and public online presence. Review it first — then decide whether you want us to complete and manage it."). The hero is now the eyebrow, H1, one supporting paragraph, the two buttons, the reassurance line and the stats. The same idea is still covered by the preview-steps section and the final call to action.
- **Hero amendment 2 (owner, 2026-10-02):**
  - The two hero buttons now sit side by side wherever both fit. The grid uses `minmax(18rem, 1fr)` with less side padding, and the buttons stack on tablet portrait and phones.
  - The reassurance line ("No payment. No obligation. See the preview first.") was removed from the hero. The template still supports it, and the same line remains in the final call to action.
- **Stats above the fold:** the stats row must sit fully above the fold. Changes made:
  - The hero grid is top-aligned instead of centred; the taller before/after visual had pushed the text down.
  - Gap above the buttons: 2.5rem → 1.5rem.
  - Gap above the stats: 4rem → 1.5rem.
  - Stat padding: 1.5rem → 1rem.
- **Measured fold:**

  | Width | Viewport height | Stats bottom | Bottom tab bar (top) |
  |---|---|---|---|
  | 1920 | 960 | 594 | — |
  | 1536 | 730 | 594 | — |
  | 1440 | 790 | 594 | — |
  | 1366 | 650 | 582 | 591 |
  | 1280 | 720 | 580 | 661 |
  | 390 | 760 | 670 | 689 |

  The stats are visible at every size above. **Exception:** at 1024 x 640 (tablet landscape) the buttons stack, so the stats fall below the fold.


### Garage Door Services page (2026-11-02)
- **Built:** `/industries/garage-door-services/` from `data/pages/industries-garage-door-services.json`. Owner decisions: URL under `/industries/`; copy drafted by me for owner approval; ad-ready layout with the hero enquiry form (same pattern as `/services/websites/`); the five old generic industry pages left untouched. Structure: docs/04.
- **No new templates, CSS, API or migration.** The hero form posts to `/api/contact` with the free-text topic `Garage Door Services`. Deploy is `dist/` only (no `-Migrate`).
- **Copy rules followed:** locked CTAs (Show Me My New Website, Book a Free 20-Minute Call). Trust items are described as what we design space for, never as claims about a client. The FAQ reuses existing shared answers, so no new commercial claims. No testimonials, statistics, prices or licensing claims; the single concept card carries the template's fixed "illustrative" caption.
- **SEO:** unique title and description, production canonical, `index, follow`; WebPage, Service, FAQPage and BreadcrumbList schema (no price or rating). Listed in `sitemap.xml`.
- **Checks:** `validate`, `test:validation` and `build:production` pass. Local server: 200, no-slash 301, unknown URL 404. Measured at 390 and 1024px in same-origin iframes and at desktop width: one H1, no horizontal overflow, all seven internal links return 200. Screenshots at 1440 were reviewed (scroll-reveal sections appear faded in static captures only).
- **Not tested:** a real hero-form submission against the API; keyboard and screen-reader pass; a 1440 scroll-through in a live browser.
- **Open, owner to decide:**
  1. Approve or edit the drafted copy.
  2. Link the homepage Garage Door card and the `/industries/` index to this page. Both are outside this task (the homepage is frozen), so they stay unlinked until instructed.
  3. The five old industry pages still use the old "Get My Free Website Preview" label (keep, redirect or replace).
  4. Add garage door reviews and project photos when real ones exist.
- **Next:** Tree Services, built on this page as the model.

### Lead-response automation plan: n8n alert + demo prompt (2026-11-02, PLAN ONLY, not built)
Full plan, flow, contract, design kit, prompt rules and build order: **docs/15-lead-automation.md**. Decisions in brief:
- **Same lead fields on Free Preview and every industry hero form;** phone is now required on both. Required: name, email, phone, business name, one website or Google Business Profile URL. Optional: main service, message.
- The PHP API saves the lead, then posts a signed payload to n8n (`https://n8n.apps.synergyfirstdigital.com`) with a retry queue. n8n sends an instant Telegram alert (tap-to-call), researches the prospect with Apify, picks a palette and font pair from a curated design kit, and has OpenAI write the master prompt, delivered to Telegram as a `.md` file with Call / Build / Skip buttons.
- Demos are plain static HTML/CSS/vanilla JS on `preview.synergyfirstdigital.com`. No Node, no React.
- **Dropped:** an AI voice call-back bot (Retell), because of AI-call consent rules; do not add it back.
- Adds n8n as a step after the PHP/MySQL save; it does not replace the database (earlier n8n booking plans in docs/07 and 12 were superseded on 2026-09-20).
- Telegram bot `@SFDLeadsBot` is created and tested in n8n (done 2026-11-02; details in docs/15). Legal: Privacy Policy must name OpenAI, Telegram and Apify (pending lawyer review).

### Preview host created (2026-11-02)
`preview.synergyfirstdigital.com` is a CloudPanel Static HTML Site with SSL, separate from the main site. The vhost adds `X-Robots-Tag: noindex, nofollow` (server level and the asset block) and uses `expires 1h` for assets. Checked from outside: HTTPS 200, HTTP 301, real 404s, header present. Details and the recommended random-token URL scheme: docs/15. Nothing in this repo changed for it; the vhost is edited in CloudPanel.

### Unified lead form fields built (2026-11-02)
- **What changed:** the Free Preview form now requires phone; the Garage Door hero form switched from a contact enquiry (message required, no business or website) to the same lead fields as Free Preview (name, email, phone, business name, website or Google Business Profile URL; optional main service and message). Both post to `/api/preview-applications`; the hero form adds a hidden `trade` (`Garage Door Services`). See docs/04, docs/14 and docs/15.
- **How:** `hero-form.njk` got a `lead` mode (page JSON `form.mode`), `free-preview-form.js` validates phone, the API requires phone and stores `trade` (migration `014_preview_applications_trade.sql`), and the owner email shows phone and trade. The Websites service page hero form is unchanged (contact enquiry).
- **Checks:** `validate`, `test:validation`, `build:production` and PHP lint pass. In a browser with a mocked API: empty form shows all required errors, a missing phone blocks submit, a full submit sends the right payload with `trade`, shows the success toast and resets. Hero layout checked at 1440px (the taller form fits inside the hero band).
- **Needs deploy with migrations:** `.\deploy.bat -Migrate` (014, plus 011 to 013 if not yet applied).
- **Layout:** at 390 and 1024px the taller hero form causes no horizontal overflow and the page keeps one H1.
- **Not tested:** a real submission against the live API and database; keyboard and screen-reader pass.
- **Next in docs/15:** webhook sender with signature and retry queue, then the n8n workflow.

### Garage Door hero: everything above the fold (2026-11-02)
- **Owner request:** the taller lead form pushed the form's button below the fold; restructure the hero so no text, button or form content is below it.
- **Changes** (lead mode only; the Websites hero is untouched): two-column form from tablet width, no card intro or hint line, short phone label ("Phone *"), a half-width message box, a 28 to 33rem card and a headline that scales with width (`.hero-form--lead`, `.sfd-form--lead` in `components.css`; optional `full=false` on the shared `textarea` macro). Small laptops (61em to 87.5em) get slightly tighter copy and buttons so the hero also clears the 60px bottom tab bar shown below 1400px.
- **Measured** (hero bottom vs the fold, and the tab bar top where shown): 1920x960 ends at 630; 1440x790 at 613; 1399x700 at 578; 1366x650 at 562 (tab bar at 592); 1280x720 at 552; 1100x700 at 531 (tab bar at 641); 1024x700 at 629 (buttons stack, still clear). No horizontal overflow at any of them.
- **Exception, as on the homepage:** on tablet portrait and phones the hero stacks (copy, then form), so the form is below the fold there. A stacked layout cannot fit a seven-field form and the copy in one phone screen.
- **Not tested:** a real submission after this change (field names are unchanged, so the earlier mocked test still applies).

### Lead form: Main service full width with a commas hint (2026-11-02)
- **Owner request:** make "Main service" full width, tell visitors they can list several services separated by commas, and put "Anything we should know?" below it.
- **Done** on the Garage Door hero form and, to keep the two lead forms identical, on the Free Preview form: hint "Offering more than one service? Separate your services with commas." under the field. The message box is now full width under it. Storage is unchanged (`primary_service`, up to 200 characters, as typed), so no migration. The n8n prompt can split the services on commas.
- **Fold re-measured** (hero bottom vs window or tab bar): 1920x960 ends at 630; 1440x790 at 613; 1366x650 at 562 (tab bar 592); 1280x720 at 577; 1100x700 at 576 (tab bar 641); 1024x700 at 629 (tab bar 641). The taller card still fits, because the copy column sets the hero height.

### Service field label (2026-11-02)
- Owner request: the "Main service" label on both lead forms (Garage Door hero and Free Preview) is now **Enter Service(s)**. Hint and storage (`primary_service`) are unchanged; the owner email row still says "Primary service".

### Primary CTA renamed to "Start My Free Website Preview" (2026-11-02)
- **Owner decision:** "Show Me My New Website" read as vague: it sounds like an instant result, but the click leads to a request form and then we prepare the preview. The owner first chose "Request My Free Website Preview", saw it wrap to two lines on a button, and then chose **Start My Free Website Preview**. It supersedes "Show Me My New Website" (2026-10-02) and the older "Get My Free Website Preview" (2026-09-21).
- **Scope: sitewide, including the frozen homepage** (explicitly approved by the owner for this text change only). Every primary preview button, the header button, the Free Preview and Garage Door form buttons, plan buttons and closing calls to action now use it (about 70 places across `data/pages/*.json`, templates and one script comment). The other locked labels are unchanged: "Book a Free 20-Minute Call" and "Free Audit Report". The URL `/free-preview/`, the short nav label "Free Preview" and the "Request received" toast are unchanged. CLAUDE.md, README, docs/01, 04, 13, 14, 15 and the memory notes were updated; earlier log entries above keep the old names as history.
- **Layout fixes** for the longer label (29 characters, uppercase): `.button` gets tighter side padding and letter spacing on phones (`components.css`), plan-card buttons use tighter padding, the homepage hero buttons use a slightly smaller font on phones, and the homepage "How your free website preview works" step button reaches back under the step number on phones to use the full row (the text column is only about 240px). Checked in a browser by counting text lines in every button: no wrapping and no horizontal overflow on Home (1440, 1100, 820, 390, 360), Garage Door (1440, 1100, 390), Pricing, Free Preview, Websites, How It Works, About and Contact (1440, 390).
- **Not checked:** the older industry pages, services pages and legal pages were not measured (they use the same button styles), and the booking modal buttons are unchanged. A/B testing the label is still a good idea once ad traffic exists.

### Deploy 2026-11-02: homepage rework, Garage Door page, unified lead forms, new CTA label
- **Live:** `.\deploy.bat -Migrate -Yes` (run from PowerShell, owner approved the risks first). Build 42 pages, clean build, no new dependencies, nginx redirects unchanged, `.env` not uploaded. The previous static site is kept as `dist.bak` on the server (delete when satisfied).
- **Migrations:** the server already had 001 to 013 (the earlier 011 to 013 note was out of date); only **014** (`preview_applications.trade`) was new and applied. All 14 are now applied.
- **Script checks (all passed):** homepage, Services/SEO, Free Preview 200; `.env` 403 with no secrets in the body; API source 404; unknown URL a real 404; diagnostic page absent; old URLs 301; sitemap and robots 200; the API answers JSON.
- **My live checks (all passed):** `/industries/garage-door-services/` 200 (no-slash 301), production canonical, no `noindex`, hidden `trade` field and "Enter Service(s)" present, page listed in the sitemap; the label "Start My Free Website Preview" is on the homepage, Pricing and Free Preview and no old label remains; `POST /api/preview-applications` with an empty body returns 422 and now asks for the country code and mobile number (phone required).
- **Not verified (owner to do, real submissions create rows and emails):** submit the Garage Door hero form, Free Preview (phone required), the homepage Free Audit band and one booking with obvious test data; check the rows (hero form row has `trade = Garage Door Services`), the owner email (phone and trade shown) and the visitor confirmation; delete or mark the test rows. Hard-refresh first (Ctrl+Shift+R; static files are cached for a day). Also look at the homepage and Garage Door page at 1440 and 390px in a real browser.
- **Still open:** outbox retry cron; Google Calendar/Meet; Privacy Policy provider names (OpenAI, Telegram, Apify); lawyer review of the legal pages (now live in their 2 Oct form); delete `dist.bak`.
- **Next:** webhook sender to n8n with signature and retry queue (docs/15 step 2), then the n8n workflow and design kits, then Tree Services; linking the homepage card and `/industries/` index to the Garage Door page needs a homepage unfreeze.

### n8n webhook sender built (2026-11-02, docs/15 step 2; not deployed)
- **Built:** after a Free Preview request or industry hero lead is saved, the API queues a `lead.created` event in a new `webhook_outbox` table (migration `015`) and posts it to the n8n webhook after the response is sent, so n8n can never slow or fail a form. Failures retry with backoff up to 8 times through `api/bin/send-webhooks.php` (cron every 5 minutes, which also purges sent rows after 30 days). Code: `api/src/Webhook.php`, hook in `previewApplication()`; env `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `WEBHOOK_LOCAL`.
- **Decision:** authentication is a **shared-secret header** (`X-SFD-Webhook-Secret`, n8n Header Auth credential), not an HMAC of the body, because n8n verifies it natively and the secret stays in n8n credentials; https is enforced outside local. Reasoning and the upgrade path are in docs/15.
- **n8n side done by the owner:** workflow `SFD Lead Intake` (Webhook then Telegram "Send a text message", `SFD Leads Bot`); a production-URL test alert arrived on its own. **Still to do there:** switch the Webhook node to Header Auth.
- **Tested** against a throwaway MySQL 8 container and a fake receiver (not production): all 15 migrations apply on a fresh database; a valid lead delivers once with the right headers and body; invalid leads queue nothing; n8n down (500) still returns 201 and the retry delivers later; missing `N8N_` values keep rows queued; http is refused in production mode; local runs skip unless `WEBHOOK_LOCAL=1`; a row fails for good after 8 attempts; 31-day-old sent rows are purged. The container and test servers were removed afterwards.
- **Not tested:** the real n8n round trip from the API (needs the deploy) and a real Telegram alert from a form submission.
- **To go live (owner and a deploy):** n8n Header Auth credential and Webhook node setting; the two `N8N_` lines in the production `.env`; `.\deploy.bat -Migrate -UploadEnv` (015 is new); add the `send-webhooks.php` cron in CloudPanel; submit one real test lead. `deploy.md` and `.env.example` are updated.
- **Not wired yet:** contact enquiries, bookings, playbook and audit requests do not post to n8n.

### Demo-prompt kit built: design kits, master prompt, n8n scripts (2026-11-02, docs/15 step 3; repo side)
- **Built in `demo-kit/`:** three design kits (Garage Door, Tree Services, general local service) with 3 palettes and 3 font pairs each; `master-prompt.template.md` (the fixed rules plus placeholders); a shared library; and two **generated** n8n Code-node scripts (`n8n/1-prepare-ai-request.js`, `n8n/2-build-prompt.js`) produced by `npm run build:demo-kit`. The step-by-step n8n node setup is in docs/15 ("n8n build guide").
- **Design decisions:** the AI only picks a palette and font pair from the kit and summarises facts it was given; the rules and structure always come from the template. First-draft palettes had three WCAG AA failures (an accent invisible on its dark band, two low-contrast button texts), so the tests now check every palette; they were corrected before commit. The lead's own phone and email are kept out of the prompt; visitor text is labelled untrusted and neutralised. A Google Business Profile link has no website text, so the prompt uses form facts only and lists the rest as unknown.
- **Preview rules baked in (docs/06):** `noindex, nofollow`, sticky preview bar with a fixed 7-day UTC countdown and "Keep This Website" (to `/book-a-call/`; a real activation flow does not exist yet), the concept disclaimer, forms that do not submit, no trackers. The token URL (10 random characters, `preview.synergyfirstdigital.com/<token>/`) is generated in the Code node.
- **Tests:** `npm run test:validation` now also runs `tests/demo-kit.test.js` (20 tests: palette contrast, kit shape, trade matching, research extraction, AI answer validation, prompt contents and safety, generated scripts up to date, and both n8n scripts executed with fake n8n globals). All pass. The prompt was also read through on a sample lead.
- **Not tested:** the real n8n nodes and a real OpenAI call (the owner builds the nodes from the guide), and a demo actually built from a generated prompt.
- **Open / later:** Apify Google Maps lookup for profile-only leads (phase 2); Telegram Call / Build / Skip buttons (need a second workflow; Telegram buttons cannot open `tel:` links); the OpenAI model name in script 1 (`gpt-4.1-mini`) is a default to confirm; Privacy Policy must name OpenAI and Telegram (and Apify if used) as processors; demo expiry cron and token upload steps on the preview host; the n8n credential `Apify account` is an MCP OAuth credential and may not work with the standard Apify node.

### Demo prompt: first real run and five fixes (2026-11-02)
- **n8n branch built and tested by the owner:** Webhook, Fetch website, Prepare AI request, OpenAI, Build master prompt, Send a document (credential `SFD Leads Bot`). A signed test lead produced the instant alert plus `demo-prompt-<token>.md` (12 KB) on Telegram, every node green. The workflow still has to be toggled **Active** for live leads.
- **Review of the first prompt found five defects, all fixed in `demo-kit/`:** (1) an AI-written summary was labelled "source: website" although it came from the form, so the AI no longer writes a summary and only facts the model attributes to the website are kept, the form facts being added by the code; (2) the business name and services appeared three times, same cause; (3) the "still unknown" list was padded with near-duplicates from the AI (16 items), so the AI no longer lists missing information and the list is now fixed and short (10 items); (4) the closing button "Get a Free Quote" contradicted the rule against "free estimates" claims, so every kit's closing button is now "Contact Us" and a test forbids "free" in any kit button; (5) numeric HTML entities such as `&#8599;` were left undecoded in the website excerpt.
- **Tests:** 33 pass (new: entity decoding, no "free" in CTA labels, website-only facts, no duplicate or oversized checklist). The generated scripts changed, so **both n8n Code nodes must be re-pasted** from `demo-kit/n8n/` (script 1 changed the OpenAI instructions, script 2 changed the prompt builder).
- **Still not tested:** a demo actually built from a generated prompt, and the live (production URL) path once the sender is deployed.

### Demo prompt: second review, hero claims and call buttons (2026-11-02)
- **Second prompt reviewed** (`demo-prompt-idtmr5pcts.md`): the five earlier fixes held (3 form facts, 10-item checklist, "Contact Us", decoded entities). Two gaps remained and are fixed in `demo-kit/`: (1) the AI-written hero lines ("Professional Tree Services", "Safe and reliable care for your trees and property") contained unverified quality claims that the prompt itself forbids, so the AI is now told to state only what the business does and the code replaces any hero line containing words such as professional, safe, reliable, trusted, affordable, experienced, fast, best, quality, family or local with a plain statement built from the services (or a placeholder); the template no longer says "adjust only if it conflicts"; (2) the prompt asked for call buttons but no phone is verified for most leads, so it now says to show "Call [TO CONFIRM: phone]" as a plain button without a `tel:` link.
- **Tests:** 35 pass (new: hero guard and call-button wording). Both generated n8n scripts changed again, so **re-paste both** into the n8n Code nodes.
- **Still untested:** a demo built from a generated prompt.

### Demo prompt: third review (2026-11-02)
- **Third prompt reviewed** (`demo-prompt-y4c750p08s.md`): hero claims and the no-phone call button instruction held. Three small problems fixed in `demo-kit/`: (1) the hero headline and subheadline were identical, so a subheadline that repeats the headline is now dropped (or replaced by "Serving <area>" when known; otherwise the prompt says to leave it out); (2) the tree kit's audience note still said "a safe, professional crew", which Claude might echo as a claim, so it now says "clear information, a straightforward quote and examples of past work"; (3) the services sections listed trade examples ("trimming and pruning, storm clean-up") that the lead never claimed, so every kit's services overview and services page now say "one card/block for each service in section 3 and no others" (the trade examples are kept only as a hint).
- **Tests:** 36 pass (new: duplicate hero lines, kits free of quality words and tied to section 3). Both generated n8n scripts changed, so re-paste both once more. This is the last planned prompt change before a demo is actually built from one.

### First demo built from a generated prompt, and its review (2026-11-02)
- **Built by a separate agent** (no project access, no network, one scratch folder) from `demo-prompt-9xx1rdhpwe.md`: 3 pages, `assets/styles.css`, `assets/main.js`, `README.md`, 36 KB in total.
- **Reviewed against the prompt's checklist in a real browser** (static server, iframes at 360 to 1280px, plus an expired copy): one H1 and `noindex, nofollow` on every page; preview bar sticky with a live countdown to the single hard-coded timestamp; "This preview has expired" page replaces the content after the deadline; disclaimer and "Keep This Website" on every page; palette tokens identical to the prompt; Fraunces and Source Sans 3 loaded; only Google Fonts as an external request; no trackers or frameworks; the one form has no `action`, labelled fields, three inline errors and focus on the first invalid field, and a valid submit shows "This is a preview, so nothing was sent." without leaving the page; menu opens and Escape closes it; touch targets at least 44px; focus-visible and reduced-motion in the CSS. The copy contained **no invented claim**: only the two listed services, every unknown a visible `[TO CONFIRM: ...]` placeholder, listed in the demo's README.
- **Defects found:** (1) **horizontal scroll at 768px on all three pages**: the header held the name, three links and two buttons, and the long `Call [TO CONFIRM: phone]` label pushed "Request a Quote" off the screen (to 822px); the same will happen on every lead without a verified phone; (2) a missing space in "Call[TO CONFIRM: phone]".
- **Fix, in the prompt (demo-kit, not the throwaway demo):** the template now has a "header is where demos break" rule (below 1100px only the name, a Menu button and the single primary button; links and the call button go into the menu; no header may wrap to three lines or widen the page), a space between words and placeholders, a widened width test list (360, 390, 600, 768, 820, 1024, 1280) and a checklist item that requires measuring `scrollWidth <= innerWidth` instead of checking by eye. 37 tests pass. **Re-paste `demo-kit/n8n/2-build-prompt.js`** into the `Build master prompt` node (script 1 is regenerated but behaves the same).
- **Remaining small observations, not worth prompt changes:** an FAQ answer reads "Both are listed services"; the page weight and fonts are fine; the builder asked for the call button label: "Call Now" (section 5) conflicts with "Call [TO CONFIRM: phone]" (section 3), and followed section 3, which is the intended behaviour once a real number exists "Call Now" applies.
- **Not tested:** upload to `preview.synergyfirstdigital.com`, and a screen-reader pass.

### Demo prompt: "WOW" design bar and trade art direction (2026-11-02)
- **Owner feedback on the first demo:** correct but basic, boring and dated; wanted an ultra-modern look with subtle animation. Cause: the prompt specified colours and fonts but no composition, type scale or motion.
- **Added to `demo-kit/master-prompt.template.md`:** a "Design quality bar" (fluid oversized type with accent-coloured words from the headline itself; hero at least 85% of the first screen with layered custom inline-SVG artwork, gradient mesh and grain from the palette only; varied section layouts, bento grids, split layouts, dark bands; large radii and layered shadows; glass sticky header), a **motion** set (staggered hero load-in, `IntersectionObserver` scroll reveal, gentle parallax, ambient motion, hover micro-interactions; transform and opacity only; JavaScript under 6 KB; everything off under `prefers-reduced-motion: reduce`; page fully visible with JavaScript off because hidden states exist only after JavaScript adds a class), and a **truth guard** (never animate numbers, ratings, counters, badges or logos; no fake statistics or "trusted by" filler; text over artwork still passes contrast). Page weight allowance raised from 200 to 250 KB. A new final-checklist item requires the page to look premium and be static under reduced motion or without JavaScript.
- **Per-trade `artDirection`** added to each kit (rendered as a block in the prompt): tree services (layered treeline with parallax, swaying leaves, growth rings, drawing timeline), garage door (door panels that roll up on load, diagonal dividers, panel textures), general local service (gradient mesh, bento, timeline).
- **Tested by building it:** a separate agent built a second demo from the new prompt (`wow2demo01`, 73 KB, no images, all inline SVG). Verified in a real browser: no horizontal scroll on 3 pages at 360, 390, 600, 768, 820, 1024 and 1280px (the earlier 768px header defect is gone); all touch targets at least 44px; one H1 and `noindex, nofollow` per page; palette tokens identical to the prompt; 20 of 20 scroll-reveal elements reveal as you scroll; 5 of 5 parallax layers move; the glass header tightens when scrolled; the preview bar stays pinned; the form has no action, labelled fields, four inline errors with focus on the first, and a valid submit shows the preview message; the menu opens and Escape closes it and carries the call placeholder; every hidden-until-revealed state sits under the `.motion` class, which JavaScript only adds when reduced motion is not requested; motion JavaScript 5.6 KB; no layout properties animated; no trackers; only Google Fonts. The copy again contained **no invented claim** and every unknown was a visible `[TO CONFIRM: ...]` placeholder.
- **Small observations, not fixed:** the builder added one extra colour (`--error #9B2C1F`, about 7:1) for form errors; "wood chips below ground level" in the stump-grinding copy describes a method as a fact (generic, review per business); the five placeholder gallery frames are tall in a single column on phones, which makes that section long; the builder reported the "Call Now" label (section 5) conflicts with "Call [TO CONFIRM: phone]" (section 3) and followed section 3, the intended behaviour; the "draw themselves" art direction conflicts with "transform and opacity only", so rings scale in and the timeline uses `scaleY`, which is acceptable.
- **Tests:** 38 pass (new: every kit has art direction, prompt carries the design bar, reduced-motion, JavaScript-off and no-animated-numbers rules). **Re-paste both generated scripts** (`demo-kit/n8n/1-...` and `2-...`) into the n8n Code nodes; script 2 carries the new template.
- **Not tested:** upload to `preview.synergyfirstdigital.com`, a screen-reader pass, and the garage-door and general kits' art direction (only the tree kit was built).

### Demo prompt: builder model test, reference build and self-review step (2026-11-02)
- **Owner feedback:** the WOW demo was better but still not up to expectation; asked whether a better OpenAI model would help. **Decision: no.** OpenAI (`gpt-4.1-mini`, `OPENAI_MODEL` in script 1) only returns a small JSON (palette, fonts, services, hero lines, facts); the design comes from the Claude model that builds the site. Switching to `gpt-4.1` stays a one-line option for better facts only.
- **Builder-model test:** the same prompt built by Fable gave a cleaner, more consistent page but the hero's right half was empty, sections were tidy cards on pale backgrounds and photo frames were blank. So the prompt, not the model, was the limit.
- **Reference build:** a Fable agent built `demo-kit/reference/tree-services/` (3 pages, 164 KB, 4 self-review rounds with screenshots): layered SVG hero tree with parallax and sway, generated tree-lines, word-by-word headline reveal, cursor-spotlight cards, stacked sticky steps, self-drawing rings, designed photo placeholders. Checked by measurement at 8 widths and by screenshot; hero is clearly stronger.
- **Prompt changes:** new "Techniques from SFD's reference build" block (10 reusable techniques plus the headless Chrome 500px window warning: check phones in a 390px iframe) and a new section 10 "Look at your own work, then fix it" (screenshots at 1440/390, at least two fix rounds). Test added; 39 pass. **Re-paste both n8n scripts.**
- **Open:** the techniques are text only, the reference folder is optional to attach; garage-door and general kits still unbuilt; recommend running the builder on the strongest Claude model.

### Garage door reference build (2026-11-02)
- Owner judged the tree reference "much much better" and asked for the same for garage doors. A Fable agent built `demo-kit/reference/garage-door/` (3 pages, about 100 KB) from a prompt rendered with the real garage kit and the new techniques and self-review step; four screenshot rounds, `scrollWidth <= innerWidth` at 360 to 1280 on all pages (builder's measurement), no invented claims.
- Distinct from the tree build: 6-panel SVG garage door that rolls up in the hero, steel-strip headline shutter, three-layer SVG garage with swaying lamp, rooftop silhouettes, diagonal dividers, panel-line and rivet textures, accent stripe sweeping once, stacked sticky steps with sensible gaps. Home page reviewed by screenshot (hero and full page).
- Prompt unchanged by this build. Remaining: general kit has no reference build; techniques are still text-only in the prompt.

### Deploy 2026-11-02: new site, webhook sender and migration 015
- Ran `.\deploy.bat -Migrate -UploadEnv -Yes` at the owner's request. Validation, 39 tests and production build (42 pages) passed; migration 015 (`webhook_outbox`) applied (001 to 015 now all applied); production `.env` uploaded (now includes `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET`); `dist.bak` kept for rollback.
- All deploy script live checks passed (homepage, Free Preview, SEO, 404s, redirects, sitemap, robots, `.env` 403, API JSON). Extra spot check: `/industries/garage-door-services/` 200 and in the sitemap; "Start My Free Website Preview" present, "Show Me My New Website" gone.
- **Not yet done:** CloudPanel crons (`php .../api/bin/send-webhooks.php` every 5 min; `send-outbox.php` every 10 min), so queued webhooks and failed emails are only sent right after a request until the crons exist; one real test lead (owner will test forms); Privacy Policy provider names; lawyer review; delete `dist.bak` when satisfied.

### Tree Services industry page (2026-11-03)
- **Built:** `/industries/tree-services/` from `data/pages/industries-tree-services.json`, a copy of the Garage Door structure with tree-specific copy (owner approval of the copy pending, as for the garage page). Hero form posts to `/api/preview-applications` with trade `Tree Services`.
- **Copy decisions:** no promise of photo uploads (the form system has none); the illustrative concept shows neutral cues instead of "Licensed & Insured", "Same-Day Service" or "Free Estimates"; no statistics, testimonials or prices.
- **Checked:** `npm run validate`, `npm run test:validation` (39 pass) and `npm run build:production` (43 pages). In a browser: one H1; no horizontal scroll at 360, 390, 768, 1024 and 1440px; hero form fully above the fold at 1440x900 and 1024 wide (bottom at 629 and 649px). Not checked: no-slash redirect and sitemap on the live site (not deployed).
- **Still open:** not deployed; not linked from `/industries/`, the homepage card or navigation (homepage unfreeze needed); Roofing, Plumbing/HVAC/Electrical and Fencing/Concrete/Remodeling pages not started; fate of the five old generic industry pages.

### SEO, AI Overviews and generative-search pass on the two industry pages (2026-11-03)
- **Scope:** `/industries/garage-door-services/` and `/industries/tree-services/`, plus shared schema and head tags (additive only; no visible change elsewhere).
- **Found:** both pages were orphans (not linked from anywhere, only in the sitemap); FAQ answers were generic and identical on both pages; schema had no `@id`, no `dateModified`, no link between WebPage, Service and Breadcrumb; page titles and a meta description were long (the tree description was 174 characters); no `twitter:` or `og:site_name`/`og:locale` tags; no short extractable definition near the top; the garage concept card used unverified trust cues.
- **Changed:**
  - **Answer-first block:** each page now has an "In short" `content-block` right under the hero ("What is a managed website for a ... company?"), a two-sentence definition naming SynergyFirst Digital, the monthly model, no upfront fee, plans from $249/month and the free private preview. Only facts from `plans.json` and the FAQ.
  - **Page-specific FAQs:** six new shared FAQ items (`tree-website-needs`, `tree-quote`, `tree-storm`, `garage-website-needs`, `garage-urgent`, `garage-paths`); each page now shows 3 specific plus `cost`, `preview-free`, `ownership`, also emitted in FAQPage schema. No response-time promises.
  - **Titles and descriptions:** "Tree Service Website Design | SynergyFirst Digital" and "Garage Door Website Design | SynergyFirst Digital"; both descriptions under 160 characters.
  - **Schema (`templates/partials/schema.njk`):** `@id` on Organization, WebSite, Service, WebPage, BreadcrumbList; WebPage gets `isPartOf`, `publisher`, `inLanguage`, `dateModified` (from `lastUpdated`), `about` and `breadcrumb`; Service gets `url` and an `Offer` with the Lite starting price (`service.startingPrice`, USD per month) pointing to /pricing/. No ratings, areas served or invented data. All JSON-LD in the build parses.
  - **Head tags (`base.njk`, sitewide):** `og:site_name`, `og:locale` (en_US), `og:image:alt`, `twitter:card` and twitter title, description and image.
  - **Internal links:** the two pages link to each other (related cards), and both are now the first two cards on `/industries/` (the index is not the frozen homepage); the index meta description names them.
  - **Garage concept card:** cues changed to "Call Now / Service Areas / Photos of Past Work".
- **Open, needs the owner:** the homepage Garage Door and Tree Services cards still do not link (homepage frozen), the single biggest remaining internal-link gain; a per-page Open Graph image (all pages use the default); Google Search Console and Bing submission after the deploy; local-business schema can only be added per client, not for SFD's own pages. Not tested: Google's Rich Results Test (needs the live URL); not deployed.
- **robots.txt** already allows all crawlers including AI crawlers; no `llms.txt` was added (little proven value).

### Internal linking audit and fixes (2026-11-03)
- **Audit** of all 42 built pages: no broken links, no links to redirected URLs, no missing trailing slashes. Gaps: the two trade pages had only the `/industries/` index and each other as inbound links; `/industries/` had one inbound link (About); the homepage trade tiles were not links; the breadcrumb schema had no visible breadcrumbs.
- **Owner authorisation:** the owner asked to fix linking across the entire project, so the frozen homepage was changed for links only (no redesign).
- **Fixed:** homepage Garage Door and Tree Services tiles are now links (heading link covering the tile, focus ring, arrow) plus a "See all industries" link; new **Industries** footer group; **Industries** in the Our Work mega menu and mobile drawer; Industries cards on `/services/websites/` and `/websites/`; visible breadcrumbs on every page with breadcrumbs; the footer grid is 5 columns from 1100px, 3 from 768px. The two trade pages now have 41 inbound links each (3 from page content); `/industries/` 41 (4 from content).
- **New guard:** `check-output.js` fails the build on broken internal links and orphan pages (verified by temporarily breaking a link).
- **Checked:** `npm run validate`, 39 tests, production build (43 pages); trade pages at 1280, 1366, 1440 and 390px wide: one H1, no horizontal scroll, hero form still above the fold (bottoms 609 to 661px with the breadcrumb strip). Homepage tiles seen at 1440px. Not checked: footer at 390 and 768px by eye, and every other page with breadcrumbs.
- **Still open:** About, Services hub and the three Resources pages are linked only from the header and footer (no body links); Roofing, Plumbing/HVAC/Electrical and Fencing/Concrete/Remodeling tiles stay unlinked until their pages exist; **social image is pending for all pages together** (owner decision 2026-11-03); deploy only after all service pages and linking are finished.

### Removed the five generic industry pages (2026-11-03)
- **Owner decision:** work only on the homepage niches (Garage Door, Tree, Roofing & Exterior, Plumbing/HVAC/Electrical, Fencing/Concrete/Remodeling); remove stale and redundant pages and content. This resolves the open question from 2026-10-02 (keep, redirect or replace the generic pages): **removed**.
- **Deleted:** `data/pages/industries-{home-services,restaurants,healthcare,financial-services,professional-services}.json` and the empty `data/industries/` folder. Build is now 38 pages.
- **301 redirects** (single hop) added to `data/redirects.json` from each old URL to `/industries/`, because the pages were live from the earlier deploy. `deploy/nginx-redirects.conf` changed, so the next deploy will say the vhost needs a manual update: paste the new file contents into the CloudPanel vhost (deploy.md step on redirects).
- **Content updated:** `/industries/` index lists only the two live trades (meta description rewritten); About "Who we work with" section now shows Garage Door and Tree Services and the trade-specific intro; FAQ `about-who-we-work-with` names the real niches; `docs/01`, `docs/02`, `docs/05`, `CLAUDE.md` example URL updated.
- **Not changed (owner to say if stale too):** case studies and portfolio (real client work, any industry); the Free Tools, Blog and Resources pages; the pricing and service pages for SEO, care, marketing and AI; the historical docs (`docs/13`, `docs/SFD_About_Page_Copy_and_Claude_Prompt.md`) which describe earlier decisions.
- **Checked:** validation, 39 tests, production build with the new internal link guard (no broken links, no orphans); no reference to the old URLs remains in `dist/` or the sitemap.

### Deploy 2026-11-03: trade pages, SEO, linking and page removal
- Ran `.\deploy.bat -Yes` (no migrations, no `.env` upload) at the owner's request, after the owner changed the plan (earlier: deploy after all pages; now deploy everything, then continue with the next industries). Validation, 39 tests and the production build (38 pages, internal link guard) passed; all deploy script live checks passed; `dist.bak` kept for rollback.
- **Live spot checks:** `/industries/`, `/industries/garage-door-services/` and `/industries/tree-services/` return 200 and are in the sitemap; the homepage links to the Tree Services page; the breadcrumb is on the page; the removed pages (`/industries/restaurants/`, `/industries/home-services/`) return 404 for now.
- **Owner action pending:** the nginx redirects changed. Until the CloudPanel vhost block is replaced with the new `deploy/nginx-redirects.conf` (deploy.md step 9), the five removed industry URLs return 404 instead of a 301 to `/industries/`. The deploy script will not remind again.
- **Still open:** crons for `send-webhooks.php` and `send-outbox.php`; real test lead; Search Console and Bing submission of the two trade pages; Rich Results Test on the live pages; social image for all pages; remaining three trade pages.

### Crons and vhost redirects added in CloudPanel (2026-11-03)
- Owner added both cron jobs (screenshot checked): `*/5 * * * *` `send-webhooks.php` and `*/10 * * * *` `send-outbox.php`, commands exactly as in deploy.md Appendix B. This closes the "outbox retry cron missing" item open since 2026-09. Not yet verified by a real queued row (owner tests the forms at the end).
- Owner also received the 12 new redirect lines for the vhost (`/pricing/websites/` plus the five removed industry pages); applying and the 301 check are the owner's.

### Roofing & Exterior industry page (2026-11-04)
- **Built:** `/industries/roofing-exterior/` (`data/pages/industries-roofing-exterior.json`), modelled on the Tree Services page with roofing copy (storm and leak calls, repair vs replacement vs exterior work, estimates after a roof inspection, trust information the business can genuinely show). Copy awaiting owner approval.
- **SEO, AIO and GEO built in:** title "Roofing Company Website Design | SynergyFirst Digital" and a 147-character description; answer-first "What is a managed website for a roofing company?" block (plans from $249 per month, free private preview); four roofing-specific FAQs plus two shared ones, also in the FAQPage schema; Service schema with starting price, WebPage with `isPartOf`, `about`, `breadcrumb` and `dateModified`; visible breadcrumb; one H1.
- **Internal links (37 of the other 38 pages link to it):** footer Industries group, homepage Roofing & Exterior tile (now a link), `/industries/` index, About "Who we work with", the Garage Door and Tree pages' related cards, the Roofing page's own cards back to both, and the Our Work menu description. The `/services/websites/` and `/websites/` Industries cards mention roofing.
- **Checked:** validation, 39 tests, production build (39 pages) with the broken-link and orphan guard; in a browser at 1024, 1280, 1366, 1440 and 390px: one H1, no horizontal scroll, hero form above the fold on desktop (bottoms 609 to 676px). The sitemap lists the page. Not deployed.
- **Open:** Plumbing/HVAC/Electrical and Fencing/Concrete/Remodeling pages; the owner confirmed the vhost redirects were saved (301 check not seen by me); social image for all pages; Search Console and Bing submission after deploy.

### Plumbing, HVAC & Electrical industry page (2026-11-04)
- **Built:** `/industries/plumbing-hvac-electrical/`, one page for the three trades (matches the homepage card), modelled on the Roofing page. Copy awaiting owner approval. Generated with a script so the page, FAQs and every link were added in one pass.
- **SEO, AIO and GEO:** title "Plumbing, HVAC & Electrical Websites | SynergyFirst Digital" (59 characters; the first draft was too long and was shortened), 152-character description, answer-first definition block, four trade-specific FAQs plus two shared in the FAQPage schema, Service, WebPage and BreadcrumbList schema, visible breadcrumb, one H1.
- **Internal links (all 38 other pages link to it):** footer Industries group, homepage tile, `/industries/`, About, related cards on the Garage Door, Tree and Roofing pages (and back), mega menu and Industries cards on `/services/websites/` and `/websites/` reworded to "garage door, tree, roofing and home trade companies".
- **Checked:** validation, 39 tests, production build (40 pages, broken-link and orphan guard); browser at 1024, 1280, 1366, 1440 and 390px: one H1, no horizontal scroll, hero form above the fold on desktop. Not deployed.
- **Open:** Fencing, Concrete & Remodeling page (last homepage niche); deploy; social image for all pages; Search Console and Bing.

### Fencing, Concrete & Remodeling industry page (2026-11-04)
- **Built:** `/industries/fencing-concrete-remodeling/`, the last of the five homepage niches, modelled on the Plumbing page (project-gallery emphasis, quotes after a site visit). Copy awaiting owner approval. All five homepage industry tiles now link to a page.
- **SEO, AIO and GEO:** title "Fencing, Concrete & Remodeling Websites | SynergyFirst Digital" (62 characters, slightly long but kept so the three trades stay in the title), 158-character description, answer-first definition block, four specific FAQs plus two shared in the FAQPage schema, Service, WebPage and BreadcrumbList schema, visible breadcrumb, one H1.
- **Internal links (all 39 other pages link to it):** footer Industries group, homepage tile, `/industries/`, About, related cards on all four other trade pages (and back).
- **Checked:** validation, 39 tests, production build (41 pages, broken-link and orphan guard); browser at 1024, 1280, 1366, 1440 and 390px: one H1, no horizontal scroll, hero form above the fold on desktop. Not deployed.
- **Demo kit note:** only Garage Door and Tree Services have their own design kit; Roofing, Plumbing/HVAC/Electrical and Fencing leads fall back to the general local-service kit.
- **Open:** deploy; social image for all pages; Search Console and Bing submission; optional trade-specific demo kits and reference builds; the owner reading and approving the copy of all five trade pages.

### Second SEO, AIO, GEO and internal-link audit of the whole build (2026-11-04)
- **Method:** a script over the 40 built pages (titles, descriptions, canonicals, robots, Open Graph and Twitter tags, `lang`, H1 count, heading levels, image alt text, schema against visible FAQ text, sitemap, inbound links by place in the page, anchor text, click depth). Not run against the live site; Google's Rich Results Test is still to do after the deploy.
- **Passed:** one H1 and a canonical on the page itself on every page; no duplicate titles or descriptions; no heading-level skips on the trade pages and homepage; no images without alt; every FAQ question and answer in the schema also appears as visible text on the five trade pages; all five trade pages are in the sitemap with `lastmod`; click depth 1 from the homepage; every page reachable; no generic anchors ("click here", "read more"); each trade page has 5 to 7 inbound links from page content (about 39 in total including the header and footer).
- **Fixed:**
  - **Internal links:** the five trade pages now link to each other in full (Plumbing was missing Tree; Fencing was missing Garage Door and Tree).
  - **`/industries/` index:** it had only a hero and cards. Added an answer-first "What do we build for local service businesses?" block and a four-question FAQ (also in schema as FAQPage).
  - **Meta length:** the `/industries/` description was 220 characters (now under 160). Shortened titles or descriptions on How It Works, Pricing, the Website Care and Digital Marketing pricing variants, the Digital Marketing service page and three case studies, none changed in meaning.
- **Left alone on purpose (homepage is frozen):** the homepage title is 68 characters and its description 166, so Google may truncate them. Suggested: title "Managed Websites for Local Service Businesses | SynergyFirst" (about 60) and cut "Professional" from the description. Owner to approve.
- **Still open:** one shared social image for every page (owner: all pages together); Search Console and Bing submission, then the Rich Results Test on live URLs; the AI-crawler policy is allow-all (`robots.txt`), unchanged.

### Deploy 2026-11-04: all five trade pages live
- Ran `.\deploy.bat -Yes` at the owner's request (no migrations, no `.env` upload, nginx redirects unchanged). Validation, 39 tests and the production build (41 pages, link guard) passed; all deploy script live checks passed; `dist.bak` kept for rollback.
- **Live spot checks:** `/industries/` and the five trade pages return 200, each trade page has the breadcrumb and FAQPage schema; the sitemap lists all six; the homepage links to all five trade pages. The owner's vhost redirects work: `/industries/restaurants/` and `/industries/home-services` return 301 to `/industries/`, and `/pricing/websites/` returns 301 to `/pricing/`.
- **Still open:** submit the five trade URLs (and the sitemap) in Google Search Console and Bing, then run the Rich Results Test on the live URLs; one shared social image for all pages; homepage title and description length (owner to approve the suggested wording); owner approval of trade-page copy; a real test lead through the live forms (crons are in place); optional trade-specific demo kits.

### Sitewide motion layer (2026-11-04)
- **Owner request:** no visible WOW or Framer-style animation anywhere; add subtle animations on all pages and a particle effect. This included the frozen homepage (explicitly in scope: "across all the pages"); no homepage layout or copy changed.
- **Decision on particle.js:** not used; a vanilla canvas field (`assets/js/motion.js`) does the job with no dependency, consistent with rule 2 of CLAUDE.md. Details and rules in `docs/03` (Motion system).
- **Added:** ambient particle and glow fields on all dark bands and the light homepage hero; word-by-word headline reveals; staggered card entrances; cursor spotlight on cards; magnetic hero buttons and a hover sweep on primary buttons; scroll-progress bar; page cross-fade (view transitions).
- **Checked in a real browser:** no console errors on the homepage; motion class and fields present (4 fields on the homepage, 2 to 3 on inner pages); particles visible on a dark hero and on the pricing hero; the Our Work mega menu opens above the hero; no horizontal scroll at 390, 768 and 1440px on the homepage, a trade page, Pricing, About and Contact; with reduced motion forced, the layer is off and the page is static. Not measured: Lighthouse and real-device frame rates (the field is capped at about 35 fps, pauses off screen, and uses fewer particles on phones); Safari and Firefox.
- **Not deployed.** After deploy, hard-refresh (assets are cached for a day) and check the homepage on a real phone for smoothness; if it feels heavy, lower the particle counts in `createParticleField`.

### Deploy 2026-11-04 (later): sitewide motion layer live
- Ran the deploy script with `-Yes` (no migrations, no `.env` upload, redirects unchanged). Validation, 39 tests and the production build (41 pages) passed; all live checks passed; `dist.bak` kept.
- Live: `assets/js/motion.js` and `assets/css/motion.css` are served and linked from the homepage and the trade pages. Visual check on the live site is the owner's (hard-refresh first; static files are cached for a day).

### Royal redesign and Light / Dark / System mode (2026-11-04)
- **Owner request:** add dark, light and system modes; make the site more royal, elegant and classy, with free design decisions, then deploy.
- **Decisions:** keep the brand violet and gold in light mode, move to ivory backgrounds and a classical serif (Cormorant Garamond) for headings, gold-edged buttons and hairlines. After the first dark theme used violet-black (owner: "default colours used by AI"), dark mode was redone as obsidian, oxblood and gold. Details and token rules in `docs/03` (Royal theme and Light / Dark / System mode).
- **Done:** theme tokens and the dark block; 42 foreground uses of `--color-primary` moved to `--color-link`; `royal.css`; header theme button, More drawer switch, pre-paint script, `theme.js`; particles and glows follow the theme; field borders darkened for the 3:1 rule.
- **Checked:** validation, 39 tests and the production build; in a real browser: homepage, roofing page, Contact, Pricing, About footer and the booking dialog in dark, homepage and roofing in light; hero buttons stay on one line and nothing scrolls sideways at 390, 768, 1100 and 1440px on the homepage, a trade page, Pricing and Contact in both themes; hero forms still above the fold on desktop (bottoms 603 to 675px); contrast computed for the main pairs.
- **Not checked:** every page in dark mode by eye (case studies, legal pages, tools, blog, 404), the mobile More drawer visually, Safari and Firefox, and real-phone performance.
- **Open:** mention the theme preference in the Cookie Policy; owner to look at dark mode on the less-visited pages and report anything off.

### Deploy 2026-11-04 (evening): royal theme and Light / Dark / System live
- Ran the deploy script with `-Yes` (no migrations, no `.env` upload, redirects unchanged). Validation, 39 tests and the production build (41 pages) passed; all live checks passed; `dist.bak` kept. Live: `royal.css`, `theme.js` and the new tokens are served; the homepage carries the pre-paint theme script, the header theme button and the Cormorant Garamond font link.
- Owner to do: hard-refresh (assets are cached for a day), try the three modes, look at the less-visited pages in dark mode and report anything off; Cookie Policy wording for the theme preference.

### Midnight-glow dark theme and richer motion (2026-11-05)
- **Owner request:** none of the earlier dark palettes liked; wanted something like the Framer product video (near-black, glowing blue, frosted glass); then asked for other libraries beyond particles, and to deploy so they could check.
- **Done:** dark tokens replaced by midnight glow (`tokens.css`); the oxblood and gold dark rules in `royal.css` replaced by blue-glow rules (body glow, hero bands, frosted cards, blue buttons, footer glow); dark-only travelling card-border beam, drifting aurora and film grain; Lenis smooth scrolling (`assets/js/vendor/lenis.min.js` from npm `lenis` 1.3.27, plus `smooth-scroll.js`); particles pale blue in dark. GSAP and OGL were considered and skipped (weight; CSS covers the look). Temporary `?lab=` switcher and test palettes were removed before commit.
- **Checked:** validation, 39 tests, production build; in a real browser the homepage and Pricing in the experiment and the roofing page in dark and light after folding in; Lenis, beam and aurora confirmed running; no horizontal scroll on the roofing page at 1440.
- **Not checked:** every page in dark mode, mobile widths, phone performance of blur and grain, contrast figures for the new dark palette (not recomputed), Safari and Firefox.
- **Open:** owner to judge the scroll feel, beam brightness and grain; Lenis licence file is not added to the repo (MIT, from the npm package).
- **Deployed 2026-11-05** with `.\deploy.bat -Yes` (no migrations, `.env` or redirect changes); all live checks passed; `dist.bak` kept. Live: `royal.css`, `smooth-scroll.js` and `vendor/lenis.min.js` served; homepage loads Lenis.

### Homepage rework: real work first, calmer look, simpler application (2026-11-05)
- **Owner instruction:** pasted conversion advice for the homepage (reduce constellation backgrounds and heavy button shadows; order: offer with real project and starting price, three real projects, one testimonial, preview process, industry examples, inclusions, plans with clear conditions, introduction, FAQ and CTA; measure the funnel; simpler application). Owner answers: calm the **homepage only**; projects **EV World360, The BrandBook Company, Budget Opticals**; funnel tracking via **our own API, no cookies** (separate phase); application cut to the minimum.
- **Done:** new section order (`docs/04` Homepage); hero shows a real EV World360 screenshot linked to its case study and "Managed website plans from $249/month" plus commitment terms (both from `plans.json`); three-project `case-study-grid` (new optional `cta`); one featured testimonial; plan cards now followed by commitment and buyout terms (new `showTerms` on `pricing-highlight`); CTO founder note added; `statement` and `growth-modules` removed from the homepage. Calm homepage: no particle canvas, soft button shadows, no dark-mode card beam, quieter aurora. Dark mode: leftover gold glows (testimonials band, contact card, footer underline) turned blue sitewide.
- **Application form:** Free Preview and trade hero forms now ask only name, email, phone, business name, website or Google profile, and consent. Email was kept although "4 fields" was suggested, because the preview link and confirmation go by email. Services and notes are no longer collected (API unchanged, fields optional).
- **Checked:** validation, 39 tests, production build; homepage in dark at 1440 (hero, projects, testimonial, plans and terms, founder note); homepage, Free Preview and the roofing page at 390, 1024 and 1440: one H1, no sideways scroll, locked CTA labels present.
- **Not checked:** homepage in light mode below the hero; real phones; a live form submission with the shorter form.
- **Open:** phase 2, cookieless funnel tracking (CTA click, form start, submitted via a beacon to the PHP API; qualified, preview delivered and paid as lead statuses; production hours per customer) needs a migration and its own session; owner to confirm the hero project choice (EV World360) and the homepage title/description suggestion from 2026-11-04; n8n demo pipeline no longer gets the services text from the form.- **Follow-up (same day, owner):** the hero's single project image became a Framer-style **curved carousel** of four real projects (EV World360, BrandBook, Budget Opticals, Siddhant Cinevision). Pure CSS 3D, no library; checked at 390, 768, 1024 and 1440 with no sideways scroll. Not checked on real phones or Safari (3D transforms and masks).

### Open items closed before the homepage deploy (2026-11-05)
- **Owner instruction:** "complete the open tasks first and then deploy."
- **Funnel tracking (phase 2) built:** migration 016, `POST /api/events`, `assets/js/funnel.js`, `api/bin/lead-status.php`, `api/bin/funnel-report.php`; design and commands in `docs/14` (Funnel tracking). Cookieless by owner decision; the policies describe it. Checked in the browser: a hero CTA click sends `cta_click` with the page path; focusing the Free Preview form sends `form_start` once. Not checked against a database before deploy (no local tunnel open); verified live after the migration.
- **Homepage title and description:** now "Managed Websites for Local Service Businesses | SynergyFirst" (60 characters) and a 153-character description without "Professional", as suggested 2026-11-04. Owner approved by asking for the open items to be completed.
- **Privacy Policy** (`lastUpdated` 2026-11-05): sharing list now names n8n, OpenAI (preview drafting from the details given and the public website) and Telegram (team alerts); analytics providers only if added and accepted; cookies clause explains the theme preference in local storage and the cookieless funnel counting. **Cookie Policy** (2026-11-05): same two additions. Still needs the lawyer review (BLOCKING before legal launch stays).
- **Lenis licence** added at `assets/js/vendor/lenis.LICENSE` (MIT).
- **Light mode** homepage checked below the hero (projects, plans and terms).
- **Still open after this:** lawyer review of the legal pages; the shared social (OG) image; `dist.bak` cleanup; real-phone and Safari checks of the carousel and dark effects; owner to run `funnel-report.php` after a few weeks and set lead statuses as requests progress.
- **Deployed 2026-11-05 (second deploy)** with `.\deploy.bat -Migrate -Yes`: migration 016 applied, all live checks passed, `dist.bak` kept. Verified live: `POST /api/events` 201 for a valid step and a validation error for an invalid one (one test row in `funnel_events`, page `/deploy-check/`, ignore it in reports); short homepage title; carousel markup; Lenis served; Privacy Policy names OpenAI; Cookie Policy mentions the theme; no service field on the Free Preview form. Owner next: hard-refresh, submit each form once, then set lead statuses with `lead-status.php` as requests progress.

### Studio redesign after dovvstudio.com (2026-11-05)
- **Owner instructions, in order:** make light and dark mode more elegant and professional with a different font pair (gianmediagroup.com, then hamol.studio as references); then "redesign this project as per dovvstudio.com, nice clean and professional"; then "layout same as this website with all the animations, fonts, styling" while keeping the multi-page structure and content; then match the top header to DOVV's and add its text hover animations. CLAUDE.md rule 14 applied: the patterns were rebuilt in our own code; no markup, assets or copy were taken.
- **Done:** tokens rewritten (monochrome, one violet accent, no gold; Inter plus Archivo Black display); `royal.css` replaced by `studio.css` and `studio-layout.css`; glow, aurora, grain, card beam, particles, spotlight and button shine removed sitewide (Lenis, reveals and magnetic buttons stay); homepage: statement hero with stickers, logo marquee, black project panels, scroll-lit quote, one black band for process, pricing and founder note, "Let's talk" footer, desktop dock; header reduced to logo, theme pill, Menu pill and one button; word flip on the statements. The hero carousel from earlier today was retired by this layout (code kept behind `section.carousel`). Details in `docs/03` (Studio theme, Studio layout).
- **Checked:** validation, the 39 tests and the production build with its link and orphan guard (two pages that only the old header nav linked, `/services/` and `/resources/free-downloads/`, are now in the footer groups); in a real browser at 1440: the homepage top to bottom in light and dark, Pricing and the roofing page in both themes, the Menu drawer opens from the header, the word flip on hover and idle; no sideways scroll on the homepage, roofing, Pricing and Contact at 390, 768 and 1024 (the dock is hidden there and the tab bar shows); dark-mode contrast on a trade page 5.2:1 or better on every pair. Light-mode contrast after the font change was checked by eye only.
- **Not checked:** real phones, Safari and Firefox (clip-path starburst, marquee masks), the remaining pages in dark mode, Lighthouse.
- **Open:** the homepage de-clutter list (remove the trust strip, the preview concepts, the hero price line and one of the three closing asks) awaits the owner; whether to self-host Inter and Archivo Black; the booking link now lives in the hero status pill, the drawer, the footer and the dock rather than the header.
- **Not deployed.** Committed for the owner to review locally; deploy on request.
- **Follow-up (same evening):** the owner shared `docs/text-effect.mp4` (DOVV's hover effect recorded). It is a per-letter, cursor-distance weight field on a variable font, not a word flip: replaced the flip with that (Archivo variable instead of Archivo Black; `studio-fx.js` weight field; `docs/03`). The video is 46 MB and stays out of the build (docs/ is not published); consider removing it from the repo once the effect is approved.
- **Fix (same evening):** thinner weights are narrower, so a thinned cluster re-wrapped the headline from three lines to two (owner screenshot). Each letter now keeps the width it has at weight 900 (measured after the fonts load and again on resize), so the layout never moves; verified with the pointer on three letters: three lines and the same H1 width every time.
- **Footer (same evening, owner: ours is too cluttered, make it like the reference):** rebuilt as four columns with a bold/small hierarchy, the support email and a Based in India block with local time (docs/03). Social links are not shown because footer.social is empty. Checked at 1440 and 390 on Pricing: four columns, no sideways scroll, validation and the link guard pass.
- **Footer follow-up (2026-11-05, later):** owner asked for a full-width footer like the reference, the Resources column removed, a tighter Services list and an "Ask AI about SynergyFirst" tile row under the local time. Done (`docs/03` Footer, second pass). About Us and Free Downloads were added to the Menu drawer so no page lost its last link. Checked at 1536 and 390 (no sideways scroll), build guards pass. Committed, not deployed.
- **Footer bottom bar (2026-11-05, later):** owner asked for the reference layout: logo left, copyright centre, Back to top right. Done; legal links sit under the copyright. Checked at 1536 and 390. Committed, not deployed.
- **Footer legal links (2026-11-05, later):** owner asked to move the legal row out of the bottom bar into the last column for a compact bar. Done as a "Legal" group under Ask AI. Checked at 1536 and 390. Committed, not deployed.
- **Footer dividers (2026-11-05, later):** hairlines between Pages/Services and Ask AI/Legal on owner request. The Cookie settings indent the owner saw was the cached stylesheet; the fix from 164678c already lines it up. Committed, not deployed.
- **Dock overlap + claim change (2026-11-05, later):** owner reported the dock covering the hero buttons on a short viewport (1920×865): the dock now hides while a hero button row is under it (`docs/03`). Owner also changed the figure "300+ websites delivered" to **50+**; applied to the hero sticker, the homepage stat strip and the Contact page stat so the site states one figure (rule 13). Committed, not deployed.
- **Hero stickers restyled (2026-11-05, later):** owner asked for the reference's floating-sticker styling and hover effects. Rebuilt in our own CSS/JS (`docs/03` Stickers v2): white rim, bold label, shadow, pop-in, hover scale + counter-tilt + pointer sheen. Drag-and-drop stickers (the reference has them) left out; ask if wanted. Checked at 1536 (hover) and 390. Committed, not deployed.
- **Sticker gradients (2026-11-05, later):** owner asked for the reference's holographic fills. Multi-stop foil gradients plus a permanent shine; the rating star shows the figure large with a caption. Committed, not deployed.
- **Big quote (2026-11-05, later):** owner asked whether the scroll-lit quote was overpowering; offered trimming the quote or only resizing; owner chose resize only. Done (`docs/03`). Committed, not deployed.
- **Testimonial heading (2026-11-05, later):** the eyebrow "WHAT CLIENTS SAY" and the heading "What a client says" repeated each other; heading is now "In their own words". Committed, not deployed.

### Deploy 2026-11-05 (third): studio redesign
- **Shipped:** the whole studio redesign (Inter + Archivo variable, statement hero with foil stickers and hover, weight field, logo marquee, project panels, quieter scroll-lit quote, black band, full-bleed four-column footer with Ask AI tiles and Legal group, desktop dock that steps aside for hero buttons, minimal header with Menu drawer), the "50+ websites delivered" figure, and the "In their own words" heading. Commit 18b5d19. No migrations (016 stays the latest), no new dependencies, nginx redirects unchanged.
- **Verified live:** all script checks pass (homepage, redirects, 404, `.env` and API source not public, sitemap, robots, API JSON). The first run reported the homepage as 000 (a transient connection error right after the swap); `-VerifyOnly` a moment later passed all 16 checks and a direct request returned 200. The live homepage contains the 50+ sticker, the new heading and the Ask AI footer.
- **Not checked live:** real phones, Safari and Firefox, the remaining pages in dark mode, Lighthouse. `dist.bak` holds the previous site (rollback: `.\deploy.bat -Rollback`); delete it once satisfied.
- **Tick marks (2026-11-05, later):** owner found the violet ticks (trust strip) ugly on black. Replaced all ticks with solid lime or ink discs (docs/03). Checked the homepage trust strip and plan cards, and the Pricing page, in light mode; dark mode checked by computed colours. Committed, not deployed.
- **Testimonial hierarchy (2026-11-05, later):** owner said the heading "In their own words" looked the same as the quote. Heading reduced to a label with a hairline divider; quote unchanged. Committed, not deployed.

### Deploy 2026-11-05 (fourth)
- **Shipped:** the unified tick-mark discs (lime on black, ink on white) and the smaller testimonial heading with hairline, on top of the third deploy. Commit 9160f60. No migrations, no new dependencies, nginx redirects unchanged. All 16 live checks passed on the first run; the live homepage and stylesheet contain the new heading and tick rules. `dist.bak` now holds the third deploy.
- **Bug found and fixed (2026-11-05, later):** `initStudioFx` ran before `motion.js` set `html.motion`, so the logo marquee never cloned its set (blank run on the right, the owner's report) and the scroll-lit quote silently fell back to all-lit. The quote reveal, marquee and weight field now initialise after motion starts (setTimeout 0). The quote therefore now really lights up word by word as it crosses 68% of the viewport, as documented. Also this round: audit-band icon and other icon chips (no violet), footer brand spacing, edge-to-edge footer dividers, even logo marquee with black/white hover. Committed, not deployed.

### Deploy 2026-11-05 (fifth)
- **Shipped:** commit 4d18a1f: icon chips lime or ink, footer brand spacing and edge-to-edge dividers, even full-width logo marquee with black/white hover, and the init-order fix (marquee copies and the scroll-lit quote now actually run). No migrations, no new dependencies, nginx redirects unchanged. All 16 live checks passed first time; the live JS and CSS contain the new rules. `dist.bak` now holds the fourth deploy.

# Lead-response automation (n8n) and demo previews

**Status:** PLAN ONLY (agreed 2026-11-02). Nothing below is built except the preview host (see "Preview host"). Build it in its own fresh session.

## Why

Today a form submission is saved to MySQL and two emails are queued: one to the owner, one to the visitor ("We reply to every enquiry within 1 business day"). That is too slow for hot leads, nothing alerts the owner, the email retry cron does not exist yet, and there is no lead tracking. The marketing promise is "See your new website before you pay for it", so every qualified lead should lead quickly to a private demo.

## Decisions

- **Unified lead form fields.** The Free Preview form and every industry hero form carry the same fields.
  - Required: full name, email, **phone (now required on Free Preview)**, business name, one "Website or Google Business Profile URL".
  - Optional: main service, message.
  - Today the hero form asks name, email, phone and a required message, and Free Preview has phone optional. Both must change. Shared form macros, `form-utils.js` validation and the consent text (rule 16) apply; no custom field markup.
  - Both forms post to one endpoint, tagged with the trade (topic, e.g. "Garage Door Services") and the source page and UTM data, into one table, so one n8n workflow handles every lead. Needs an API change and a migration (see "Build order").
- **Instant owner alert via Telegram** (tap-to-call phone). WhatsApp is a possible later channel (n8n already has a WhatsApp credential, but business-initiated messages need approved templates).
- **Master prompt written by OpenAI** (credential already in n8n).
- **Research via Apify** (credential already in n8n): the prospect's website and Google Business Profile. Only verified facts go into the prompt.
- **Curated design kit** (palettes and font pairs) in the repo; OpenAI picks from it, it does not invent.
- **Demos are static HTML/CSS/vanilla JS** on a separate static host. No Node, no React, no framework, no build step.
- **Dropped:** an AI voice call-back bot (Retell). AI-voiced calls need specific consent (TCPA in the US, stricter in the EU and Germany, Canada and Australia rules), and the owner decided against it on 2026-11-02. Do not add it to the plan.

## Flow

1. Visitor submits a lead form. The PHP API validates it, saves the row, queues the visitor confirmation email and replies to the browser.
2. After the reply is sent, the API POSTs a signed JSON payload to the n8n webhook. If the post fails, it goes into a retry queue (same pattern as `email_outbox`), so no lead is lost.
3. n8n verifies the signature.
4. **Telegram message 1 (immediately):** name, tap-to-call phone, business, URL, topic/trade, source page, campaign.
5. n8n researches the prospect with Apify (website and Google Business Profile): services, phone, hours, service area, logo, brand colours.
6. n8n picks a design kit for the trade and a palette and font pair from it (adapted to the prospect's colours only if contrast still passes WCAG AA).
7. OpenAI writes the master prompt.
8. **Telegram message 2:** a short summary plus the prompt as a `.md` file (Telegram caps messages at 4096 characters), optionally saved to Google Drive, with Call / Build / Skip buttons.
9. The owner copies the prompt, creates a new folder, and has Claude build a 2 to 3 page demo.
10. The owner uploads the demo to the preview host and sends the prospect the private link.

Possible later automation: "Build" in Telegram starts Claude on a server and deploys the demo, with the owner approving every demo before the prospect sees it. Only after the manual flow has proven itself.

## n8n

- Instance: `https://n8n.apps.synergyfirstdigital.com` (self-hosted, HTTPS).
- Existing credentials (seen 2026-11-02): Google Drive, IMGBB, Apify, OpenAI, WhatsApp.
- **Missing:** a Telegram bot credential and the owner's chat ID. Owner creates the bot with @BotFather.
- All secrets live only in n8n credentials and `.env` (rule 11); never in browser code or public JSON.

## Webhook contract (to build)

- `.env` / `.env-local` gain `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` (names are a proposal). Add them to `deploy.md` and `scripts/deploy.ps1` when built.
- The request carries a timestamp and an HMAC signature of the body; n8n rejects bad or old signatures.
- The payload holds the lead row (reference, fields above, trade, source page, UTM values) and no secrets.

## Design kit

- Lives in the repo (no secrets). Kits for **Garage Door**, **Tree Services** and one general **local service** kit.
- Each kit: 3 palettes and 3 font pairs, all contrast-checked for WCAG AA before they go in.
- The prompt says which palette and pair to use and why in one line.
- Per-trade starter sites ("niche starter repositories", docs/10 "Later decisions") come after 5 to 10 demos, once repeating layouts are known.

## Master prompt rules

- Build a 2 to 3 page demo as **plain HTML, CSS and vanilla JavaScript only**. No framework, no build step.
- Never invent reviews, licences, insurance, statistics, prices, awards, years in business or "same-day" or "24/7" claims. Mark unverified facts as placeholders.
- Use the supplied design kit choice, the prospect's real services, area and contact details only.
- Label the demo as a preview; forms must not submit anywhere real.
- Start from a clean folder so no customer data leaks between demos (docs/06 reuse policy).
- Output includes `noindex, nofollow` meta tags.

## Preview host

Built and verified 2026-11-02.

- **Host:** `preview.synergyfirstdigital.com`, a CloudPanel **Static HTML Site** (separate site and root from the main site, the API and `.env`). DNS is set and Let's Encrypt SSL is installed.
- **Why static:** demos are plain files served by nginx. No PHP and no Node are needed.
- **Vhost changes** (CloudPanel vhost editor):
  - `add_header X-Robots-Tag "noindex, nofollow" always;` at server level **and** inside the static-asset `location` block (that block has its own `add_header` lines, so server-level headers are not inherited there).
  - Asset cache `expires max` changed to `expires 1h`, so edited demos are not stuck behind years-long browser caching.
  - `Access-Control-Allow-Origin "*"` left as CloudPanel's default (not needed; may be removed).
- **Verified:** HTTPS 200, HTTP 301 to HTTPS, real 404s for unknown paths, and the `X-Robots-Tag: noindex, nofollow` header on both pages and asset requests. The `expires 1h` header is not yet observed (needs a real asset).
- **URL scheme (recommended, confirm at build):** `https://preview.synergyfirstdigital.com/<random-token>/`, not the business name. Previews are private; a guessable `/joes-garage-doors/` lets anyone view another prospect's demo.
- **Expiry:** a cron job deletes demo folders older than 7 days (docs/06 says previews expire after seven days). No PHP gate.
- **Optional:** add a `robots.txt` with `Disallow: /` as a second layer; the header is the one that matters.
- **Not built:** preview mode in this repo (`scripts/build.js` refuses `--mode=preview`). Demos are built outside this codebase from the master prompt.

## Legal and privacy

- Lead details will pass through Telegram, Apify and OpenAI as well as n8n. The Privacy Policy must name OpenAI, Telegram and Apify as processors (n8n is already named). Add this to the pending lawyer review (docs/10 "BLOCKING before legal launch").
- Check that each form's consent wording covers a manual follow-up call and the creation of a demo from the lead's public information.
- No automated or AI-voiced calls are planned.

## Build order (next sessions, one task each)

1. Forms: add business name and website/GBP fields to the industry hero form, make phone required on Free Preview, make message optional on the hero form; use the shared form macros and `form-utils.js`. Update the API validation, a migration for any new columns, and the docs.
2. Webhook sender with signature and retry queue in the PHP API; env variables; deploy docs.
3. n8n workflow (Telegram alert, Apify research, design-kit pick, OpenAI prompt, Telegram file and buttons) and the design kits.
4. Demo expiry cron, token URLs, and a dry run with a real lead.
5. Also pending: the email-outbox retry cron (docs/10), Privacy Policy provider names, then Tree Services page.

## Owner to do

- Create the Telegram bot (@BotFather) and add the credential and chat ID to n8n.
- Confirm the token URL scheme at build time.

## Open

- Whether to add a `robots.txt` to the preview host.
- Whether the alert channel should later switch to WhatsApp.
- Where the hero form's former required message goes once it is optional (message stays optional).

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
- **Telegram (done 2026-11-02):** bot `@SFDLeadsBot` created with @BotFather; the token was revoked and regenerated after it was pasted into a chat, then stored only as the n8n credential `SFD Leads Bot` (connection tested). The owner's chat ID was found with a Telegram Trigger and a test message sent successfully with the Send a text message action ("Append n8n Attribution" switched off). The chat ID and token are kept in n8n only, not in this repo. A throwaway workflow `Telegram chat ID test` can be deleted.
- All secrets live only in n8n credentials and `.env` (rule 11); never in browser code or public JSON.

## Webhook contract (built 2026-11-02)

- **Env:** `N8N_WEBHOOK_URL` (the n8n Webhook node's **production** URL, `https://n8n.apps.synergyfirstdigital.com/webhook/sfd-lead-intake`) and `N8N_WEBHOOK_SECRET`, plus `WEBHOOK_LOCAL=0` (see `.env.example`). Production `.env` must be uploaded once (`.\deploy.bat -UploadEnv`).
- **Authentication (changed from the first plan):** a shared secret in the `X-SFD-Webhook-Secret` header, checked by the n8n Webhook node's **Header Auth** credential (header name `X-SFD-Webhook-Secret`, value = the secret). An HMAC of the body was dropped for now: n8n cannot verify an HMAC without a code step and the raw body, while Header Auth is built in, keeps the secret in n8n credentials and is safe over https. The URL is refused unless it is https (except locally). n8n stores received headers in execution data (visible to n8n users only). Upgrade to an HMAC check later if more people get n8n access.
- **Request:** `POST` JSON, headers `X-SFD-Webhook-Secret`, `X-SFD-Event: lead.created`, `X-SFD-Delivery: <outbox id>` (use it to ignore duplicates) and `X-SFD-Timestamp`.
- **Body fields:** `event`, `kind` (`free_preview`), `reference`, `fullName`, `email`, `phone` ("+1 5551234567"), `countryCode`, `mobileNumber`, `businessName`, `website`, `services`, `message`, `trade`, `sourcePage`, `utm{...}`, `isTest`, `createdAt`. No secrets. In n8n the body is under `$json.body`.
- **Delivery:** `webhook_outbox` (migration 015) is written first; the post happens after the visitor's response; failures retry with backoff up to 8 attempts via `api/bin/send-webhooks.php` (cron every 5 minutes); sent rows are purged after 30 days. n8n being down never fails or slows a form.
- **Which forms:** Free Preview and every industry hero lead form (`/api/preview-applications`). Contact enquiries, bookings, playbook and audit requests are not wired yet.

## Design kit (built 2026-11-02)

- Lives in the repo in `demo-kit/` (no secrets); see `demo-kit/README.md`. Kits for **Garage Door**, **Tree Services** and one general **local service** fallback (`demo-kit/kits/*.json`).
- Each kit: audience and tone, 3 palettes (11 colour tokens each), 3 Google font pairs, the 2 to 3 demo pages and their sections, button labels, a trust-cue rule and image guidance.
- **Every palette passes WCAG AA** for the pairings the prompt promises (text and muted text on background and surface, primary on background, text on primary, accent and dark bands); `tests/demo-kit.test.js` fails otherwise. Three first-draft palettes failed and were corrected.
- The AI only picks one palette id and one font pair id from the kit, with a one-line reason; invalid answers fall back to the first option. Fonts load from Google Fonts only.
- Per-trade starter sites ("niche starter repositories", docs/10 "Later decisions") come after 5 to 10 demos, once repeating layouts are known.

## Master prompt rules

The rules live in `demo-kit/master-prompt.template.md`, so they are present in every prompt whatever the AI says:

- Build a 2 to 3 page demo (`index.html`, `services.html`, `contact.html` plus `assets/styles.css` and `assets/main.js`) as **plain HTML, CSS and vanilla JavaScript only**. No framework, no build step, no jQuery.
- Never invent reviews, ratings, licences, insurance, years in business, statistics, prices, response times, guarantees, "24/7" or "same-day" claims, addresses, phone numbers or emails. Anything unknown becomes a visible `[TO CONFIRM: ...]` placeholder, listed in the demo's `README.md`.
- Use only the facts in the prompt: the form's business name, website or profile link and services, plus facts read from the prospect's own website. The lead's own phone and email are not put in the prompt.
- Follow docs/06: `noindex, nofollow` meta tags, a sticky "Private Website Preview" bar with a countdown to a fixed UTC expiry (7 days) and a "Keep This Website" button (to `/book-a-call/`), the concept disclaimer in every footer, forms that do not submit anywhere, no tracking or third-party requests except Google Fonts.
- Accessibility and responsive checks (WCAG 2.2 AA, 390 / 768 / 1280px), and a final checklist.
- Visitor-typed and scraped text is labelled untrusted data inside `<lead-data>`; `<`, `>` and `{{` are neutralised.

## n8n build guide: demo-prompt branch (after the alert)

Add these nodes after the existing `Webhook` node, in parallel with the Telegram alert (so the alert is never delayed):

1. **HTTP Request** named `Fetch website`: Method GET, URL `{{ $('Webhook').first().json.body.website }}` (expression), Options: Response Format `Text`, Timeout 15000, **On Error: Continue (regular output)** in the node settings. If the lead gave a Google Business Profile link it returns junk or fails; the script handles both.
2. **Code** named `Prepare AI request`: Mode **Run Once for All Items**, Language JavaScript, paste `demo-kit/n8n/1-prepare-ai-request.js`. The node name must be exactly `Prepare AI request` and the trigger node must be named `Webhook` (the scripts refer to both). Change `OPENAI_MODEL` at the top of the script's last section if you prefer another model.
3. **HTTP Request** named `OpenAI`: Method POST, URL `https://api.openai.com/v1/chat/completions`, Authentication **Predefined Credential Type** then **OpenAI API** and the existing `OpenAi account` credential, Send Body ON, Body Content Type JSON, **Specify Body: Using JSON**, JSON `{{ JSON.stringify($json.openaiBody) }}` (expression). Timeout 60000.
4. **Code** named `Build master prompt`: Run Once for All Items, paste `demo-kit/n8n/2-build-prompt.js`. It outputs `summary` text plus a binary file in the property `data`.
5. **Telegram** node, operation **Send Document**: credential `SFD Leads Bot`, Chat ID the owner's, Binary File ON, Input Binary Field `data`, Additional Fields: Caption `{{ $json.summary }}`, Append n8n Attribution OFF.
6. Test with the PowerShell sample lead (use a real public business site as `website`); the owner should receive a `.md` file named `demo-prompt-<token>.md`. Then open it, check it reads well, and give it to Claude in a new empty folder named after the token.
7. After editing any kit, template or library file: `npm run build:demo-kit`, then paste the changed script into its Code node again.

If a node shows an error, the usual causes are: node names not exactly `Webhook` / `Prepare AI request`; the HTTP Request response format not set to Text (script 1 reads `data`); an invalid OpenAI model name; or the OpenAI credential not selected.

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

1. **DONE 2026-11-02.** Forms: add business name and website/GBP fields to the industry hero form, make phone required on Free Preview, make message optional on the hero form; use the shared form macros and `form-utils.js`. Update the API validation, a migration for any new columns, and the docs.
2. **DONE 2026-11-02 (code and docs; not deployed).** Webhook sender with shared-secret header and retry queue in the PHP API (`api/src/Webhook.php`, `api/bin/send-webhooks.php`, migration 015); env variables; deploy docs. Tested locally against a throwaway MySQL and a fake receiver: delivery with the right headers and body, n8n down (500) still gives the visitor a 201, retry succeeds, "not configured" keeps rows queued, http refused outside local, local skip, give-up after 8 attempts, 30-day purge. **Still to do to go live:** n8n Webhook node set to Header Auth, `N8N_` lines in the production `.env`, deploy with `-Migrate -UploadEnv`, the `send-webhooks.php` cron, one real test lead.
3. **Repo side DONE 2026-11-02; n8n side to build by the owner.** Design kits, master-prompt template, generated n8n Code-node scripts and tests (`demo-kit/`, `npm run build:demo-kit`). Step-by-step n8n build guide below. Phase 2 (later): Apify Google Maps lookup for leads who only gave a Google Business Profile link, and Telegram Call / Build / Skip buttons (these need a second workflow to handle the button presses, and Telegram buttons cannot open `tel:` links, so the alert keeps the tappable number).
4. Demo expiry cron, token URLs, and a dry run with a real lead.
Step 1 notes: the Garage Door hero form now uses `form.mode: "lead"` (hero-form.njk) and the same script as Free Preview; both post to `/api/preview-applications`; phone is required in the browser and the API; migration `014_preview_applications_trade.sql` adds `trade` and **must be applied on deploy** (`.\deploy.bat -Migrate`). The industry hero form's old required message is now an optional "Anything we should know?". Tested in a browser with a mocked API (empty-phone error, payload including `trade`, toast, reset); not tested against the live API.

5. Also pending: the email-outbox retry cron (docs/10), Privacy Policy provider names, then Tree Services page.

## Owner to do

- Confirm the token URL scheme at build time.
- Delete the `Telegram chat ID test` workflow in n8n when no longer needed.
- In n8n: create a **Header Auth** credential (name `SFD Lead Webhook`, header `X-SFD-Webhook-Secret`, value = the secret from `.env`), set the Webhook node's Authentication to Header Auth with it, keep the workflow Active.
- Add the CloudPanel cron for `send-webhooks.php` (deploy.md Appendix B).

## Open

- Whether to add a `robots.txt` to the preview host.
- Whether the alert channel should later switch to WhatsApp.
- Where the hero form's former required message goes once it is optional (message stays optional).

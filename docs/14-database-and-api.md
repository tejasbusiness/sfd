# Database, migrations and API

Decided 2026-09-20 (supersedes the n8n plan in `docs/07` and `docs/12`, which stay useful for the field and slot contract).

## Architecture

- Static pages are unchanged (plain HTML from the build). Dynamic behaviour is a small dependency-light **PHP 8 API under `/api/`**, running on the CloudPanel **PHP site** for `synergyfirstdigital.com` (Contabo VPS). Production still needs no Node.js.
- Data lives in **MySQL**. Schema changes are **forward-only SQL files in `migrations/`**, applied by `api/bin/migrate.php`.
- Secrets live only in `.env` (production, on the server above the web root) and `.env-local` (developer machine). Both are gitignored; `.env.example` lists the names. Nothing secret appears in `data/`, `assets/` or `dist/` (CLAUDE.md rule 11).
- **Local development uses the live database** through an SSH tunnel (`npm run tunnel` opens `127.0.0.1:3307` to the VPS's MySQL on `127.0.0.1:3306`). MySQL is never exposed to the internet. Rows created locally are flagged `is_test = 1`.

## Environment files

| File | Where | `DB_HOST` / `DB_PORT` |
|---|---|---|
| `.env` | production server | `127.0.0.1` / `3306` |
| `.env-local` | your machine | `127.0.0.1` / `3307` (tunnel) |

Fill in the values yourself; they are never committed or generated. Names are listed in `.env.example`.

## Migrations

```text
npm run tunnel            open the SSH tunnel (own terminal, leave running)
npm run migrate:status    list applied / pending
npm run migrate           apply pending (uses .env-local)
php api/bin/migrate.php --env=production    on the server
```

Rules: numbered files (`NNN_description.sql`), never edit an applied file (its checksum is stored; the runner refuses), add a new file for every change, one purpose per file. MySQL DDL cannot be rolled back, so a failed file stops the run, is not recorded, and can be fixed and re-run.

| File | Creates |
|---|---|
| 001 | `consents` (cookie and form consent proof) |
| 002 | `contact_enquiries` |
| 003 | `preview_applications` |
| 004 | `playbook_subscribers` |
| 005 | `booking_settings`, `availability_rules`, `availability_exceptions` |
| 006 | `bookings` (unique `slot_start_utc + slot_lock` blocks double booking in the database) |
| 007 | `rate_limits` |
| 008 | `email_outbox` |
| 009 | Placeholder booking defaults |
| 010 | Owner-decided hours (two windows, Monday to Friday) |

`schema_migrations` is created by the runner itself.

## Booking rules

Decided by the owner on 2026-09-20 (migration 010): **30-minute discovery calls, Monday to Friday, 10:00 to 13:00 and 17:00 to 19:00 in the visitor's local time.** Each visitor therefore sees those windows on their own clock (the last start is 12:30 and 18:30), and the API computes slots per visitor timezone. A slot taken by a visitor in one timezone disappears for everyone, because bookings are compared in UTC.

Still placeholders (`needs_confirmation = 1` in `booking_settings`, change with an UPDATE or a new migration): 15-minute buffer between calls (with 30-minute slots this hides the slot right after a booked one, so calls end up 1 hour apart; set `buffer_minutes` to 0 for back-to-back calls), 12 hours' minimum notice, 30-day booking window, 6 calls per day (counted per day in `sfd_timezone`, `Asia/Kolkata`), slots every 30 minutes. Holidays go in `availability_exceptions` (dates are read in the visitor's timezone).

## API (`api/`)

Plain PHP 8.2+ with PDO (MySQL) and PHPMailer (Composer). Front controller `api/public/index.php` (the build copies it to `dist/api/index.php`); code in `api/src/`. JSON only, same-origin only (`ALLOWED_ORIGINS`), body limit 64 KB, no internals in errors.

| Endpoint | Purpose |
|---|---|
| `GET /api/availability?timezone=` | Open slots grouped by date in the visitor's timezone (MySQL rules, existing bookings, Google free/busy when enabled) |
| `POST /api/bookings` | Book a call. `Idempotency-Key` header (UUID). 201 created, 200 same key replayed, 409 `slot_unavailable`, 422 field errors |
| `POST /api/contact` | Contact form and the Websites landing hero form (`topic` is sent as a hidden field; `source` is optional) |
| `POST /api/preview-applications` | Free Preview application |
| `POST /api/playbook` | Playbook sign-up (stored, owner notified; the playbook itself is still sent by hand) |
| `POST /api/consent` | Records the cookie-banner choice |

Behaviour: server-side validation mirrors `assets/js/form-utils.js`; the consent checkbox is required and a `consents` row is stored; honeypot field `hp` (a filled value gets a fake success and nothing is stored); per-IP rate limits (salted IP hash in `rate_limits`; 429 when exceeded); every email goes to `email_outbox` first, then SMTP. Bookings: the requested start is rechecked against current availability, and the unique key on `bookings` is the final guard against double booking. With `GOOGLE_ENABLED=1` the API also creates the Calendar event with a Google Meet link (Google emails the invite); if that fails, or Google is off, the booking stays `pending_calendar` and the owner email says to add it manually. Google free/busy failures fail open (MySQL is still checked).

Local runs (`APP_ENV=local`): rows are flagged `is_test = 1`, and email is not sent unless `MAIL_LOCAL=1` (rows are marked failed/skipped so the production retry never sends them). `npm run serve` starts PHP's built-in server for the API (with `.env-local`) and proxies `/api/*` to it, so the SSH tunnel must be open.

Frontend: `submitJson()`, `trackingFields()` (current URL's utm values only, nothing stored on the device) and `reportSubmitFailure()` in `assets/js/form-utils.js`; the four form scripts and `booking.js` call the API. Each form has the shared honeypot macro (`form-fields.njk`).

## Deploying to the server (CloudPanel PHP site, root directory `dist`)

Site folder: `/home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com/`

1. `npm run build:production`, then upload `dist/` to `<site>/dist/`.
2. Upload `api/` (without `vendor/`) to `<site>/api/`, `migrations/` to `<site>/migrations/`, and the production `.env` to `<site>/.env`. These sit above the web root and are not public.
3. On the server: `cd <site>/api && composer install --no-dev`, then `php api/bin/migrate.php --env=production` from `<site>`.
4. Paste `deploy/nginx-redirects.conf` into the CloudPanel vhost (it routes `/api/`, blocks dotfiles, sets the 404 page).
5. Optional: a cron job running `php <site>/api/bin/send-outbox.php` to retry failed emails (not written yet).
6. Verify: `curl -I https://synergyfirstdigital.com/.env` is not 200, `/api/availability` returns JSON, and a test submission arrives.

### Deploy commands (Git Bash on Windows, key login as `sfd-deploy`)

```bash
cd "<project folder>" && npm run build:production      # cleans dist/ first
KEY=C:/Users/victus/.ssh/sfd; SRV=sfd-deploy@5.189.168.218
SITE=/home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com

# 1. access check (write permission, composer, rsync, PHP)
ssh -i $KEY $SRV "ls -ld $SITE; touch $SITE/.w && echo WRITE_OK && rm $SITE/.w; which composer rsync; php -v | head -1"

# 2. upload to a staging folder (no vendor, no node_modules)
ssh -i $KEY $SRV "mkdir -p $SITE/_release"
tar -czf - dist api/src api/bin api/public api/composer.json api/composer.lock migrations | ssh -i $KEY $SRV "tar -xzf - -C $SITE/_release"
scp -i $KEY .env $SRV:$SITE/_release/.env

# 3. swap in (keeps a backup of the old dist), install dependencies
ssh -i $KEY $SRV "cd $SITE && mkdir -p dist api migrations && cp -a dist dist.bak && rsync -a --delete _release/dist/ dist/ && rsync -a --delete --exclude vendor _release/api/ api/ && rsync -a --delete _release/migrations/ migrations/ && cp _release/.env .env && chmod 640 .env && rm -rf _release && cd api && composer install --no-dev --optimize-autoloader"
```

**First set the site's Root Directory to `dist` in CloudPanel** (it defaults to the site folder, which holds `.env`, `api/` and `migrations/`). Until then keep `.env` out of the site folder (`mv $SITE/.env $SITE/../env.hold`, then move it back). Until the vhost is pasted, the CloudPanel placeholder `index.php` answers every path with `Hello World :-)` and status 200, so a 200 on `/.env` does not prove a leak: check the response body (`curl.exe -s <url>`), not just the status.

Then paste `deploy/nginx-redirects.conf` into the CloudPanel vhost (replace any existing `location /` or `error_page`), confirm the site's root directory is `dist`, and verify: `curl -I https://synergyfirstdigital.com/` (200), `/.env` (not 200), `/no-such-page/` (404), `/services/website-design-development/` (301), `/api/availability?timezone=UTC` (JSON). If the API returns 500 the PHP user probably cannot read `.env` (owned by `sfd-deploy`): fix the owner/group in CloudPanel or with sudo. Optional cron for `api/bin/send-outbox.php` in CloudPanel, as the site user.

## Status

- All ten migrations applied to the live database `sfd-2026-db` (2026-09-20) through the SSH tunnel (user `sfd-deploy`, key login; the firewall has no rule for 3306).
- All endpoints were tested against the live database from a local PHP server with curl: valid and invalid submissions, honeypot, wrong content type, bad origin, idempotent replay, and a second booking of the same slot (409). Test rows were deleted afterwards.
- **Deployed 2026-09-21** to `synergyfirstdigital.com` (CloudPanel PHP site, Root Directory `synergyfirstdigital.com/dist`, files uploaded over SSH as `sfd-deploy`, `composer install --no-dev` run on the server). Verified live: homepage 200, `/.env` 403, `/api/composer.json` 404, unknown URL 404, old Websites URL 301, `/api/availability` returns JSON from the live database. The vhost is the CloudPanel default with the SFD rules from `deploy/nginx-redirects.conf` added to the port 8080 server block (the block that serves files) and `expires max` changed to `expires 1d` for static files; do not add a second `location /` to the port 443 block. Varnish should be off for this site.
- Still to verify on the live site: form submissions and real emails (SMTP is configured), the booking modal, Google Calendar/Meet (`GOOGLE_ENABLED=0`, so bookings stay `pending_calendar` and the owner adds them by hand), the outbox retry cron, and cleanup of `dist.bak` and the placeholder `index.php` in the site folder.

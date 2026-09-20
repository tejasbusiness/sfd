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
| `POST /api/contact` | Contact form |
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

## Status

- All ten migrations applied to the live database `sfd-2026-db` (2026-09-20) through the SSH tunnel (user `sfd-deploy`, key login; the firewall has no rule for 3306).
- All endpoints were tested against the live database from a local PHP server with curl: valid and invalid submissions, honeypot, wrong content type, bad origin, idempotent replay, and a second booking of the same slot (409). Test rows were deleted afterwards.
- Not yet verified: emails (need `SMTP_PASSWORD` and `MAIL_LOCAL=1`), Google Calendar/Meet (need OAuth credentials), the browser UI of the booking modal and forms, and a production deploy.

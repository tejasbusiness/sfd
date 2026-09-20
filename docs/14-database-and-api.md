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

`schema_migrations` is created by the runner itself.

## Placeholder booking defaults to confirm

Migration 009 seeds values the owner has **not** decided: timezone `Asia/Kolkata`, call length 30 minutes, 15-minute buffer, 12 hours' notice, 30-day window, 6 calls per day, Monday to Friday 10:00 to 18:00, slots every 30 minutes. All rows have `needs_confirmation = 1`. Note the site copy is inconsistent about call length ("30-Minute" in CTAs, "15-minute" on the book-a-call page and in docs/12); confirm one.

## Status

Migrations and the runner exist. The runner has been syntax-checked and the statement splitter tested, but not yet run against MySQL because `.env-local` has no credentials yet. The API endpoints and form wiring are the next step.

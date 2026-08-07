# SynergyFirst Digital

Marketing website + client-management platform for a web design agency serving
healthcare/wellness practitioners. Full spec lives in `docs/` (gitignored, local-only).

## Stack

React + Vite + TypeScript, React Router, Tailwind CSS v4, Framer Motion, Supabase
(Postgres + Auth + RLS + Storage + Realtime).

## Local setup

### Prerequisites

- Node.js 20+
- Docker Desktop (running) — required by the Supabase CLI to run Postgres/Auth/Realtime/Storage locally
- No separate Postgres install needed; the Supabase CLI manages its own containers

### 1. Install dependencies

```bash
npm install
```

### 2. Start local Supabase

```bash
npx supabase start
```

First run pulls several Docker images and can take a few minutes. When it finishes, it
prints your local API URL, anon key, and service-role key. Keep this output handy — you'll
need the anon key for `.env.local`.

To check status later (e.g. after a reboot) without re-pulling images:

```bash
npx supabase status
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the `supabase start` output
(defaults in `.env.example` already match the standard local ports). Leave payment/AI/SMTP
keys blank until those phases are built — the app should still boot without them.

### 4. Apply migrations + seed data

Migrations in `supabase/migrations/` apply automatically when you run `supabase start` for
the first time, and on `supabase db reset`. To reset the local DB to a clean state (reapplies
all migrations + `supabase/seed.sql`):

```bash
npx supabase db reset
```

Seed data includes real starter content (services, pricing tiers) plus a handful of
`is_test = true`-flagged leads/bookings/tickets for exercising the CRM/booking/ticketing UI
without representing real prospects.

### 5. Run edge functions (booking, checkout, webhooks, currency detection)

```bash
cp supabase/functions/.env.example supabase/functions/.env
npx supabase functions serve --env-file supabase/functions/.env
```

This is a **separate env file from `.env.local`** — Vite's `.env.local` only reaches the
browser bundle, but edge functions run server-side in a Deno sandbox and need their own
secrets (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are injected automatically; gateway/
geolocation keys are not). Required for booking, checkout, and currency-detection features to
work locally — the rest of the site works without it.

### 6. Run the app

```bash
npm run dev
```

## Migrations

Each file in `supabase/migrations/` is self-contained SQL (table + indexes + RLS policies
together) and can also be pasted directly into a Supabase Studio SQL Editor if you ever need
to apply them manually against a remote instance. They're numbered and dependency-ordered —
see the header comment in each file for what it depends on and how to roll it back.

## Deploying to production

This project is designed to eventually point at a self-hosted Supabase instance (planned:
Coolify-hosted VPS) instead of the local Docker stack — same migration files, different
`.env` values. Local Docker Supabase is for development only and is not meant to run
permanently.

## Environment variables

See `.env.example` for the full list (Supabase, SMTP, Razorpay, Stripe, AI provider keys,
geolocation). All secrets are environment-variable-driven — nothing is hardcoded or committed.

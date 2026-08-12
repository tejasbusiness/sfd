-- ============================================================================
-- 0024_website_prompt_generator.sql
-- Purpose: Server-side quota tracking for the public Website Prompt
--          Generator (/website-prompt-generator). No login is required to use
--          the feature, so there is no user_id to key off of — identity is a
--          client-generated UUID (localStorage, header X-Device-Id) plus
--          request IP, tracked jointly: a request is quota-blocked if EITHER
--          signal's count for the current calendar month is >= 15. Only the
--          generate-website-prompt edge function (service role) ever reads or
--          writes this table for enforcement purposes — no anon/authenticated
--          grants for write at all, mirroring the `bookings` table precedent
--          (0005/0010: "All booking creation goes through the create-booking
--          edge function (service role)").
-- Depends on: 0001 (public.is_staff()), 0010 (grant pattern/gotcha)
-- Rollback: drop table public.website_prompt_generations;
-- ============================================================================

create table if not exists public.website_prompt_generations (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  ip_address text not null,
  period_key text not null, -- 'YYYY-MM' in UTC, e.g. '2026-08'
  provider text not null,   -- which AI provider actually served this generation
  created_at timestamptz not null default now()
);

-- Every row = one successful generation (inserted only after the AI call
-- succeeds — see the edge function). Quota is therefore just
-- `count(*) where device_id = $1 and period_key = $2` (or the ip_address
-- equivalent) — no separate counter column to keep in sync.

create index if not exists website_prompt_generations_device_period_idx
  on public.website_prompt_generations (device_id, period_key);

create index if not exists website_prompt_generations_ip_period_idx
  on public.website_prompt_generations (ip_address, period_key);

comment on table public.website_prompt_generations is
  'One row per successful Website Prompt Generator run, used to enforce the 15/identity/calendar-month quota. Written only by the generate-website-prompt edge function via service role. device_id is a client-generated localStorage UUID; ip_address is the request IP -- either hitting 15 for the current period_key blocks further generations.';

alter table public.website_prompt_generations enable row level security;

-- Staff can view usage in the admin dashboard for support/abuse triage (no
-- dedicated UI is being built for this now, but the policy costs nothing to
-- add and avoids a future migration just to grant read access — same
-- is_staff() tier already used for CRM/tickets/bookings, see 0017).
drop policy if exists "website_prompt_generations_staff_read" on public.website_prompt_generations;
create policy "website_prompt_generations_staff_read"
  on public.website_prompt_generations for select
  using (public.is_staff());

-- Postgres requires an explicit GRANT independent of RLS (see 0010's
-- comment) — service_role bypasses RLS but still needs table grants for the
-- Data API roles, and this project consistently grants explicitly rather
-- than relying on bypass semantics.
grant select on public.website_prompt_generations to authenticated;
grant select, insert on public.website_prompt_generations to service_role;
-- Deliberately NO grant to anon -- the public page never talks to Postgres
-- directly for this feature, only through the edge function.

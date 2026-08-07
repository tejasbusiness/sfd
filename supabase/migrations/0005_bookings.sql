-- ============================================================================
-- 0005_bookings.sql
-- Purpose: Appointment booking engine — bookings, practitioner availability
--          rules, blackout dates. Reschedule/cancel is token-based (no login
--          required for the client), per docs/03. Token is single-use per
--          action and expires — see manage_token_expires_at below.
-- Depends on: 0001 (profiles/roles), 0002 (services), 0004 (leads)
-- Rollback: drop table public.bookings, public.blackout_dates,
--           public.availability_rules; drop type public.booking_status;
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum
      ('pending', 'confirmed', 'rescheduled', 'canceled', 'completed', 'no_show');
  end if;
end $$;

-- ---- availability_rules ----------------------------------------------------

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  practitioner_id uuid references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  buffer_minutes integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.availability_rules is 'Recurring weekly working-hours rules per service/practitioner. NULL practitioner_id = applies to whole team for that service.';

create index if not exists availability_rules_service_idx on public.availability_rules (service_id);

-- ---- blackout_dates ---------------------------------------------------------

create table if not exists public.blackout_dates (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

comment on table public.blackout_dates is 'Days a practitioner (or whole team, if practitioner_id is NULL) is unavailable regardless of availability_rules.';

-- ---- bookings ----------------------------------------------------------------

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.profiles(id) on delete set null,
  service_id uuid not null references public.services(id) on delete restrict,
  practitioner_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'pending',
  client_full_name text not null,
  client_email text not null,
  client_phone text,
  notes text,
  manage_token text not null default encode(gen_random_bytes(32), 'hex'),
  manage_token_expires_at timestamptz not null default (now() + interval '30 days'),
  manage_token_used_at timestamptz,
  project_status text not null default 'not_applicable',
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.bookings is 'Client appointments. manage_token is a single opaque value used for the reschedule/cancel email link; manage_token_used_at is set after a reschedule so the original token cannot re-cancel a since-moved booking (client re-requests a fresh link via the confirmation email''s reschedule action, which reissues the token). project_status anchors the future post-completion WhatsApp-upsell email trigger (not_applicable/in_progress/completed) — deliberately on bookings rather than a new engagements table, since a completed Web Design/SEO/AI booking IS the project for this business.';

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_client_id_idx on public.bookings (client_id);
create index if not exists bookings_manage_token_idx on public.bookings (manage_token);

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---- RLS ---------------------------------------------------------------------

alter table public.availability_rules enable row level security;
alter table public.blackout_dates enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "availability_rules_select_public" on public.availability_rules;
create policy "availability_rules_select_public"
  on public.availability_rules for select
  using (is_active = true or public.is_staff());

drop policy if exists "availability_rules_write_staff" on public.availability_rules;
create policy "availability_rules_write_staff"
  on public.availability_rules for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "blackout_dates_select_public" on public.blackout_dates;
create policy "blackout_dates_select_public"
  on public.blackout_dates for select
  using (true);

drop policy if exists "blackout_dates_write_staff" on public.blackout_dates;
create policy "blackout_dates_write_staff"
  on public.blackout_dates for all
  using (public.is_staff())
  with check (public.is_staff());

-- Booking creation deliberately has NO anon insert policy. The client-side
-- booking flow (docs/03) calls a create-booking edge function (service role,
-- bypasses RLS) instead of inserting into this table directly, for two
-- reasons: (1) slot-availability must be checked against availability_rules/
-- blackout_dates/existing bookings atomically server-side to prevent a race
-- where two clients book the same slot; a client-side RLS-gated insert can't
-- express that check. (2) the client needs manage_token back in the
-- confirmation response to build the reschedule/cancel link, and Postgres
-- RLS requires an INSERT ... RETURNING to also pass a SELECT policy — since
-- anon has no SELECT policy on bookings, a direct anon insert-with-return
-- would fail the same way it did on leads (verified locally). Routing
-- through an edge function sidesteps both problems at once.
drop policy if exists "bookings_insert_public" on public.bookings;

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  using (client_id = auth.uid());

-- Reschedule/cancel via token happens through a service-role edge function
-- (validates token + expiry server-side), not a direct anon RLS policy —
-- an anon UPDATE policy keyed only on manage_token would let anyone who
-- guesses/leaks a token bypass expiry/used-at checks client-side.
drop policy if exists "bookings_all_staff" on public.bookings;
create policy "bookings_all_staff"
  on public.bookings for all
  using (public.is_staff())
  with check (public.is_staff());

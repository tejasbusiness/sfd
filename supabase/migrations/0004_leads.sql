-- ============================================================================
-- 0004_leads.sql
-- Purpose: CRM lead records. Every form submission, booking, and chatbot
--          escalation creates/updates a row here, tagged with entry_service
--          per the business-sequencing rule (docs/01) so the WhatsApp-upsell
--          email trigger can be scoped correctly later.
-- Depends on: 0001 (profiles/roles), 0002 (services, for entry_service FK)
-- Rollback: drop table public.leads; drop type public.lead_status;
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum
      ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost');
  end if;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  entry_service_id uuid references public.services(id) on delete set null,
  form_type text,
  source text,
  status public.lead_status not null default 'new',
  message text,
  assigned_to uuid references public.profiles(id) on delete set null,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is 'CRM lead pipeline. entry_service_id records which of the four entry offers (never WhatsApp Business API cold) brought the client in — required for correct email-trigger sequencing. is_test flags dev/seed data since this table lives in the same DB as production.';

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_client_id_idx on public.leads (client_id);
create index if not exists leads_entry_service_idx on public.leads (entry_service_id);

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Public/anon can create leads (forms, chatbot escalation) but not read them
-- back. IMPORTANT: Postgres RLS requires an INSERT to also pass a SELECT
-- policy when the caller asks for the row back (INSERT ... RETURNING, or the
-- Supabase JS client's .select() after .insert()) — since anon has no SELECT
-- policy here, any public-facing insert call MUST omit .select() and rely on
-- the insert succeeding/throwing for its success signal, not on reading the
-- returned row. Verified locally: identical insert succeeds without
-- .select()/RETURNING and fails with it.
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
  on public.leads for insert
  with check (true);

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  using (client_id = auth.uid());

drop policy if exists "leads_all_staff" on public.leads;
create policy "leads_all_staff"
  on public.leads for all
  using (public.is_staff())
  with check (public.is_staff());

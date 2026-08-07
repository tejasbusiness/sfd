-- ============================================================================
-- 0007_subscriptions.sql
-- Purpose: Recurring subscription state, synced from Razorpay/Stripe webhooks.
--          Deliberately shares vocabulary (currency, status, gateway) with the
--          future invoices table (docs/12) so processPayment (Rule A) needs no
--          changes when Invoicing is built later.
-- Depends on: 0001 (profiles/roles), 0002 (pricing_tiers), 0004 (leads)
-- Rollback: drop table public.subscriptions;
--           drop type public.subscription_status, public.payment_gateway;
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum
      ('trialing', 'active', 'past_due', 'canceled', 'upgraded', 'downgraded');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_gateway') then
    create type public.payment_gateway as enum ('razorpay', 'stripe');
  end if;
end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  tier_id uuid not null references public.pricing_tiers(id) on delete restrict,
  gateway public.payment_gateway not null,
  gateway_customer_id text,
  gateway_subscription_id text not null,
  currency text not null check (currency in ('INR', 'USD')),
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_subscription_id)
);

comment on table public.subscriptions is 'Recurring billing state, kept in sync by razorpay-webhook/stripe-webhook edge functions. status vocabulary and currency/gateway shape intentionally mirror the future invoices table (docs/12) for shared processPayment reuse.';

create index if not exists subscriptions_client_id_idx on public.subscriptions (client_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (client_id = auth.uid());

drop policy if exists "subscriptions_all_staff" on public.subscriptions;
create policy "subscriptions_all_staff"
  on public.subscriptions for all
  using (public.is_staff())
  with check (public.is_staff());

-- Note: inserts/updates from checkout + webhooks go through the service-role
-- key (edge functions), which bypasses RLS by design — there is intentionally
-- no public/anon insert policy on this table.

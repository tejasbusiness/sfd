-- ============================================================================
-- 0002_content_tables.sql
-- Purpose: Data-driven content tables (Rule C targets) — services, pricing
--          tiers, portfolio items, testimonials. Public-readable, admin-writable.
--          Existing as standalone tables with no per-niche hardcoding lets a
--          new target niche be a content row, not a code change.
-- Depends on: 0001 (public.is_admin())
-- Rollback: drop table public.testimonials, public.portfolio_items,
--           public.pricing_tiers, public.services;
-- ============================================================================

-- ---- services ------------------------------------------------------------

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  long_description text,
  niche_tags text[] not null default '{}',
  hero_image_url text,
  icon text,
  is_bookable boolean not null default false,
  default_duration_minutes integer,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.services is 'Web Design / SEO / AI Solutions / 1-on-1 Help / WhatsApp Business API, rendered generically — niche framing comes from niche_tags + copy fields, not per-service components.';

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---- pricing_tiers ---------------------------------------------------------

create table if not exists public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_usd_cents integer not null,
  price_inr_paise integer not null,
  billing_period text not null default 'monthly',
  features jsonb not null default '[]',
  is_most_popular boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pricing_tiers is 'Starter/Professional/Business tiers. Stored in smallest currency unit (cents/paise) to avoid float rounding. Admin-editable, not hardcoded in UI.';

drop trigger if exists set_pricing_tiers_updated_at on public.pricing_tiers;
create trigger set_pricing_tiers_updated_at
  before update on public.pricing_tiers
  for each row execute function public.set_updated_at();

-- ---- portfolio_items -------------------------------------------------------

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  niche_tags text[] not null default '{}',
  summary text,
  outcome_metrics jsonb not null default '[]',
  cover_image_url text,
  gallery_image_urls text[] not null default '{}',
  live_url text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.portfolio_items is 'Case studies, filterable by niche_tags. Rendered via a generic CaseStudyCard template (Rule C).';

drop trigger if exists set_portfolio_items_updated_at on public.portfolio_items;
create trigger set_portfolio_items_updated_at
  before update on public.portfolio_items
  for each row execute function public.set_updated_at();

-- ---- testimonials -----------------------------------------------------------

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  practice_name text,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  photo_url text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ---- RLS: public read (published only), admin full access -----------------

alter table public.services enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.testimonials enable row level security;

drop policy if exists "services_select_published" on public.services;
create policy "services_select_published"
  on public.services for select
  using (is_published = true or public.is_staff());

drop policy if exists "services_write_admin" on public.services;
create policy "services_write_admin"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "pricing_tiers_select_published" on public.pricing_tiers;
create policy "pricing_tiers_select_published"
  on public.pricing_tiers for select
  using (is_published = true or public.is_staff());

drop policy if exists "pricing_tiers_write_admin" on public.pricing_tiers;
create policy "pricing_tiers_write_admin"
  on public.pricing_tiers for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "portfolio_items_select_published" on public.portfolio_items;
create policy "portfolio_items_select_published"
  on public.portfolio_items for select
  using (is_published = true or public.is_staff());

drop policy if exists "portfolio_items_write_admin" on public.portfolio_items;
create policy "portfolio_items_write_admin"
  on public.portfolio_items for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "testimonials_select_published" on public.testimonials;
create policy "testimonials_select_published"
  on public.testimonials for select
  using (is_published = true or public.is_staff());

drop policy if exists "testimonials_write_admin" on public.testimonials;
create policy "testimonials_write_admin"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

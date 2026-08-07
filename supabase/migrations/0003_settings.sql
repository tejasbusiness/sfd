-- ============================================================================
-- 0003_settings.sql
-- Purpose: Admin-only key/value settings store — company info, SMTP, SMS,
--          AI provider config, payment gateway key references, SEO defaults.
--          Secrets themselves stay in env vars server-side; this table holds
--          non-secret config + references to which provider/key-set is active,
--          per the spec's "admin settings select provider" requirement.
-- Depends on: 0001 (public.is_admin())
-- Rollback: drop table public.settings;
-- ============================================================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}',
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

comment on table public.settings is 'Single-row-per-key config: company, smtp, sms, ai_provider, payment_gateway_map, seo_defaults. Secrets live in env vars; this stores non-secret config + active-provider selection.';

drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;

drop policy if exists "settings_admin_only" on public.settings;
create policy "settings_admin_only"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed known setting keys with safe defaults so the admin UI has rows to edit
-- from day one instead of needing first-insert logic in application code.
insert into public.settings (key, value, description) values
  ('company', '{"name": "", "logo_url": "", "email": "", "phone": "", "business_hours": "", "timezone": "UTC"}', 'Company profile shown in admin + used in email templates')
  on conflict (key) do nothing;

insert into public.settings (key, value, description) values
  ('smtp', '{"host": "", "port": 587, "from_address": "", "from_name": ""}', 'SMTP connection config (credentials via env vars, not stored here)')
  on conflict (key) do nothing;

insert into public.settings (key, value, description) values
  ('ai_provider', '{"active": "gemini", "fallback": null, "tone_prompt": ""}', 'Active AI chatbot provider + fallback (Rule B dispatch target)')
  on conflict (key) do nothing;

insert into public.settings (key, value, description) values
  ('payment_gateway_map', '{"INR": "razorpay", "USD": "stripe"}', 'Currency-to-gateway routing used by processPayment (Rule A)')
  on conflict (key) do nothing;

insert into public.settings (key, value, description) values
  ('seo_defaults', '{"default_title": "", "default_description": "", "sitemap_enabled": true}', 'Fallback SEO meta when a page has no per-page override')
  on conflict (key) do nothing;

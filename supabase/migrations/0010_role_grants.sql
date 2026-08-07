-- ============================================================================
-- 0010_role_grants.sql
-- Purpose: Postgres requires an explicit GRANT before RLS policies on a table
--          take effect for a role — RLS only *restricts rows*, it does not by
--          itself authorize the anon/authenticated roles to touch a table at
--          all. Supabase's convention is to grant broad table-level access
--          here and let RLS policies (0001-0009) do the actual per-row
--          filtering. Discovered via a manual RLS verification query against
--          local Supabase: anon reads returned "permission denied" even
--          though a permissive SELECT policy existed, confirming the grants
--          were missing, not the policies.
-- Depends on: 0001-0009 (all tables must exist)
-- Rollback: revoke all corresponding grants (see Supabase docs on default
--           privileges) — not written out here since this migration is
--           additive-only and safe to leave in place.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select on public.services to anon, authenticated;
grant select on public.pricing_tiers to anon, authenticated;
grant select on public.portfolio_items to anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant select on public.availability_rules to anon, authenticated;
grant select on public.blackout_dates to anon, authenticated;

grant all on public.services, public.pricing_tiers, public.portfolio_items,
  public.testimonials, public.availability_rules, public.blackout_dates
  to authenticated;

-- leads/tickets: anon gets INSERT only, no SELECT — public form/chatbot
-- submissions must be made WITHOUT requesting the row back (no .select()
-- after .insert() in the JS client), since RLS would reject an INSERT ...
-- RETURNING for a role with no matching SELECT policy. See the comment on
-- leads_insert_public in 0004_leads.sql for how this was verified.
grant insert on public.leads to anon;
grant select, insert, update on public.leads to authenticated;

grant insert on public.tickets to anon;
grant select, insert, update on public.tickets to authenticated;

-- bookings: anon gets NO direct table grants. All booking creation goes
-- through the create-booking edge function (service role), which needs slot
-- availability checked atomically server-side anyway — see the comment above
-- bookings_select_own in 0005_bookings.sql for the full rationale.
grant select, insert, update on public.bookings to authenticated;

grant select, insert on public.messages to authenticated;

grant select on public.subscriptions to authenticated;

grant select, update on public.profiles to authenticated;

-- settings, email_templates, email_trigger_log: admin-only via RLS, but the
-- authenticated role still needs table-level access for RLS to evaluate
-- (anon has no legitimate reason to touch these, so no anon grant here).
grant select, insert, update, delete on public.settings to authenticated;
grant select, insert, update, delete on public.email_templates to authenticated;
grant select, insert on public.email_trigger_log to authenticated;

-- Ensure future tables created by later migrations in the public schema
-- default to no access until an explicit grant is added, consistent with
-- the "RLS from day one" rule in docs/11 — nothing implicit.
alter default privileges in schema public revoke all on tables from anon, authenticated;

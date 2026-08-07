-- ============================================================================
-- 0017_profiles_staff_select.sql
-- Purpose: Fix a real bug caught via real-instance verification while building
--          Support Ticketing (not just RLS review): profiles only had
--          "select own" and "select if is_admin()" policies (0001) — no
--          is_staff() tier. Every embedded profiles join used across the
--          admin app (leads.assignee, bookings.practitioner, tickets.client,
--          tickets.assignee) silently returned null for staff_support/
--          staff_sales users, since Postgres RLS applies to the joined table
--          from the querying role's perspective, not just the top-level
--          table's policy. Confirmed via the real @supabase/supabase-js
--          client: the exact same query returned the joined profile for an
--          admin and null for a staff_support user on the same row.
-- Depends on: 0001 (profiles, is_staff())
-- Rollback: drop policy "profiles_select_staff" on public.profiles;
-- ============================================================================

drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.is_staff());

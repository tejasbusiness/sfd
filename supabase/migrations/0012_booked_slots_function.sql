-- ============================================================================
-- 0012_booked_slots_function.sql
-- Purpose: Fix a real bug found via manual testing of the "Book a Call" modal
--          (docs/logs.md, 2026-08-07): fetchAvailableSlots() needs to read
--          existing bookings' time ranges to compute overlap client-side, but
--          public.bookings intentionally has no anon SELECT policy (see
--          0005_bookings.sql) since a full-row policy would leak client PII
--          (name/email/phone/notes) to any visitor. A security-definer
--          function exposes only starts_at/ends_at for active bookings,
--          nothing else, callable by anon.
-- Depends on: 0005 (bookings)
-- Rollback: drop function public.get_booked_slots(uuid);
-- ============================================================================

create or replace function public.get_booked_slots(p_service_id uuid)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select starts_at, ends_at
  from public.bookings
  where service_id = p_service_id
    and status in ('pending', 'confirmed', 'rescheduled')
    and starts_at >= now();
$$;

comment on function public.get_booked_slots(uuid) is 'Exposes only busy time ranges for a service (no client PII) so anon visitors can see real-time slot availability without a broad SELECT policy on bookings.';

revoke all on function public.get_booked_slots(uuid) from public;
grant execute on function public.get_booked_slots(uuid) to anon, authenticated;

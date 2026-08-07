-- ============================================================================
-- 0014_ist_business_hours_and_slot_buffer.sql
-- Purpose: Two related fixes to the booking widget, requested together:
--          (1) business hours are true IST (India Standard Time, UTC+5:30,
--              no DST), not UTC — convert any already-seeded 09:00-17:00 UTC
--              availability_rules rows for the bookable service to their
--              correct 03:30-11:30 UTC (= 09:00-17:00 IST) equivalents, so a
--              local DB seeded before this migration doesn't silently keep
--              wrong hours. New environments get the correct hours directly
--              from the updated seed.sql.
--          (2) buffer_minutes (already a column since 0005, seeded as 15,
--              but never actually read anywhere) is now applied by both
--              fetchAvailableSlots (client) and create-booking (server) to
--              enforce a real 45-minute gap between 30-minute meeting slots
--              — no schema change needed for this half, just documenting it
--              here since both fixes shipped in the same session.
-- Depends on: 0005 (bookings/availability_rules)
-- Rollback: update public.availability_rules set start_time = '09:00',
--           end_time = '17:00' where start_time = '03:30' and end_time = '11:30';
-- ============================================================================

update public.availability_rules
set start_time = '03:30', end_time = '11:30'
where start_time = '09:00' and end_time = '17:00';

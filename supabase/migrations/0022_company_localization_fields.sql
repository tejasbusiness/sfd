-- ============================================================================
-- 0022_company_localization_fields.sql
-- Purpose: Extend the `company` settings row with the new Localization
--          sub-tab fields (Settings > Company > Localization): date format,
--          time format, first day of week, currency position. `timezone`
--          already existed on this row (migration 0003) and simply moves to
--          the Localization sub-tab in the UI — no schema change needed for
--          it.
-- Depends on: 0018 (company row already extended once before)
-- Rollback: no clean rollback — this merges new jsonb keys into the existing
--           row; manually strip keys if needed.
-- ============================================================================

update public.settings
set value = value || jsonb_build_object(
  'date_format', 'm-d-Y',
  'time_format', '12 am',
  'first_day_of_week', 'sunday',
  'currency_position', 'left'
)
where key = 'company' and not (value ? 'date_format');

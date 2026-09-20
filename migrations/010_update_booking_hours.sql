-- Owner decision (2026-09-20): discovery calls are 30 minutes, offered Monday to
-- Friday 10:00-13:00 and 17:00-19:00 in the VISITOR'S local time.
DELETE FROM availability_rules;

INSERT INTO availability_rules (weekday, start_time, end_time, active) VALUES
  (1, '10:00:00', '13:00:00', 1),
  (1, '17:00:00', '19:00:00', 1),
  (2, '10:00:00', '13:00:00', 1),
  (2, '17:00:00', '19:00:00', 1),
  (3, '10:00:00', '13:00:00', 1),
  (3, '17:00:00', '19:00:00', 1),
  (4, '10:00:00', '13:00:00', 1),
  (4, '17:00:00', '19:00:00', 1),
  (5, '10:00:00', '13:00:00', 1),
  (5, '17:00:00', '19:00:00', 1);

UPDATE booking_settings SET needs_confirmation = 0 WHERE setting_key = 'call_duration_minutes';

UPDATE booking_settings
   SET description = 'Used for the daily booking limit and stored on each booking. Opening hours are in the visitor''s local time.'
 WHERE setting_key = 'sfd_timezone';

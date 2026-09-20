-- PLACEHOLDER VALUES: the owner has not decided any of these yet (docs/10,
-- "BLOCKING before final booking integration"). needs_confirmation = 1 marks them.
-- Change them with an UPDATE or a new migration, never by editing this file.
INSERT INTO booking_settings (setting_key, setting_value, description, needs_confirmation) VALUES
  ('sfd_timezone', 'Asia/Kolkata', 'Calendar timezone for opening hours', 1),
  ('call_duration_minutes', '30', 'Length of a discovery call', 1),
  ('buffer_minutes', '15', 'Gap kept free after each call', 1),
  ('min_notice_hours', '12', 'Earliest a slot can be booked from now', 1),
  ('booking_window_days', '30', 'How far ahead visitors can book', 1),
  ('daily_booking_limit', '6', 'Maximum calls per day', 1),
  ('slot_step_minutes', '30', 'Start times are offered every N minutes', 1);

INSERT INTO availability_rules (weekday, start_time, end_time, active) VALUES
  (1, '10:00:00', '18:00:00', 1),
  (2, '10:00:00', '18:00:00', 1),
  (3, '10:00:00', '18:00:00', 1),
  (4, '10:00:00', '18:00:00', 1),
  (5, '10:00:00', '18:00:00', 1);

-- Owner decision (2026-10-02): the free call is 20 minutes ("Book a Free 20-Minute
-- Call"). Slot starts stay every 30 minutes; the buffer setting is unchanged.
UPDATE booking_settings SET setting_value = '20', description = 'Length of the free call', needs_confirmation = 0
WHERE setting_key = 'call_duration_minutes';

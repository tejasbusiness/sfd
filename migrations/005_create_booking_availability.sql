-- Key/value booking rules (opening hours live in availability_rules). Every seeded
-- value is a placeholder until the owner confirms it (docs/10, BLOCKING decisions).
CREATE TABLE booking_settings (
  setting_key VARCHAR(60) NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  description VARCHAR(255) NULL,
  needs_confirmation TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weekly opening hours in the SFD timezone (booking_settings.sfd_timezone).
CREATE TABLE availability_rules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  weekday TINYINT UNSIGNED NOT NULL COMMENT 'ISO: 1 = Monday ... 7 = Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_rules_weekday (weekday, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Holidays and one-off changes. NULL times block the whole day.
CREATE TABLE availability_exceptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  on_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  reason VARCHAR(160) NULL,
  PRIMARY KEY (id),
  KEY idx_exceptions_date (on_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

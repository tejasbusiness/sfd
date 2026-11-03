-- Cookieless funnel tracking (2026-11-05, docs/14 "Funnel tracking"). The site sends an
-- anonymous beacon for two steps that never reach the database otherwise: a click on a
-- "Start My Free Website Preview" link and the first interaction with a preview form.
-- No cookie, IP, user agent or visitor id is stored; only the step, the page path and time.
CREATE TABLE funnel_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event ENUM('cta_click','form_start') NOT NULL,
  page VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_funnel_event_created (event, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Later steps are lead statuses that already exist on preview_applications
-- (qualified, preview_sent, activated). These columns record when the status last changed
-- and the unpaid production time spent on each request, set with api/bin/lead-status.php.
ALTER TABLE preview_applications
  ADD COLUMN status_changed_at DATETIME NULL AFTER status,
  ADD COLUMN production_minutes INT UNSIGNED NOT NULL DEFAULT 0 AFTER status_changed_at;

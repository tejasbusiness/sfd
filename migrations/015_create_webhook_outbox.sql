-- Outbound webhooks to n8n (docs/15). Every event is written here first, then posted, so a
-- failed or slow n8n never loses a lead and the post can be retried by api/bin/send-webhooks.php.
-- The payload repeats the lead's contact details, so sent rows are purged after 30 days by
-- that script (the lead itself stays in its own table under the normal retention rule).
CREATE TABLE webhook_outbox (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event VARCHAR(60) NOT NULL,
  payload MEDIUMTEXT NOT NULL,
  related_type VARCHAR(40) NULL,
  related_id BIGINT UNSIGNED NULL,
  status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_status_code SMALLINT UNSIGNED NULL,
  last_error VARCHAR(500) NULL,
  next_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webhook_status_next (status, next_attempt_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

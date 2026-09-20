-- Proof of consent: cookie choices and the consent checkbox on every form.
CREATE TABLE consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purpose VARCHAR(30) NOT NULL COMMENT 'cookie | contact | preview | playbook | booking',
  granted TINYINT(1) NOT NULL,
  analytics TINYINT(1) NULL COMMENT 'cookie consent only',
  marketing TINYINT(1) NULL COMMENT 'cookie consent only',
  wording_version VARCHAR(20) NOT NULL,
  subject_email VARCHAR(255) NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  source_page VARCHAR(255) NULL,
  is_test TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_consents_purpose_created (purpose, created_at),
  KEY idx_consents_email (subject_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE playbook_subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  consent_id BIGINT UNSIGNED NULL,
  status ENUM('pending','subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  unsubscribe_token CHAR(64) NOT NULL,
  source_page VARCHAR(255) NULL,
  delivered_at DATETIME NULL COMMENT 'set when the playbook email is actually sent',
  unsubscribed_at DATETIME NULL,
  ip_hash CHAR(64) NULL,
  is_test TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_playbook_email (email),
  UNIQUE KEY uq_playbook_token (unsubscribe_token),
  CONSTRAINT fk_playbook_consent FOREIGN KEY (consent_id) REFERENCES consents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Free Website Review requests (homepage lead offer, 2026-10-02): a lower-intent
-- alternative to the Free Preview. The review itself is prepared and emailed by hand.
CREATE TABLE website_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference VARCHAR(20) NOT NULL,
  business_name VARCHAR(160) NULL,
  website VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  consent_id BIGINT UNSIGNED NULL,
  status ENUM('new','reviewing','sent','spam','archived') NOT NULL DEFAULT 'new',
  source_page VARCHAR(255) NULL,
  utm_source VARCHAR(150) NULL,
  utm_medium VARCHAR(150) NULL,
  utm_campaign VARCHAR(150) NULL,
  utm_term VARCHAR(150) NULL,
  utm_content VARCHAR(150) NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  is_test TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_website_reviews_reference (reference),
  KEY idx_website_reviews_status_created (status, created_at),
  KEY idx_website_reviews_email (email),
  CONSTRAINT fk_website_reviews_consent FOREIGN KEY (consent_id) REFERENCES consents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

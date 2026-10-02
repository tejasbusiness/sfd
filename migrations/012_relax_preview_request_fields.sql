-- Free Preview request simplified (owner, 2026-10-02): phone, location and category
-- are no longer asked for, so new rows leave them empty. Existing rows are untouched.
ALTER TABLE preview_applications
  MODIFY country_code VARCHAR(8) NULL,
  MODIFY mobile_number VARCHAR(20) NULL,
  MODIFY website VARCHAR(500) NULL COMMENT 'website or Google Business Profile URL',
  MODIFY country VARCHAR(80) NULL,
  MODIFY city VARCHAR(120) NULL,
  MODIFY category VARCHAR(80) NULL;

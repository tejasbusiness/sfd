-- Lead requests from industry hero forms are tagged with the trade (docs/15, 2026-11-02),
-- e.g. 'Garage Door Services'. Free Preview page requests leave it empty. Phone is now
-- required by the API for new rows; existing rows keep their (nullable) phone columns.
ALTER TABLE preview_applications
  ADD COLUMN trade VARCHAR(60) NULL AFTER problem;

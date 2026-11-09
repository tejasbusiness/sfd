-- Founding Client Program (2026-11-09, docs/14). A Free Preview request can say the visitor
-- wants one of the founding spots (optional checkbox on /free-preview/, ticked when they arrive
-- from /founding-clients/ with ?offer=founding). Existing rows are 0.
ALTER TABLE preview_applications
  ADD COLUMN founding_interest TINYINT(1) NOT NULL DEFAULT 0 AFTER trade;

-- A click on any link to /founding-clients/ (bar, pill, banners, cards, Menu, footer), counted by
-- the same cookieless beacon as the preview steps. Only the page the click happened on is stored.
ALTER TABLE funnel_events
  MODIFY event ENUM('cta_click','form_start','founding_click') NOT NULL;

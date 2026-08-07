-- ============================================================================
-- seed.sql
-- Purpose: Dev/test data for local testing against the shared Supabase
--          instance (supabase-sfd.apps.synergyfirstdigital.com). Every row
--          that represents a "fake" lead/booking/ticket is flagged
--          is_test = true so it can be filtered out of real CRM views and
--          bulk-deleted later without touching production data.
--          Content rows (services, pricing_tiers, portfolio_items,
--          testimonials) are NOT test data — they're real starter content
--          the admin will edit, so they have no is_test flag.
-- Run after: migrations 0001-0009
-- Safe to re-run: uses ON CONFLICT DO NOTHING / stable slugs throughout.
-- ============================================================================

-- ---- services (the four entry offers + Social Media Marketing + the WhatsApp upsell) ----

insert into public.services (slug, name, short_description, long_description, niche_tags, is_bookable, default_duration_minutes, display_order, is_published) values
  ('web-design', 'Web Design', 'Custom websites built to convert visitors into patients/clients.', null, array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], false, null, 1, true),
  ('seo', 'SEO', 'Ranking and organic traffic growth for local, appointment-driven search.', null, array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], false, null, 2, true),
  ('ai-solutions', 'AI Solutions', 'Automation and AI tooling for your practice.', null, array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], false, null, 3, true),
  ('one-on-one-help', '1-on-1 Website Help', 'Live screen-share sessions with a designer.', null, array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], true, 30, 4, true),
  ('social-media-marketing', 'Social Media Marketing', 'Content and campaign management that builds trust before the first visit.', 'We plan, design, and post content that shows your practice is active, credible, and worth booking with — built around the platforms your patients actually use, not generic posting schedules.', array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], false, null, 5, true),
  ('whatsapp-business-api', 'WhatsApp Business API', 'WhatsApp CRM and automation for patient/client communication.', null, array['dentist','dermatologist','physio','chiro','pediatrician','eye-clinic','dietitian','fitness-coach','yoga-studio'], false, null, 6, true)
  on conflict (slug) do nothing;

-- ---- pricing_tiers (values from docs/05, stored in smallest currency unit) --

insert into public.pricing_tiers (slug, name, price_usd_cents, price_inr_paise, billing_period, features, is_most_popular, display_order, is_published) values
  ('starter', 'Starter', 24900, 99000, 'monthly', '["Custom website (basic e-commerce excluded)", "Mobile responsive", "Basic SEO setup"]', false, 1, true),
  ('professional', 'Professional', 44900, 149000, 'monthly', '["Everything in Starter", "Advanced SEO", "Priority support"]', true, 2, true),
  ('business', 'Business', 74900, 269000, 'monthly', '["Everything in Professional", "E-commerce enabled", "Dedicated account manager"]', false, 3, true)
  on conflict (slug) do nothing;

-- ---- portfolio_items (placeholder case studies) -----------------------------

insert into public.portfolio_items (slug, title, niche_tags, summary, outcome_metrics, display_order, is_published) values
  ('sample-dental-rebuild', 'Sample Dental Practice Rebuild', array['dentist'], 'Placeholder case study — replace with a real project once available.', '[{"label": "Booking conversion", "value": "+0%"}]', 1, false),
  ('sample-physio-booking-site', 'Sample Physio Booking Site', array['physio','chiro'], 'Placeholder case study — replace with a real project once available.', '[{"label": "Organic traffic", "value": "+0%"}]', 2, false)
  on conflict (slug) do nothing;

-- Note: both left is_published = false intentionally — these are structural
-- placeholders, not real claims about outcomes, and should not go live
-- until replaced with genuine case studies.

-- ---- testimonials (placeholder, unpublished) --------------------------------

insert into public.testimonials (client_name, practice_name, quote, rating, is_featured, display_order, is_published)
select 'Sample Client', 'Sample Practice', 'Placeholder testimonial — replace before launch.', 5, false, 1, false
where not exists (select 1 from public.testimonials where client_name = 'Sample Client' and practice_name = 'Sample Practice');

-- ---- is_test leads/bookings/tickets for local flow testing ------------------
-- These exercise the CRM/booking/ticketing UI without representing real
-- prospects. Filter admin views on is_test = false to hide these in a
-- production-facing screen, or is_test = true to review only seed data.

do $$
declare
  v_web_design_id uuid;
  v_lead_id uuid;
begin
  select id into v_web_design_id from public.services where slug = 'web-design';

  insert into public.leads (full_name, email, phone, entry_service_id, form_type, source, status, message, is_test)
  values ('Test Lead One', 'test-lead-1@example.com', '+10000000001', v_web_design_id, 'contact', 'seed-script', 'new', 'Seed data for local testing.', true)
  returning id into v_lead_id;

  insert into public.bookings (lead_id, service_id, starts_at, ends_at, status, client_full_name, client_email, is_test)
  values (v_lead_id, v_web_design_id, now() + interval '2 days', now() + interval '2 days' + interval '30 minutes', 'confirmed', 'Test Lead One', 'test-lead-1@example.com', true);

  insert into public.tickets (lead_id, subject, status, priority, is_test)
  values (v_lead_id, 'Seed ticket: sample support question', 'open', 'normal', true);
exception
  when unique_violation then
    raise notice 'Seed leads/bookings/tickets already exist, skipping.';
end $$;

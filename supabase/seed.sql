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

-- ---- availability_rules (Mon-Fri 9am-5pm IST for the bookable service) -----
-- practitioner_id NULL = applies to the whole team, per migration 0005's design.
-- Stored in UTC (start_time/end_time columns have no timezone concept of
-- their own — the whole booking system works in UTC internally, per
-- docs/logs.md), converted from true IST business hours: IST = UTC+5:30, no
-- DST, so 09:00-17:00 IST = 03:30-11:30 UTC on the same calendar day (IST
-- leads UTC, so no day-of-week rollover to account for here).

do $$
declare
  v_bookable_service_id uuid;
  v_day int;
begin
  select id into v_bookable_service_id from public.services where slug = 'one-on-one-help';

  if v_bookable_service_id is not null then
    for v_day in 1..5 loop -- Monday(1) through Friday(5)
      insert into public.availability_rules (service_id, practitioner_id, day_of_week, start_time, end_time, buffer_minutes, is_active)
      select v_bookable_service_id, null, v_day, '03:30', '11:30', 15, true
      where not exists (
        select 1 from public.availability_rules
        where service_id = v_bookable_service_id and practitioner_id is null and day_of_week = v_day
      );
    end loop;
  end if;
end $$;

-- ---- pricing_tiers (values from docs/05, stored in smallest currency unit) --

insert into public.pricing_tiers (slug, name, price_usd_cents, price_inr_paise, billing_period, features, is_most_popular, display_order, is_published) values
  ('starter', 'Starter', 24900, 99000, 'monthly', '["Custom website (basic e-commerce excluded)", "Mobile responsive", "Basic SEO setup"]', false, 1, true),
  ('professional', 'Professional', 44900, 149000, 'monthly', '["Everything in Starter", "Advanced SEO", "Priority support"]', true, 2, true),
  ('business', 'Business', 74900, 269000, 'monthly', '["Everything in Professional", "E-commerce enabled", "Dedicated account manager"]', false, 3, true)
  on conflict (slug) do nothing;

-- ---- portfolio_items (dev/demo case studies, one per niche) -----------------
-- Published so the redesigned Portfolio/WorkShowcase/Hero-trust-strip pages
-- render real content locally instead of empty states. Framed as
-- representative example work, not verified client outcome claims — replace
-- with genuine case studies (and set real is_published values) before launch.
-- cover_image_url intentionally left null: CaseStudyCard already renders a
-- clean fallback block, and no real project photography exists yet.

insert into public.portfolio_items (slug, title, niche_tags, summary, outcome_metrics, display_order, is_published) values
  ('riverside-dental-rebuild', 'Riverside Dental', array['dentist'], 'A full site rebuild around online booking and a clearer new-patient path — from first search to a confirmed appointment in under three clicks.', '[{"label": "Booking conversion", "value": "+62%"}, {"label": "New patient inquiries", "value": "+41%"}]', 1, true),
  ('clearview-physio-booking', 'Clearview Physio', array['physio','chiro'], 'Rebuilt the intake flow around insurance and referral questions patients actually ask before their first visit, cutting front-desk phone volume.', '[{"label": "Organic traffic", "value": "+58%"}, {"label": "Phone inquiries", "value": "-30%"}]', 2, true),
  ('sage-wellness-studio', 'Sage Wellness Studio', array['yoga-studio','fitness-coach'], 'A class-schedule-first homepage with automated waitlist follow-up, replacing a static PDF schedule that was going stale every month.', '[{"label": "Class sign-ups", "value": "+37%"}]', 3, true),
  ('brightsmile-pediatric-dental', 'Brightsmile Pediatric Dental', array['pediatrician','dentist'], 'Parent-facing copy and a calmer visual system for a practice whose old site read as generic dental rather than child-focused.', '[{"label": "Booking conversion", "value": "+29%"}]', 4, true),
  ('clearlook-eye-clinic', 'ClearLook Eye Clinic', array['eye-clinic'], 'Consolidated three separate location pages into one clean multi-location booking flow, with automated appointment reminders.', '[{"label": "No-show rate", "value": "-22%"}]', 5, true),
  ('nourish-nutrition-collective', 'Nourish Nutrition Collective', array['dietitian'], 'Positioned a solo dietitian practice against larger telehealth competitors with a program-based pricing page and lead-magnet download.', '[{"label": "Qualified leads", "value": "+45%"}]', 6, true)
  on conflict (slug) do nothing;

-- ---- testimonials (dev/demo, one per represented niche) ----------------------
-- Published + a subset featured so TestimonialsSection's masonry wall and any
-- featured-testimonial surfaces render real content locally. Same disclaimer
-- as portfolio_items above: representative demo copy, not verified quotes —
-- replace before launch.

-- No unique constraint exists on this table, so re-running a plain insert
-- would duplicate rows — guard each one with an existence check instead,
-- matching this file's own "safe to re-run" convention.
do $$
declare
  v_rows record;
begin
  for v_rows in
    select * from (values
      ('Dr. Anjali Rao', 'Riverside Dental', 'Our booking rate doubled within the first month. The site finally looks like the practice we actually run.', 5, true, 1, true),
      ('Marco Silva', 'Clearview Physio', 'The automated follow-ups alone paid for the subscription in the first quarter. Patients actually show up now.', 5, true, 2, true),
      ('Priya Nair', 'Sage Wellness Studio', 'Finally a team that understood our niche instead of pitching us the same template they sell everyone else.', 5, true, 3, true),
      ('Dr. Kevin Wu', 'Brightsmile Pediatric Dental', 'Parents comment on the site before they even walk in. That never happened with our old one.', 5, false, 4, true),
      ('Dr. Fatima Al-Sayed', 'ClearLook Eye Clinic', 'Managing three locations used to mean three separate headaches. Now it is one calendar and one clear view of bookings.', 4, false, 5, true),
      ('Jordan Blake', 'Nourish Nutrition Collective', 'I went from chasing leads over DM to a real pipeline. The pricing page alone changed how people see my practice.', 5, false, 6, true)
    ) as t(client_name, practice_name, quote, rating, is_featured, display_order, is_published)
  loop
    insert into public.testimonials (client_name, practice_name, quote, rating, is_featured, display_order, is_published)
    select v_rows.client_name, v_rows.practice_name, v_rows.quote, v_rows.rating, v_rows.is_featured, v_rows.display_order, v_rows.is_published
    where not exists (
      select 1 from public.testimonials
      where client_name = v_rows.client_name and practice_name = v_rows.practice_name
    );
  end loop;
end $$;

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

  insert into public.bookings (lead_id, service_id, starts_at, ends_at, status, client_full_name, client_phone, client_email, is_test)
  values (v_lead_id, v_web_design_id, now() + interval '2 days', now() + interval '2 days' + interval '30 minutes', 'confirmed', 'Test Lead One', '+10000000001', 'test-lead-1@example.com', true);

  insert into public.tickets (lead_id, subject, status, priority, is_test)
  values (v_lead_id, 'Seed ticket: sample support question', 'open', 'normal', true);
exception
  when unique_violation then
    raise notice 'Seed leads/bookings/tickets already exist, skipping.';
end $$;

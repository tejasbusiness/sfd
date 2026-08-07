-- ============================================================================
-- 0013_phone_required_email_optional.sql
-- Purpose: Flip the contact-info requirement across all lead-capturing flows
--          (contact/inquiry/quote forms + booking widget) — phone becomes the
--          required contact method, email becomes optional. Decided
--          2026-08-07 while rebuilding the booking widget as a multi-step
--          flow; applied consistently to public.leads and public.bookings
--          for CRM consistency rather than just the booking table.
--          Does NOT touch checkout/payment email (Stripe/Razorpay still
--          require an email for receipts — separate concern, unrelated to
--          lead contact info).
-- Depends on: 0004 (leads), 0005 (bookings)
-- Rollback: alter table public.leads alter column email set not null,
--           alter column phone drop not null;
--           alter table public.bookings alter column client_email set not null,
--           alter column client_phone drop not null;
--           (only safe if no null values were introduced in the meantime)
-- ============================================================================

alter table public.leads
  alter column email drop not null,
  alter column phone set not null;

alter table public.bookings
  alter column client_email drop not null,
  alter column client_phone set not null;

create index if not exists leads_phone_idx on public.leads (phone);

comment on column public.leads.phone is 'Required contact method for all leads (contact/inquiry/quote forms, bookings) — flipped from email-required 2026-08-07.';
comment on column public.leads.email is 'Optional contact method — phone is the required one as of 2026-08-07.';
comment on column public.bookings.client_phone is 'Required contact method for bookings — flipped from email-required 2026-08-07.';
comment on column public.bookings.client_email is 'Optional contact method for bookings — phone is required. Note: checkout/billing (subscriptions, Stripe/Razorpay) is a separate flow and still requires email for payment receipts.';

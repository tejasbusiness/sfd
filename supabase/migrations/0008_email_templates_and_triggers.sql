-- ============================================================================
-- 0008_email_templates_and_triggers.sql
-- Purpose: Configurable, merge-field email templates + an audit log of fired
--          triggers. The post-project-completion -> WhatsApp Business API
--          intro is its own trigger_key, kept distinct from new_lead_welcome
--          per the sequencing rule in docs/01/04/09 (never bundle the two).
-- Depends on: 0001 (profiles/roles)
-- Rollback: drop table public.email_trigger_log, public.email_templates;
-- ============================================================================

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  trigger_key text not null unique,
  subject text not null,
  body_html text not null,
  merge_fields text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.email_templates is 'One row per trigger_key. Known keys: new_lead_welcome, booking_confirmed, booking_reminder_24h, lead_followup_nudge, ticket_resolved_checkin, project_completed_whatsapp_intro. The last is deliberately separate from new_lead_welcome per the business-sequencing rule.';

drop trigger if exists set_email_templates_updated_at on public.email_templates;
create trigger set_email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

create table if not exists public.email_trigger_log (
  id uuid primary key default gen_random_uuid(),
  trigger_key text not null,
  lead_id uuid references public.leads(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  recipient_email text not null,
  status text not null default 'sent',
  error_message text,
  sent_at timestamptz not null default now()
);

comment on table public.email_trigger_log is 'Audit trail of fired email triggers, written by the send-email edge function. Used to verify each trigger condition fires exactly once (Phase 5 verification) and to prevent duplicate sends for scheduled sweeps (booking_reminder, lead_followup).';

create index if not exists email_trigger_log_trigger_key_idx on public.email_trigger_log (trigger_key);
create index if not exists email_trigger_log_lead_id_idx on public.email_trigger_log (lead_id);

-- ---- RLS ---------------------------------------------------------------------

alter table public.email_templates enable row level security;
alter table public.email_trigger_log enable row level security;

drop policy if exists "email_templates_admin_only" on public.email_templates;
create policy "email_templates_admin_only"
  on public.email_templates for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "email_trigger_log_staff_read" on public.email_trigger_log;
create policy "email_trigger_log_staff_read"
  on public.email_trigger_log for select
  using (public.is_staff());

-- Writes to email_trigger_log come from the send-email edge function via the
-- service-role key (bypasses RLS) — no client-side insert policy needed.

-- ---- Seed the known trigger_keys with placeholder templates ----------------

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('new_lead_welcome', 'Thanks for reaching out, {{name}}!', '<p>Hi {{name}}, thanks for your interest in {{service}}. We''ll be in touch shortly.</p>', array['name', 'service'])
  on conflict (trigger_key) do nothing;

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('booking_confirmed', 'Your appointment is confirmed', '<p>Hi {{name}}, your {{service}} appointment is confirmed for {{date}}.</p>', array['name', 'service', 'date'])
  on conflict (trigger_key) do nothing;

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('booking_reminder_24h', 'Reminder: your appointment is tomorrow', '<p>Hi {{name}}, just a reminder about your {{service}} appointment on {{date}}.</p>', array['name', 'service', 'date'])
  on conflict (trigger_key) do nothing;

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('lead_followup_nudge', 'Still interested, {{name}}?', '<p>Hi {{name}}, following up on your {{service}} inquiry — happy to answer any questions.</p>', array['name', 'service'])
  on conflict (trigger_key) do nothing;

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('ticket_resolved_checkin', 'How did we do?', '<p>Hi {{name}}, your ticket "{{ticket_subject}}" was marked resolved. Let us know if you need anything else.</p>', array['name', 'ticket_subject'])
  on conflict (trigger_key) do nothing;

insert into public.email_templates (trigger_key, subject, body_html, merge_fields) values
  ('project_completed_whatsapp_intro', 'A quick idea for {{practice_name}}', '<p>Hi {{name}}, now that your {{service}} project is live, here''s how WhatsApp Business API could extend it for patient communication...</p>', array['name', 'service', 'practice_name'])
  on conflict (trigger_key) do nothing;

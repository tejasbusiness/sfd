-- ============================================================================
-- 0009_indexes_and_constraints.sql
-- Purpose: Cross-table indexes for query paths used by CRM/admin screens that
--          aren't covered by the single-table indexes already created in
--          0004-0008. Final constraint review pass.
-- Depends on: 0001-0008
-- Rollback: drop each index listed below (all created with IF NOT EXISTS,
--           safe to re-run).
-- ============================================================================

-- CRM lead list: filter by status + sort by recency together (common admin view)
create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);

-- Admin calendar: date-range queries scoped by status (e.g. hide canceled)
create index if not exists bookings_starts_at_status_idx
  on public.bookings (starts_at, status);

-- Ticket list: filter by status + priority together
create index if not exists tickets_status_priority_idx
  on public.tickets (status, priority);

-- CRM communication history: pull all messages for a lead in chronological order
create index if not exists messages_lead_id_created_at_idx
  on public.messages (lead_id, created_at)
  where lead_id is not null;

-- CRM communication history: pull all messages for a ticket in chronological order
create index if not exists messages_ticket_id_created_at_idx
  on public.messages (ticket_id, created_at)
  where ticket_id is not null;

-- Subscription-status admin view: active/past-due clients surfaced first
create index if not exists subscriptions_client_status_idx
  on public.subscriptions (client_id, status);

-- email_trigger_log: dedup checks for scheduled sweeps (has this lead already
-- gotten this trigger?) done by the booking-reminder / lead-followup-sweep
-- edge functions before insert.
create index if not exists email_trigger_log_key_lead_idx
  on public.email_trigger_log (trigger_key, lead_id);

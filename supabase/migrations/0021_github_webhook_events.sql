-- ============================================================================
-- 0021_github_webhook_events.sql
-- Purpose: Persist real GitHub push-event commits received by the
--          github-webhook edge function (Settings > Company > Integration >
--          GitHub). Mirrors the stripe-webhook/razorpay-webhook pattern of
--          normalizing verified webhook payloads into a real table rather
--          than just logging. task_id is the trailing "#<id>" extracted from
--          a commit message per the documented convention — this table does
--          NOT join it to `tickets` (no generic "task" entity exists in this
--          schema yet); linking to a real row is a future decision.
-- Depends on: 0001 (public.is_staff())
-- Rollback: drop table public.github_webhook_events;
-- ============================================================================

create table if not exists public.github_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  commit_message text,
  task_id text,
  received_at timestamptz not null default now(),
  raw_payload jsonb
);

comment on table public.github_webhook_events is 'Verified GitHub webhook push events, written by the github-webhook edge function (service role). task_id is extracted from commit message #<id> suffix, not linked to any table yet.';

alter table public.github_webhook_events enable row level security;

drop policy if exists "github_webhook_events_staff_read" on public.github_webhook_events;
create policy "github_webhook_events_staff_read"
  on public.github_webhook_events for select
  using (public.is_staff());

grant select on public.github_webhook_events to authenticated;
grant select, insert on public.github_webhook_events to service_role;

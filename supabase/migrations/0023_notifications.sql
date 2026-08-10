-- ============================================================================
-- 0023_notifications.sql
-- Purpose: Real-time admin notifications (docs/07) — new lead, new booking,
--          new ticket, new customer ticket reply. Broadcast rows (one per
--          event, visible to all staff via is_staff()) with per-user read
--          state in a join table, since any staff member handling a lead may
--          differ from who's currently looking at the bell. Also stores Web
--          Push subscriptions per staff user for the push-notification path;
--          the in-app bell (this table alone) is the fallback per docs/07
--          when push isn't granted.
-- Depends on: 0001 (profiles/roles/is_staff), 0004 (leads), 0005 (bookings),
--             0006 (tickets/messages)
-- Rollback: drop table public.notification_reads, public.push_subscriptions,
--           public.notifications; drop type public.notification_type;
--           drop trigger notify_new_lead on leads; drop trigger
--           notify_new_booking on bookings; drop trigger notify_new_ticket
--           on tickets; drop trigger notify_new_ticket_reply on messages;
--           drop function public.notify_new_lead(), public.notify_new_booking(),
--           public.notify_new_ticket(), public.notify_new_ticket_reply();
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('new_lead', 'new_booking', 'new_ticket', 'new_ticket_reply');
  end if;
end $$;

-- ---- notifications (broadcast to all staff) -----------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type public.notification_type not null,
  title text not null,
  body text not null,
  lead_id uuid references public.leads(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete cascade,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'One row per notifiable event (new lead/booking/ticket/ticket reply), visible to all staff. Per-user read state lives in notification_reads, not on this table, since any staff member may read independently. Populated by triggers on leads/bookings/tickets/messages inserts, not application code, so it fires regardless of which code path created the row (admin-created bookings included).';

create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

-- ---- per-user read state --------------------------------------------------------

create table if not exists public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

-- ---- push subscriptions (Web Push, per staff user/device) -----------------------

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

comment on table public.push_subscriptions is 'Browser Push API subscriptions, one row per (user, device/browser). Written by the client on Notification.requestPermission() grant, read by the send-push edge function to deliver Web Push messages. endpoint is unique per browser+origin, so re-subscribing the same device upserts rather than duplicating.';

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

-- ---- grants ---------------------------------------------------------------------
-- 0010_role_grants.sql set `alter default privileges ... revoke all on tables
-- from anon, authenticated`, so every table created after it (these three
-- included) defaults to zero access for `authenticated` regardless of RLS —
-- same bug class fixed for blog_posts in 0016. service_role already gets
-- `all` automatically via 0011's default-privileges grant, so only
-- `authenticated` needs an explicit grant here. No anon grant on any of
-- these — all three are staff/own-user-only via RLS above.

grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.notification_reads to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- ---- RLS ---------------------------------------------------------------------

alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "notifications_select_staff" on public.notifications;
create policy "notifications_select_staff"
  on public.notifications for select
  using (public.is_staff());

-- Inserts come from trigger functions (security definer, run as table owner),
-- not client code — no client-facing insert policy needed.

drop policy if exists "notification_reads_own" on public.notification_reads;
create policy "notification_reads_own"
  on public.notification_reads for all
  using (user_id = auth.uid() and public.is_staff())
  with check (user_id = auth.uid() and public.is_staff());

drop policy if exists "push_subscriptions_own" on public.push_subscriptions;
create policy "push_subscriptions_own"
  on public.push_subscriptions for all
  using (user_id = auth.uid() and public.is_staff())
  with check (user_id = auth.uid() and public.is_staff());

-- send-push edge function reads all rows via the service-role key (bypasses
-- RLS by design), so no separate staff-read-all policy is needed here.

-- ---- trigger functions ---------------------------------------------------------

create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, lead_id, is_test)
  values ('new_lead', 'New lead', new.full_name || ' submitted a ' || coalesce(new.form_type::text, 'contact') || ' form', new.id, new.is_test);
  return new;
end;
$$;

drop trigger if exists notify_new_lead on public.leads;
create trigger notify_new_lead
  after insert on public.leads
  for each row execute function public.notify_new_lead();

create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, booking_id, is_test)
  values ('new_booking', 'New booking', new.client_full_name || ' booked for ' || to_char(new.starts_at, 'Mon DD, HH12:MI AM'), new.id, new.is_test);
  return new;
end;
$$;

drop trigger if exists notify_new_booking on public.bookings;
create trigger notify_new_booking
  after insert on public.bookings
  for each row execute function public.notify_new_booking();

create or replace function public.notify_new_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, ticket_id, is_test)
  values ('new_ticket', 'New support ticket', new.subject, new.id, new.is_test);
  return new;
end;
$$;

drop trigger if exists notify_new_ticket on public.tickets;
create trigger notify_new_ticket
  after insert on public.tickets
  for each row execute function public.notify_new_ticket();

create or replace function public.notify_new_ticket_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ticket_subject text;
  ticket_is_test boolean;
begin
  -- Only customer-visible replies on tickets notify staff — staff's own
  -- internal notes/replies shouldn't self-notify staff, and chat/lead_note
  -- messages are out of scope for this notification type.
  if new.context_type = 'ticket' and new.visibility = 'customer' then
    select subject, is_test into ticket_subject, ticket_is_test
    from public.tickets where id = new.ticket_id;

    if ticket_subject is not null then
      insert into public.notifications (type, title, body, ticket_id, is_test)
      values ('new_ticket_reply', 'New reply on "' || ticket_subject || '"', left(new.body, 140), new.ticket_id, coalesce(ticket_is_test, false));
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists notify_new_ticket_reply on public.messages;
create trigger notify_new_ticket_reply
  after insert on public.messages
  for each row execute function public.notify_new_ticket_reply();

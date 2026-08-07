-- ============================================================================
-- 0006_tickets_and_messages.sql
-- Purpose: Support ticketing + a polymorphic messages table shared by ticket
--          replies, chatbot transcripts, and lead notes (docs/06, docs/10).
--          Polymorphism decided now (context_type/visibility) rather than
--          split into separate tables, since RLS should not be retrofitted
--          per docs/11's architecture note.
-- Depends on: 0001 (profiles/roles), 0004 (leads)
-- Rollback: drop table public.messages, public.tickets;
--           drop type public.message_context, public.message_visibility,
--           public.ticket_status, public.ticket_priority;
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_priority') then
    create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_context') then
    create type public.message_context as enum ('ticket', 'chat', 'lead_note');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_visibility') then
    create type public.message_visibility as enum ('internal', 'customer');
  end if;
end $$;

-- ---- tickets -----------------------------------------------------------------

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  subject text not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references public.profiles(id) on delete set null,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_client_id_idx on public.tickets (client_id);
create index if not exists tickets_status_idx on public.tickets (status);

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- ---- messages (polymorphic) --------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  context_type public.message_context not null,
  ticket_id uuid references public.tickets(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  visibility public.message_visibility not null default 'internal',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  body text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint messages_context_fk_check check (
    (context_type = 'ticket' and ticket_id is not null) or
    (context_type in ('chat', 'lead_note') and lead_id is not null)
  )
);

comment on table public.messages is 'Polymorphic message log: ticket replies (context_type=ticket, ticket_id set), chatbot transcripts and lead notes (context_type=chat/lead_note, lead_id set). visibility=customer rows are shown in the customer-facing ticket view; internal rows are staff-only, per docs/06''s internal-notes-vs-customer-replies split.';

create index if not exists messages_ticket_id_idx on public.messages (ticket_id);
create index if not exists messages_lead_id_idx on public.messages (lead_id);
create index if not exists messages_context_type_idx on public.messages (context_type);

-- ---- RLS ---------------------------------------------------------------------

alter table public.tickets enable row level security;
alter table public.messages enable row level security;

drop policy if exists "tickets_insert_own_or_public" on public.tickets;
create policy "tickets_insert_own_or_public"
  on public.tickets for insert
  with check (client_id = auth.uid() or client_id is null);

drop policy if exists "tickets_select_own" on public.tickets;
create policy "tickets_select_own"
  on public.tickets for select
  using (client_id = auth.uid());

drop policy if exists "tickets_all_staff" on public.tickets;
create policy "tickets_all_staff"
  on public.tickets for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "messages_select_customer_visible" on public.messages;
create policy "messages_select_customer_visible"
  on public.messages for select
  using (
    visibility = 'customer'
    and context_type = 'ticket'
    and exists (
      select 1 from public.tickets t
      where t.id = messages.ticket_id and t.client_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_customer_reply" on public.messages;
create policy "messages_insert_customer_reply"
  on public.messages for insert
  with check (
    visibility = 'customer'
    and context_type = 'ticket'
    and author_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = messages.ticket_id and t.client_id = auth.uid()
    )
  );

drop policy if exists "messages_all_staff" on public.messages;
create policy "messages_all_staff"
  on public.messages for all
  using (public.is_staff())
  with check (public.is_staff());

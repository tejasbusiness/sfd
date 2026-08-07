-- ============================================================================
-- 0001_profiles_and_roles.sql
-- Purpose: Role-aware profile table extending auth.users. Foundation for every
--          RLS policy in later migrations (they all check profiles.role).
-- Depends on: none (auth.users is built into Supabase)
-- Rollback: drop trigger on_auth_user_created on auth.users;
--           drop function public.handle_new_user;
--           drop table public.profiles;
--           drop type public.user_role;
-- ============================================================================

-- ---- Types -----------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'staff_support', 'staff_sales', 'customer');
  end if;
end $$;

-- ---- Tables ------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with app role and profile fields. One row per authenticated user (staff or customer).';

-- ---- Auto-create profile on signup -----------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- updated_at trigger helper (reused by later migrations) ----------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- Helper: is_admin() / is_staff() (reused across all later RLS policies) --

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff_support', 'staff_sales')
  );
$$;

-- ---- RLS ---------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Note: profiles_update_own's with-check intentionally blocks a customer from
-- self-promoting their own role; only admins (via profiles_update_admin) can change role.

-- ============================================================================
-- 0020_google_drive_tokens.sql
-- Purpose: Storage for real Google Drive OAuth tokens (Settings > Company >
--          Integration > Google Drive "Connect" flow). Separate from the
--          `settings` table since these are per-connection OAuth secrets,
--          not general config — written exclusively by the
--          google-drive-oauth-callback edge function via the service-role
--          client, never directly by the browser client.
-- Depends on: 0001 (public.is_admin())
-- Rollback: drop table public.integration_tokens;
-- ============================================================================

create table if not exists public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.integration_tokens is 'OAuth tokens for third-party integrations (e.g. google_drive). Written only by service-role edge functions after a real OAuth exchange.';

drop trigger if exists set_integration_tokens_updated_at on public.integration_tokens;
create trigger set_integration_tokens_updated_at
  before update on public.integration_tokens
  for each row execute function public.set_updated_at();

alter table public.integration_tokens enable row level security;

-- Admin-only read so the Settings UI can show a real "Authorized" status by
-- checking row existence/expiry, not a hardcoded flag. No insert/update/
-- delete policy for authenticated/anon at all — only the service-role
-- client (which bypasses RLS) writes here, via the OAuth callback function.
drop policy if exists "integration_tokens_admin_read" on public.integration_tokens;
create policy "integration_tokens_admin_read"
  on public.integration_tokens for select
  using (public.is_admin());

grant select on public.integration_tokens to authenticated;
grant select, insert, update, delete on public.integration_tokens to service_role;

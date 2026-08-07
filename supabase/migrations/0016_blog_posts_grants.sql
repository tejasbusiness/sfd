-- ============================================================================
-- 0016_blog_posts_grants.sql
-- Purpose: Fix a real bug caught via manual verification against the actual
--          running Supabase instance (not just RLS policy review): admin
--          writes to blog_posts failed with 42501 "permission denied" even
--          though blog_posts_write_admin (0015) is a permissive policy.
--          Root cause: 0010_role_grants.sql set
--          `alter default privileges in schema public revoke all on tables
--          from anon, authenticated` so that future tables default to no
--          access until an explicit grant is added (matching the "RLS from
--          day one, nothing implicit" rule in docs/11) — blog_posts was
--          created in 0015, after 0010 ran, and never got that grant. This
--          is the same class of bug as 0011_service_role_grants.sql: RLS
--          policies alone don't authorize a role to touch a table at all;
--          Postgres needs a separate GRANT regardless of RLS.
-- Depends on: 0015 (blog_posts)
-- Rollback: revoke select, insert, update, delete on public.blog_posts
--           from anon, authenticated;
-- ============================================================================

grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to authenticated;

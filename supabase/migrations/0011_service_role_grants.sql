-- ============================================================================
-- 0011_service_role_grants.sql
-- Purpose: service_role has rolbypassrls = true (RLS never blocks it), but
--          that does NOT exempt it from ordinary table-level GRANT/REVOKE —
--          those are two independent Postgres permission systems. Migration
--          0010 granted anon/authenticated but never explicitly granted
--          service_role, so every edge function using the secret key (e.g.
--          create-booking, manage-booking) was getting "permission denied"
--          on ordinary SELECT/INSERT/UPDATE, caught only by actually
--          exercising create-booking locally and reading the real Postgres
--          error (42501) rather than assuming service_role "just works".
-- Depends on: 0001-0010 (all tables must exist)
-- Rollback: revoke all on all tables in schema public from service_role;
-- ============================================================================

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Ensure future tables created by later migrations automatically grant
-- service_role full access too, so this class of bug can't recur silently
-- when a new table is added without remembering to extend this list.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

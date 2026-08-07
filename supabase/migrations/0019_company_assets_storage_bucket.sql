-- ============================================================================
-- 0019_company_assets_storage_bucket.sql
-- Purpose: Public Supabase Storage bucket for Site Logo / Favicon uploads
--          (Settings > Company > General). Public read (assets must render
--          on the public site unauthenticated), admin-only write.
-- Depends on: 0001 (public.is_admin())
-- Rollback: delete from storage.buckets where id = 'company-assets';
--           drop policy "company_assets_public_read" on storage.objects;
--           drop policy "company_assets_admin_write" on storage.objects;
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

drop policy if exists "company_assets_public_read" on storage.objects;
create policy "company_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'company-assets');

drop policy if exists "company_assets_admin_write" on storage.objects;
create policy "company_assets_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'company-assets' and public.is_admin());

drop policy if exists "company_assets_admin_update" on storage.objects;
create policy "company_assets_admin_update"
  on storage.objects for update
  using (bucket_id = 'company-assets' and public.is_admin())
  with check (bucket_id = 'company-assets' and public.is_admin());

drop policy if exists "company_assets_admin_delete" on storage.objects;
create policy "company_assets_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'company-assets' and public.is_admin());

-- NOTE: storage.objects/storage.buckets are Supabase-managed tables outside
-- the `public` schema, so 0010_role_grants.sql's `alter default privileges
-- in schema public revoke all ...` does not touch them — they ship with
-- baseline grants from the storage extension itself. This must still be
-- *verified* against the real local instance (same discipline that caught
-- the 0011 service_role and 0016 blog_posts grant gaps), not assumed. If a
-- real upload/read attempt returns 42501 despite the RLS policies above
-- being correct, add explicit grants here, e.g.:
--   grant select on storage.objects to anon, authenticated;
--   grant insert, update, delete on storage.objects to authenticated;

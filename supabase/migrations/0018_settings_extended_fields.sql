-- ============================================================================
-- 0018_settings_extended_fields.sql
-- Purpose: Extend the `company` and `smtp` settings rows with new fields
--          for the redesigned admin Settings > Company (General/SMS/Integration
--          sub-tabs) and Settings > Email/SMTP page, and seed two new settings
--          keys (`sms`, `integration`) that didn't exist before.
-- Depends on: 0003 (public.settings table + seed rows)
-- Rollback: no clean rollback — this merges new jsonb keys into existing rows
--           and inserts 2 new rows; manually strip keys / delete rows if needed.
-- ============================================================================

-- Extend `company` with General sub-tab fields. Guarded by a key-existence
-- check so re-running this migration (or a future db reset) never clobbers
-- values an admin has already edited via the UI.
update public.settings
set value = value || jsonb_build_object(
  'logo_path', '',
  'favicon_path', '',
  'show_logo_on_signin', true,
  'accepted_file_formats', 'jpg,jpeg,png,doc,xlsx,txt,pdf,zip,webm',
  'rows_per_page', 10,
  'rich_text_editor_enabled', true,
  'copyright_text', ''
)
where key = 'company' and not (value ? 'copyright_text');

-- Extend `smtp` with the full field set from the redesigned Email/SMTP tab.
-- `from_email` seeds from the existing `from_address` value so nothing is
-- lost; both fields are kept in storage (see AdminSettingsPage.tsx) even
-- though the UI now only shows one "from email" field going forward.
update public.settings
set value = value || jsonb_build_object(
  'protocol', 'smtp',
  'from_email', coalesce(value->>'from_address', ''),
  'user', '',
  'password', '',
  'security_type', 'tls',
  'test_send_to', ''
)
where key = 'smtp' and not (value ? 'security_type');

-- New: sms — generic HTTP API gateway config (provider-agnostic, matches the
-- Rule A/B pattern of this project: no SMS provider abstraction exists yet,
-- this is config storage only, no send-path is wired up this session).
insert into public.settings (key, value, description) values
  ('sms', '{"account_id": "", "api_key": "", "secret_key": "", "test_send_to": ""}', 'SMS gateway config (generic HTTP API) — values stored in DB, not env vars')
  on conflict (key) do nothing;

-- New: integration — reCAPTCHA, Google Drive, GitHub config in one row,
-- since the admin UI presents them as one feature group (Integration tab
-- with 3 inner sub-tabs) rather than 3 independent settings entries.
insert into public.settings (key, value, description) values
  ('integration', '{"recaptcha": {"site_key": "", "secret_key": ""}, "google_drive": {"enabled": false, "client_id": "", "client_secret": ""}, "github": {"enabled": false, "webhook_token": ""}}', 'reCAPTCHA / Google Drive / GitHub integration config')
  on conflict (key) do nothing;

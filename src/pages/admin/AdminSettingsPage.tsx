import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { Select, YesNoSelect } from '../../components/ui/Select'
import { PasswordField } from '../../components/ui/PasswordField'
import { TabNav } from '../../components/ui/TabNav'
import { ImageUploadField } from '../../components/ui/ImageUploadField'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { fetchAllSettings, updateSetting } from '../../lib/supabase/adminSettingsQueries'
import { supabase } from '../../lib/supabase/client'
import EmailTemplatesPanel from '../../components/admin/EmailTemplatesPanel'
import type {
  AiProviderSettings,
  CompanySettings,
  IntegrationSettings,
  IntegrationToken,
  PaymentGatewayMapSettings,
  SeoDefaultsSettings,
  Setting,
  SettingKey,
  SmsSettings,
  SmtpSettings,
} from '../../lib/supabase/types'

// 'email_templates' isn't a SettingKey (it's a separate table, not a
// settings row — see docs/09/06), but lives as a tab here per docs/06's
// "template editor for automated sequences [belongs] in the admin Email
// settings panel" instruction, alongside the existing SMTP config it sends
// through.
type SettingsTabKey = SettingKey | 'email_templates'

const TABS: { key: SettingsTabKey; label: string }[] = [
  { key: 'company', label: 'Company' },
  { key: 'smtp', label: 'Email / SMTP' },
  { key: 'email_templates', label: 'Email Templates' },
  { key: 'sms', label: 'SMS' },
  { key: 'integration', label: 'Integration' },
  { key: 'ai_provider', label: 'AI Provider' },
  { key: 'payment_gateway_map', label: 'Payment Routing' },
  { key: 'seo_defaults', label: 'SEO Defaults' },
]

const SECRETS_WARNING =
  "Values here are stored in the database, not environment variables. Treat this as lower-security configuration — do not enter production-critical secrets you wouldn't want visible to any admin with Settings access."

function settingsByKey(settings: Setting[]): Partial<Record<SettingKey, Setting>> {
  return Object.fromEntries(settings.map((s) => [s.key, s])) as Partial<Record<SettingKey, Setting>>
}

function AdminSettingsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('company')

  const { data, loading, error } = useFetch(() => (isAdmin ? fetchAllSettings() : Promise.resolve([])), [isAdmin])

  if (!isAdmin) {
    return (
      <AdminLayout title="Settings">
        <p role="alert" className="text-sm text-terracotta">
          Settings are visible to admins only. Your role does not have access to this page.
        </p>
      </AdminLayout>
    )
  }

  const byKey = data ? settingsByKey(data) : {}

  return (
    <AdminLayout title="Settings">
      <QueryState loading={loading} error={error} />

      {!loading && !error && (
        <div>
          <TabNav tabs={TABS} activeKey={activeTab} onChange={(k) => setActiveTab(k as SettingsTabKey)} />

          <div className={activeTab === 'email_templates' ? 'max-w-3xl pt-6' : 'max-w-xl pt-6'}>
            {activeTab === 'company' && <CompanyTabContainer settings={byKey} />}
            {activeTab === 'smtp' && <SmtpPanel setting={byKey.smtp} />}
            {activeTab === 'email_templates' && <EmailTemplatesPanel />}
            {activeTab === 'sms' && <SmsPanel setting={byKey.sms} />}
            {activeTab === 'integration' && <IntegrationPanel setting={byKey.integration} />}
            {activeTab === 'ai_provider' && <AiProviderPanel setting={byKey.ai_provider} />}
            {activeTab === 'payment_gateway_map' && <PaymentGatewayPanel setting={byKey.payment_gateway_map} />}
            {activeTab === 'seo_defaults' && <SeoDefaultsPanel setting={byKey.seo_defaults} />}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

// ---- shared save-state wrapper -------------------------------------------------

function useSettingSave(key: SettingKey) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function save(value: Record<string, unknown>) {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await updateSetting(key, value)
      setSaved(true)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return { saving, saveError, saved, save }
}

function SaveRow({ saving, saveError, saved }: { saving: boolean; saveError: string | null; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
      {saved && <span className="font-mono-label text-[11px] uppercase text-teal">Saved</span>}
      {saveError && (
        <span role="alert" className="text-sm text-terracotta">
          {saveError}
        </span>
      )}
    </div>
  )
}

// ---- company: sub-tabs (General, Localization — SMS/Integration moved to top-level tabs;
// kept as a sub-tab container since more Company sub-tabs may be added later) -----------

const COMPANY_SUB_TABS = [
  { key: 'general', label: 'General' },
  { key: 'localization', label: 'Localization' },
]

function CompanyTabContainer({ settings }: { settings: Partial<Record<SettingKey, Setting>> }) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'localization'>('general')

  return (
    <div>
      <TabNav tabs={COMPANY_SUB_TABS} activeKey={activeSubTab} onChange={(k) => setActiveSubTab(k as typeof activeSubTab)} />
      <div className="pt-6">
        {activeSubTab === 'general' && <GeneralPanel setting={settings.company} />}
        {activeSubTab === 'localization' && <LocalizationPanel setting={settings.company} />}
      </div>
    </div>
  )
}

// ---- company > general ---------------------------------------------------------------

const DEFAULT_COMPANY: CompanySettings = {
  name: '',
  logo_url: '',
  email: '',
  phone: '',
  business_hours: '',
  timezone: 'UTC',
  logo_path: '',
  favicon_path: '',
  show_logo_on_signin: true,
  accepted_file_formats: 'jpg,jpeg,png,doc,xlsx,txt,pdf,zip,webm',
  rows_per_page: 10,
  rich_text_editor_enabled: true,
  copyright_text: '',
  date_format: 'm-d-Y',
  time_format: '12 am',
  first_day_of_week: 'sunday',
  currency_position: 'left',
}

function GeneralPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as CompanySettings | undefined) ?? DEFAULT_COMPANY
  const [name, setName] = useState(v.name)
  const [logoUrl, setLogoUrl] = useState(v.logo_url)
  const [email, setEmail] = useState(v.email)
  const [phone, setPhone] = useState(v.phone)
  const [businessHours, setBusinessHours] = useState(v.business_hours)
  const [logoPath, setLogoPath] = useState(v.logo_path)
  const [faviconPath, setFaviconPath] = useState(v.favicon_path)
  const [showLogoOnSignin, setShowLogoOnSignin] = useState(v.show_logo_on_signin)
  const [acceptedFormats, setAcceptedFormats] = useState(v.accepted_file_formats)
  const [rowsPerPage, setRowsPerPage] = useState(v.rows_per_page)
  const [richTextEnabled, setRichTextEnabled] = useState(v.rich_text_editor_enabled)
  const [copyrightText, setCopyrightText] = useState(v.copyright_text)
  const { saving, saveError, saved, save } = useSettingSave('company')

  useEffect(() => {
    setName(v.name)
    setLogoUrl(v.logo_url)
    setEmail(v.email)
    setPhone(v.phone)
    setBusinessHours(v.business_hours)
    setLogoPath(v.logo_path)
    setFaviconPath(v.favicon_path)
    setShowLogoOnSignin(v.show_logo_on_signin)
    setAcceptedFormats(v.accepted_file_formats)
    setRowsPerPage(v.rows_per_page)
    setRichTextEnabled(v.rich_text_editor_enabled)
    setCopyrightText(v.copyright_text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        // `updateSetting` overwrites the whole `company` row, so localization
        // fields not shown on this panel are carried through unchanged from
        // the last-loaded value rather than dropped.
        save({
          ...v,
          name,
          logo_url: logoUrl,
          email,
          phone,
          business_hours: businessHours,
          logo_path: logoPath,
          favicon_path: faviconPath,
          show_logo_on_signin: showLogoOnSignin,
          accepted_file_formats: acceptedFormats,
          rows_per_page: rowsPerPage,
          rich_text_editor_enabled: richTextEnabled,
          copyright_text: copyrightText,
        })
      }}
      className="space-y-4"
    >
      <ImageUploadField id="s-company-logo-upload" label="Site Logo" targetSize="175x40" value={logoPath} onChange={setLogoPath} kind="logo" />
      <ImageUploadField id="s-company-favicon-upload" label="Favicon" targetSize="32x32" value={faviconPath} onChange={setFaviconPath} kind="favicon" />
      <YesNoSelect id="s-company-signin-logo" label="Show logo in signin page" value={showLogoOnSignin} onChange={setShowLogoOnSignin} />
      <div>
        <label htmlFor="s-company-accepted-formats" className={labelClasses}>
          Accepted file format
        </label>
        <input
          id="s-company-accepted-formats"
          value={acceptedFormats}
          onChange={(e) => setAcceptedFormats(e.target.value)}
          placeholder="jpg,jpeg,png,doc,xlsx,txt,pdf,zip,webm"
          className={inputClasses}
        />
      </div>
      <Select
        id="s-company-rows-per-page"
        label="Rows per page"
        value={String(rowsPerPage)}
        onChange={(val) => setRowsPerPage(Number(val))}
        options={[10, 25, 50, 100].map((n) => ({ value: String(n), label: String(n) }))}
      />
      <YesNoSelect
        id="s-company-rich-text"
        label="Enable rich text editor in comments/description"
        value={richTextEnabled}
        onChange={setRichTextEnabled}
      />

      <div className="border-t border-ink/10 pt-4" />

      <div>
        <label htmlFor="s-company-name" className={labelClasses}>
          Company name
        </label>
        <input id="s-company-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="s-company-email" className={labelClasses}>
          Contact email
        </label>
        <input id="s-company-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="s-company-phone" className={labelClasses}>
          Contact phone
        </label>
        <input id="s-company-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="s-company-hours" className={labelClasses}>
          Business hours
        </label>
        <input
          id="s-company-hours"
          value={businessHours}
          onChange={(e) => setBusinessHours(e.target.value)}
          placeholder="Mon–Fri, 9am–5pm IST"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="s-company-copyright" className={labelClasses}>
          Copyright text
        </label>
        <input
          id="s-company-copyright"
          value={copyrightText}
          onChange={(e) => setCopyrightText(e.target.value)}
          placeholder="Copyright © 2026 SynergyFirst Digital"
          className={inputClasses}
        />
      </div>
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- company > localization ---------------------------------------------------------------

const TIMEZONE_OPTIONS = (
  typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC']
).map((tz) => ({ value: tz, label: tz }))

const DATE_FORMAT_OPTIONS = [
  { value: 'd-m-Y', label: 'd-m-Y' },
  { value: 'm-d-Y', label: 'm-d-Y' },
  { value: 'Y-m-d', label: 'Y-m-d' },
  { value: 'd/m/Y', label: 'd/m/Y' },
  { value: 'm/d/Y', label: 'm/d/Y' },
  { value: 'Y/m/d', label: 'Y/m/d' },
  { value: 'd.m.Y', label: 'd.m.Y' },
]

const TIME_FORMAT_OPTIONS: { value: CompanySettings['time_format']; label: string }[] = [
  { value: '12 am', label: '12 am' },
  { value: '24 hours', label: '24 hours' },
]

const DAY_OF_WEEK_OPTIONS: { value: CompanySettings['first_day_of_week']; label: string }[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
]

const CURRENCY_POSITION_OPTIONS: { value: CompanySettings['currency_position']; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

function LocalizationPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as CompanySettings | undefined) ?? DEFAULT_COMPANY
  const [timezone, setTimezone] = useState(v.timezone)
  const [dateFormat, setDateFormat] = useState(v.date_format)
  const [timeFormat, setTimeFormat] = useState(v.time_format)
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(v.first_day_of_week)
  const [currencyPosition, setCurrencyPosition] = useState(v.currency_position)
  const { saving, saveError, saved, save } = useSettingSave('company')

  useEffect(() => {
    setTimezone(v.timezone)
    setDateFormat(v.date_format)
    setTimeFormat(v.time_format)
    setFirstDayOfWeek(v.first_day_of_week)
    setCurrencyPosition(v.currency_position)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        // Same full-row-overwrite consideration as GeneralPanel — carry
        // through fields this panel doesn't show.
        save({
          ...v,
          timezone,
          date_format: dateFormat,
          time_format: timeFormat,
          first_day_of_week: firstDayOfWeek,
          currency_position: currencyPosition,
        })
      }}
      className="space-y-4"
    >
      <Select id="s-company-tz" label="Timezone" searchable value={timezone} onChange={setTimezone} options={TIMEZONE_OPTIONS} />
      <Select id="s-company-date-format" label="Date Format" searchable value={dateFormat} onChange={setDateFormat} options={DATE_FORMAT_OPTIONS} />
      <Select
        id="s-company-time-format"
        label="Time Format"
        searchable
        value={timeFormat}
        onChange={(val) => setTimeFormat(val as CompanySettings['time_format'])}
        options={TIME_FORMAT_OPTIONS}
      />
      <Select
        id="s-company-first-day"
        label="First Day of Week"
        searchable
        value={firstDayOfWeek}
        onChange={(val) => setFirstDayOfWeek(val as CompanySettings['first_day_of_week'])}
        options={DAY_OF_WEEK_OPTIONS}
      />
      <Select
        id="s-company-currency-position"
        label="Currency Position"
        searchable
        value={currencyPosition}
        onChange={(val) => setCurrencyPosition(val as CompanySettings['currency_position'])}
        options={CURRENCY_POSITION_OPTIONS}
      />
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- sms ---------------------------------------------------------------

const DEFAULT_SMS: SmsSettings = { account_id: '', api_key: '', secret_key: '', test_send_to: '' }

function SmsPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as SmsSettings | undefined) ?? DEFAULT_SMS
  const [accountId, setAccountId] = useState(v.account_id)
  const [apiKey, setApiKey] = useState(v.api_key)
  const [secretKey, setSecretKey] = useState(v.secret_key)
  const [testSendTo, setTestSendTo] = useState(v.test_send_to)
  const { saving, saveError, saved, save } = useSettingSave('sms')

  useEffect(() => {
    setAccountId(v.account_id)
    setApiKey(v.api_key)
    setSecretKey(v.secret_key)
    setTestSendTo(v.test_send_to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save({ account_id: accountId, api_key: apiKey, secret_key: secretKey, test_send_to: testSendTo })
      }}
      className="space-y-4"
    >
      <div className="rounded-lg bg-ink px-4 py-3 font-mono text-xs leading-relaxed text-cream">
        <p className="mb-2 underline">Example:</p>
        <p className="break-all">
          curl -v --user {'{API key}'}:{'{Secret key}'} "https://api.example.com/v2.1/account/{'{AccountID}'}/action-pushcampaign" \
        </p>
        <p>-H "Content-Type: application/json" \</p>
        <p>-H "Accept: application/json" \</p>
        <p>-d {'{ "Targets": ["Phone Number"], "Message": "Your Message", "Execute": "true" }'}</p>
      </div>

      <p className="text-sm text-ink-soft">{SECRETS_WARNING}</p>

      <div>
        <label htmlFor="s-sms-account-id" className={labelClasses}>
          Account Id
        </label>
        <input id="s-sms-account-id" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClasses} />
      </div>
      <PasswordField id="s-sms-api-key" label="API Key" value={apiKey} onChange={setApiKey} />
      <PasswordField id="s-sms-secret-key" label="Secret Key" value={secretKey} onChange={setSecretKey} />
      <div>
        <label htmlFor="s-sms-test-send" className={labelClasses}>
          Send Test SMS To
        </label>
        <input
          id="s-sms-test-send"
          type="tel"
          value={testSendTo}
          onChange={(e) => setTestSendTo(e.target.value)}
          placeholder="please enter phone number"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-ink-soft">Test-sending isn't wired to a live gateway yet — this field saves the number only.</p>
      </div>
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- integration ---------------------------------------------------------------

const INTEGRATION_SUB_TABS = [
  { key: 'recaptcha', label: 'reCAPTCHA' },
  { key: 'google_drive', label: 'Google Drive' },
  { key: 'github', label: 'GitHub' },
]

const DEFAULT_INTEGRATION: IntegrationSettings = {
  recaptcha: { site_key: '', secret_key: '' },
  google_drive: { enabled: false, client_id: '', client_secret: '' },
  github: { enabled: false, webhook_token: '' },
}

function IntegrationPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as IntegrationSettings | undefined) ?? DEFAULT_INTEGRATION
  const [activeInner, setActiveInner] = useState<'recaptcha' | 'google_drive' | 'github'>('recaptcha')

  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState(v.recaptcha.site_key)
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState(v.recaptcha.secret_key)
  const [driveEnabled, setDriveEnabled] = useState(v.google_drive.enabled)
  const [driveClientId, setDriveClientId] = useState(v.google_drive.client_id)
  const [driveClientSecret, setDriveClientSecret] = useState(v.google_drive.client_secret)
  const [githubEnabled, setGithubEnabled] = useState(v.github.enabled)
  const [webhookToken, setWebhookToken] = useState(v.github.webhook_token)
  const [driveTokenRow, setDriveTokenRow] = useState<IntegrationToken | null | undefined>(undefined)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const { saving, saveError, saved, save } = useSettingSave('integration')

  useEffect(() => {
    setRecaptchaSiteKey(v.recaptcha.site_key)
    setRecaptchaSecretKey(v.recaptcha.secret_key)
    setDriveEnabled(v.google_drive.enabled)
    setDriveClientId(v.google_drive.client_id)
    setDriveClientSecret(v.google_drive.client_secret)
    setGithubEnabled(v.github.enabled)
    setWebhookToken(v.github.webhook_token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('integration_tokens')
      .select('id, provider, expires_at, updated_at')
      .eq('provider', 'google_drive')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setDriveTokenRow((data as IntegrationToken | null) ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isDriveAuthorized = !!driveTokenRow && (!driveTokenRow.expires_at || new Date(driveTokenRow.expires_at) > new Date())

  async function handleConnectDrive() {
    setConnecting(true)
    setConnectError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const { data, error } = await supabase.functions.invoke('google-drive-oauth-start', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (error) throw error
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener')
      } else {
        setConnectError(data?.error ?? 'Could not start Google Drive connection.')
      }
    } catch {
      setConnectError('Could not start Google Drive connection. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  function regenerateWebhookToken() {
    setWebhookToken(crypto.randomUUID().replace(/-/g, ''))
  }

  const functionsBase = import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : ''
  const redirectUri = `${window.location.origin}/google-drive-oauth-callback`
  const webhookListenerLink = webhookToken ? `${functionsBase}/github-webhook/${webhookToken}` : ''

  return (
    <div className="space-y-4">
      <TabNav tabs={INTEGRATION_SUB_TABS} activeKey={activeInner} onChange={(k) => setActiveInner(k as typeof activeInner)} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save({
            recaptcha: { site_key: recaptchaSiteKey, secret_key: recaptchaSecretKey },
            google_drive: { enabled: driveEnabled, client_id: driveClientId, client_secret: driveClientSecret },
            github: { enabled: githubEnabled, webhook_token: webhookToken },
          })
        }}
        className="space-y-4 pt-4"
      >
        {activeInner === 'recaptcha' && (
          <>
            <p className="text-sm text-ink-soft">{SECRETS_WARNING}</p>
            <div>
              <label htmlFor="s-recaptcha-site" className={labelClasses}>
                Site key
              </label>
              <input
                id="s-recaptcha-site"
                value={recaptchaSiteKey}
                onChange={(e) => setRecaptchaSiteKey(e.target.value)}
                className={inputClasses}
              />
            </div>
            <PasswordField id="s-recaptcha-secret" label="Secret key" value={recaptchaSecretKey} onChange={setRecaptchaSecretKey} />
            <p className="text-sm text-ink-soft">
              Before you logout, please open a new browser and make sure the reCAPTCHA is working.
            </p>
          </>
        )}

        {activeInner === 'google_drive' && (
          <>
            <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
              <input type="checkbox" checked={driveEnabled} onChange={(e) => setDriveEnabled(e.target.checked)} className="accent-teal" />
              Enable Google Drive API to upload file
            </label>
            {driveEnabled && (
              <p className="text-sm text-terracotta">From now on, all files will be uploaded into Google Drive.</p>
            )}
            <p className="text-sm text-ink-soft">{SECRETS_WARNING}</p>
            <div>
              <label htmlFor="s-drive-client-id" className={labelClasses}>
                Client ID
              </label>
              <input
                id="s-drive-client-id"
                value={driveClientId}
                onChange={(e) => setDriveClientId(e.target.value)}
                className={inputClasses}
              />
            </div>
            <PasswordField id="s-drive-client-secret" label="Client secret" value={driveClientSecret} onChange={setDriveClientSecret} />
            <div>
              <label htmlFor="s-drive-redirect" className={labelClasses}>
                Remember to add this url in Authorized redirect uri
              </label>
              <input id="s-drive-redirect" readOnly value={redirectUri} className={`${inputClasses} bg-sage/40`} />
            </div>
            <div>
              <span className={labelClasses}>Status</span>
              <div className="mt-1.5">
                {driveTokenRow === undefined ? (
                  <span className="font-mono-label text-[11px] uppercase text-ink-soft">Checking…</span>
                ) : (
                  <span
                    className={`font-mono-label inline-block rounded-full px-3 py-1 text-[11px] uppercase ${
                      isDriveAuthorized ? 'bg-teal text-cream' : 'bg-ink-soft/15 text-ink-soft'
                    }`}
                  >
                    {isDriveAuthorized ? 'Authorized' : 'Not authorized'}
                  </span>
                )}
              </div>
            </div>
            <Button type="button" variant="secondary" disabled={connecting || !driveClientId || !driveClientSecret} onClick={handleConnectDrive}>
              {connecting ? 'Connecting…' : 'Connect Google Drive'}
            </Button>
            {(!driveClientId || !driveClientSecret) && (
              <p className="text-xs text-ink-soft">Save a Client ID and Client secret before connecting.</p>
            )}
            {connectError && (
              <p role="alert" className="text-sm text-terracotta">
                {connectError}
              </p>
            )}
          </>
        )}

        {activeInner === 'github' && (
          <>
            <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
              <input type="checkbox" checked={githubEnabled} onChange={(e) => setGithubEnabled(e.target.checked)} className="accent-teal" />
              Enable GitHub commit logs in tasks
            </label>
            <div className="rounded-lg bg-ink px-4 py-3 font-mono text-xs leading-relaxed text-cream">
              Add webhook in your repository: Settings → Webhooks → Add webhook, paste the listener link below as the
              Payload URL, content type application/json, and set the secret to match this integration's token.
            </div>
            <div>
              <label htmlFor="s-github-webhook-link" className={labelClasses}>
                Webhook listener link
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input id="s-github-webhook-link" readOnly value={webhookListenerLink} className={`${inputClasses} mt-0 bg-sage/40`} />
                <button
                  type="button"
                  onClick={regenerateWebhookToken}
                  title="Regenerate token (persisted on Save)"
                  className="rounded-lg border border-ink/15 p-2.5 text-ink-soft hover:text-ink"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Regenerating breaks any GitHub webhook already configured with the previous token — update the
                repository's webhook secret after saving.
              </p>
            </div>
            <p className="text-sm text-terracotta">
              To link commits with tasks, add a # and task ID at the end of each commit message. Ex: This is a commit
              of Task #10.
            </p>
          </>
        )}

        <SaveRow saving={saving} saveError={saveError} saved={saved} />
      </form>
    </div>
  )
}

// ---- smtp (extended: protocol/from-email/user/password/security type/test send) --------

const DEFAULT_SMTP: SmtpSettings = {
  host: '',
  port: 587,
  from_address: '',
  from_name: '',
  protocol: 'smtp',
  from_email: '',
  user: '',
  password: '',
  security_type: 'tls',
  test_send_to: '',
}

function SmtpPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as SmtpSettings | undefined) ?? DEFAULT_SMTP
  const [protocol, setProtocol] = useState(v.protocol)
  const [fromName, setFromName] = useState(v.from_name)
  const [fromEmail, setFromEmail] = useState(v.from_email || v.from_address)
  const [host, setHost] = useState(v.host)
  const [user, setUser] = useState(v.user)
  const [password, setPassword] = useState(v.password)
  const [port, setPort] = useState(v.port)
  const [securityType, setSecurityType] = useState(v.security_type)
  const [testSendTo, setTestSendTo] = useState(v.test_send_to)
  const { saving, saveError, saved, save } = useSettingSave('smtp')
  const [sendingTest, setSendingTest] = useState(false)
  const [testSendResult, setTestSendResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    setProtocol(v.protocol)
    setFromName(v.from_name)
    setFromEmail(v.from_email || v.from_address)
    setHost(v.host)
    setUser(v.user)
    setPassword(v.password)
    setPort(v.port)
    setSecurityType(v.security_type)
    setTestSendTo(v.test_send_to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  async function handleSendTestEmail() {
    if (!testSendTo) {
      setTestSendResult({ ok: false, message: 'Enter a recipient email address first.' })
      return
    }
    setSendingTest(true)
    setTestSendResult(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { to: testSendTo },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (error) {
        // supabase.functions.invoke() puts a non-2xx response in `error`
        // (as a FunctionsHttpError) rather than `data` — the actual error
        // message from the function body is still readable via its
        // Response object, otherwise the admin only ever sees a generic
        // "failed" message with no way to diagnose a real SMTP problem.
        let message = error.message
        if ('context' in error && error.context instanceof Response) {
          try {
            const body = await error.context.clone().json()
            if (body?.error) message = body.error
          } catch {
            // response body wasn't JSON — fall back to error.message
          }
        }
        setTestSendResult({ ok: false, message })
      } else if (data?.sent) {
        setTestSendResult({ ok: true, message: `Test email sent to ${testSendTo}.` })
      } else {
        setTestSendResult({ ok: false, message: data?.error ?? 'Failed to send test email.' })
      }
    } catch {
      setTestSendResult({ ok: false, message: 'Failed to send test email. Please try again.' })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save({
          host,
          port,
          from_address: fromEmail,
          from_name: fromName,
          protocol,
          from_email: fromEmail,
          user,
          password,
          security_type: securityType,
          test_send_to: testSendTo,
        })
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-soft">{SECRETS_WARNING}</p>
      <Select
        id="s-smtp-protocol"
        label="Email protocol"
        value={protocol}
        onChange={setProtocol}
        options={[{ value: 'smtp', label: 'SMTP' }]}
      />
      <div>
        <label htmlFor="s-smtp-from-name" className={labelClasses}>
          Email sent from name
        </label>
        <input id="s-smtp-from-name" value={fromName} onChange={(e) => setFromName(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="s-smtp-from-email" className={labelClasses}>
          Email sent from email
        </label>
        <input
          id="s-smtp-from-email"
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="s-smtp-host" className={labelClasses}>
          SMTP Host
        </label>
        <input id="s-smtp-host" value={host} onChange={(e) => setHost(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="s-smtp-user" className={labelClasses}>
          SMTP User
        </label>
        <input id="s-smtp-user" value={user} onChange={(e) => setUser(e.target.value)} className={inputClasses} />
      </div>
      <PasswordField id="s-smtp-password" label="SMTP Password" value={password} onChange={setPassword} />
      <div>
        <label htmlFor="s-smtp-port" className={labelClasses}>
          SMTP Port
        </label>
        <input
          id="s-smtp-port"
          type="number"
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
          className={inputClasses}
        />
      </div>
      <Select
        id="s-smtp-security"
        label="Security Type"
        value={securityType}
        onChange={(val) => setSecurityType(val as SmtpSettings['security_type'])}
        options={[
          { value: 'tls', label: 'TLS' },
          { value: 'ssl', label: 'SSL' },
          { value: 'none', label: 'None' },
        ]}
      />
      <div>
        <label htmlFor="s-smtp-test-send" className={`${labelClasses} flex items-center gap-1`}>
          Send a test mail to
          <span
            title="Sends a real test email through the SMTP config above. Save your changes first so the test uses the latest values."
            className="cursor-help text-ink-soft/70"
          >
            ⓘ
          </span>
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="s-smtp-test-send"
            type="email"
            value={testSendTo}
            onChange={(e) => setTestSendTo(e.target.value)}
            placeholder="youremail@address.com"
            className={`${inputClasses} mt-0 flex-1`}
          />
          <Button type="button" variant="secondary" disabled={sendingTest || !testSendTo} onClick={handleSendTestEmail}>
            {sendingTest ? 'Sending…' : 'Send test email'}
          </Button>
        </div>
        {testSendResult && (
          <p role={testSendResult.ok ? undefined : 'alert'} className={`mt-1.5 text-sm ${testSendResult.ok ? 'text-teal' : 'text-terracotta'}`}>
            {testSendResult.message}
          </p>
        )}
      </div>
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- ai provider ---------------------------------------------------------------

function AiProviderPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as AiProviderSettings | undefined) ?? { active: 'gemini', fallback: null, tone_prompt: '' }
  const [active, setActive] = useState(v.active)
  const [fallback, setFallback] = useState<AiProviderSettings['fallback']>(v.fallback)
  const [tonePrompt, setTonePrompt] = useState(v.tone_prompt)
  const [geminiKey, setGeminiKey] = useState(v.gemini_api_key ?? '')
  const [openaiKey, setOpenaiKey] = useState(v.openai_api_key ?? '')
  const [anthropicKey, setAnthropicKey] = useState(v.anthropic_api_key ?? '')
  const { saving, saveError, saved, save } = useSettingSave('ai_provider')

  useEffect(() => {
    setActive(v.active)
    setFallback(v.fallback)
    setTonePrompt(v.tone_prompt)
    setGeminiKey(v.gemini_api_key ?? '')
    setOpenaiKey(v.openai_api_key ?? '')
    setAnthropicKey(v.anthropic_api_key ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save({
          active,
          fallback,
          tone_prompt: tonePrompt,
          gemini_api_key: geminiKey,
          openai_api_key: openaiKey,
          anthropic_api_key: anthropicKey,
        })
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-soft">
        This selects which configured provider the site chatbot and the Website Prompt Generator dispatch to, with an
        optional fallback if the active provider errors.
      </p>
      <Select
        id="s-ai-active"
        label="Active provider"
        value={active}
        onChange={(val) => setActive(val as AiProviderSettings['active'])}
        options={[
          { value: 'gemini', label: 'Gemini' },
          { value: 'openai', label: 'OpenAI' },
          { value: 'claude', label: 'Claude' },
        ]}
      />
      <Select
        id="s-ai-fallback"
        label="Fallback provider"
        value={fallback ?? ''}
        onChange={(val) => setFallback((val || null) as AiProviderSettings['fallback'])}
        options={[
          { value: '', label: 'None' },
          { value: 'gemini', label: 'Gemini' },
          { value: 'openai', label: 'OpenAI' },
          { value: 'claude', label: 'Claude' },
        ]}
      />
      <div>
        <label htmlFor="s-ai-tone" className={labelClasses}>
          Chatbot tone / prompt
        </label>
        <textarea
          id="s-ai-tone"
          rows={4}
          value={tonePrompt}
          onChange={(e) => setTonePrompt(e.target.value)}
          placeholder="e.g. Friendly, concise, healthcare-industry aware. Escalate anything about pricing to a human."
          className={inputClasses}
        />
      </div>

      <div className="border-t border-ink/10 pt-4">
        <p className="text-sm text-ink-soft">{SECRETS_WARNING}</p>
        <p className="mt-2 text-xs text-ink-soft">
          API keys below are used by the Website Prompt Generator's edge function. A server-side environment variable
          (<code>GEMINI_API_KEY</code>/<code>OPENAI_API_KEY</code>/<code>ANTHROPIC_API_KEY</code>) takes precedence
          over the value stored here if both are set. Only the key for whichever provider is Active (or Fallback)
          above needs to be filled in.
        </p>
        <div className="mt-4 space-y-4">
          <PasswordField id="s-ai-gemini-key" label="Gemini API Key" value={geminiKey} onChange={setGeminiKey} />
          <PasswordField id="s-ai-openai-key" label="OpenAI API Key" value={openaiKey} onChange={setOpenaiKey} />
          <PasswordField
            id="s-ai-anthropic-key"
            label="Anthropic (Claude) API Key"
            value={anthropicKey}
            onChange={setAnthropicKey}
          />
        </div>
      </div>

      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- payment gateway routing ---------------------------------------------------------------

function PaymentGatewayPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as PaymentGatewayMapSettings | undefined) ?? { INR: 'razorpay', USD: 'stripe' }
  const [inrGateway, setInrGateway] = useState(v.INR)
  const [usdGateway, setUsdGateway] = useState(v.USD)
  const { saving, saveError, saved, save } = useSettingSave('payment_gateway_map')

  useEffect(() => {
    setInrGateway(v.INR)
    setUsdGateway(v.USD)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save({ INR: inrGateway, USD: usdGateway })
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-soft">
        Razorpay and Stripe API keys live in server-side environment variables. This controls which gateway{' '}
        <code>processPayment</code> routes to per currency — checkout code never branches on gateway directly.
      </p>
      <Select
        id="s-pay-inr"
        label="INR gateway"
        value={inrGateway}
        onChange={setInrGateway}
        options={[
          { value: 'razorpay', label: 'Razorpay' },
          { value: 'stripe', label: 'Stripe' },
        ]}
      />
      <Select
        id="s-pay-usd"
        label="USD gateway"
        value={usdGateway}
        onChange={setUsdGateway}
        options={[
          { value: 'razorpay', label: 'Razorpay' },
          { value: 'stripe', label: 'Stripe' },
        ]}
      />
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

// ---- seo defaults ---------------------------------------------------------------

function SeoDefaultsPanel({ setting }: { setting?: Setting }) {
  const v = (setting?.value as SeoDefaultsSettings | undefined) ?? {
    default_title: '',
    default_description: '',
    sitemap_enabled: true,
  }
  const [defaultTitle, setDefaultTitle] = useState(v.default_title)
  const [defaultDescription, setDefaultDescription] = useState(v.default_description)
  const [sitemapEnabled, setSitemapEnabled] = useState(v.sitemap_enabled)
  const { saving, saveError, saved, save } = useSettingSave('seo_defaults')

  useEffect(() => {
    setDefaultTitle(v.default_title)
    setDefaultDescription(v.default_description)
    setSitemapEnabled(v.sitemap_enabled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save({ default_title: defaultTitle, default_description: defaultDescription, sitemap_enabled: sitemapEnabled })
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-soft">
        Fallback meta used when a page has no per-page override. Per-page overrides are not built yet — this is the
        sitewide default only.
      </p>
      <div>
        <label htmlFor="s-seo-title" className={labelClasses}>
          Default meta title
        </label>
        <input
          id="s-seo-title"
          value={defaultTitle}
          onChange={(e) => setDefaultTitle(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="s-seo-description" className={labelClasses}>
          Default meta description
        </label>
        <textarea
          id="s-seo-description"
          rows={3}
          value={defaultDescription}
          onChange={(e) => setDefaultDescription(e.target.value)}
          className={inputClasses}
        />
      </div>
      <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
        <input type="checkbox" checked={sitemapEnabled} onChange={(e) => setSitemapEnabled(e.target.checked)} className="accent-teal" />
        Sitemap enabled
      </label>
      <SaveRow saving={saving} saveError={saveError} saved={saved} />
    </form>
  )
}

export default AdminSettingsPage

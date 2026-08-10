import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { inputClasses, labelClasses } from '../ui/Input'
import QueryState from '../ui/QueryState'
import { useFetch } from '../../hooks/useFetch'
import { fetchEmailTemplates, fetchEmailTriggerLog, updateEmailTemplate } from '../../lib/supabase/adminEmailQueries'
import type { EmailTemplate, EmailTriggerKey } from '../../lib/supabase/types'

const TRIGGER_LABELS: Record<EmailTriggerKey, string> = {
  new_lead_welcome: 'New lead → welcome',
  booking_confirmed: 'Booking confirmed',
  booking_reminder_24h: 'Booking reminder (24h before)',
  lead_followup_nudge: 'Lead follow-up nudge (3 days, no response)',
  ticket_resolved_checkin: 'Ticket resolved → check-in',
  project_completed_whatsapp_intro: 'Project completed → WhatsApp Business API intro',
}

const TRIGGER_DESCRIPTIONS: Record<EmailTriggerKey, string> = {
  new_lead_welcome: 'Sent immediately when a contact/inquiry/quote form is submitted.',
  booking_confirmed: 'Sent immediately when a booking is created through the public booking widget.',
  booking_reminder_24h: 'Sent by the scheduled sweep, ~24h before a confirmed booking.',
  lead_followup_nudge: 'Sent by the scheduled sweep to leads still in "New" status 3+ days after creation.',
  ticket_resolved_checkin: 'Sent immediately when staff mark a ticket "Resolved" (requires the customer to have an account).',
  project_completed_whatsapp_intro:
    'Sent by the scheduled sweep once a booking\'s Project Status is set to "completed" — deliberately separate from the new-lead sequence per this project\'s WhatsApp upsell sequencing rule.',
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/**
 * Template editor for the 6 automated email sequences (docs/09), living in
 * Settings > Email Templates per docs/06. Templates are fixed rows (seeded
 * in migration 0008, never created/deleted here) — this only edits
 * subject/body_html/is_active, plus a read-only recent-sends log for
 * auditing what actually went out (email_trigger_log).
 */
function EmailTemplatesPanel() {
  const { data: templates, loading, error } = useFetch(fetchEmailTemplates, [])
  const { data: log, loading: logLoading } = useFetch(() => fetchEmailTriggerLog(20), [])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg text-ink">Automated sequences</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Editable subject + body for each trigger. Merge fields (e.g. <code>{'{{name}}'}</code>) are substituted
          when an email is sent — unknown fields are left as-is rather than causing a send failure.
        </p>
      </div>

      <QueryState loading={loading} error={error} />

      {!loading && !error && templates && (
        <div className="space-y-3">
          {templates.map((t) => (
            <TemplateRow
              key={t.id}
              template={t}
              expanded={expandedId === t.id}
              onToggle={() => setExpandedId((prev) => (prev === t.id ? null : t.id))}
            />
          ))}
        </div>
      )}

      <div>
        <h3 className="font-display text-base text-ink">Recent sends</h3>
        <QueryState loading={logLoading} error={null} empty={!logLoading && (log?.length ?? 0) === 0} emptyMessage="No emails sent yet." />
        {!logLoading && log && log.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                  <th className="px-3 py-2">Trigger</th>
                  <th className="px-3 py-2">To</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry) => (
                  <tr key={entry.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-3 py-2 text-ink-soft">{TRIGGER_LABELS[entry.trigger_key as EmailTriggerKey] ?? entry.trigger_key}</td>
                    <td className="px-3 py-2 text-ink-soft">{entry.recipient_email}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`font-mono-label rounded-full border px-2 py-0.5 text-[9px] uppercase ${
                          entry.status === 'sent' ? 'border-teal/40 text-teal' : 'border-terracotta/40 text-terracotta'
                        }`}
                        title={entry.error_message ?? undefined}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-soft">{formatDateTime(entry.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateRow({ template, expanded, onToggle }: { template: EmailTemplate; expanded: boolean; onToggle: () => void }) {
  const [subject, setSubject] = useState(template.subject)
  const [bodyHtml, setBodyHtml] = useState(template.body_html)
  const [isActive, setIsActive] = useState(template.is_active)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSubject(template.subject)
    setBodyHtml(template.body_html)
    setIsActive(template.is_active)
  }, [template])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await updateEmailTemplate(template.id, { subject, body_html: bodyHtml, is_active: isActive })
      setSaved(true)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const label = TRIGGER_LABELS[template.trigger_key] ?? template.trigger_key

  return (
    <div className="rounded-xl border border-ink/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm text-ink">{label}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{TRIGGER_DESCRIPTIONS[template.trigger_key]}</p>
        </div>
        <span
          className={`font-mono-label shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase ${
            template.is_active ? 'border-teal/40 text-teal' : 'border-ink/15 text-ink-soft'
          }`}
        >
          {template.is_active ? 'Active' : 'Inactive'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-ink/10 px-4 py-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-teal" />
            Active
          </label>

          <div>
            <label htmlFor={`tpl-subject-${template.id}`} className={labelClasses}>
              Subject
            </label>
            <input id={`tpl-subject-${template.id}`} value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor={`tpl-body-${template.id}`} className={labelClasses}>
              Body (HTML)
            </label>
            <textarea
              id={`tpl-body-${template.id}`}
              rows={8}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className={`${inputClasses} font-mono text-xs`}
            />
            {template.merge_fields.length > 0 && (
              <p className="mt-1.5 text-xs text-ink-soft">
                Available merge fields:{' '}
                {template.merge_fields.map((f) => (
                  <code key={f} className="mr-1 rounded bg-sage/50 px-1 py-0.5">{`{{${f}}}`}</code>
                ))}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saveError && (
              <p role="alert" className="text-sm text-terracotta">
                {saveError}
              </p>
            )}
            {saved && !saveError && <p className="text-sm text-teal">Saved.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplatesPanel

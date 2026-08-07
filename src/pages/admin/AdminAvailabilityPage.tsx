import { useState, type FormEvent } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices } from '../../lib/supabase/queries'
import {
  fetchAvailabilityRules,
  createAvailabilityRule,
  updateAvailabilityRule,
  deleteAvailabilityRule,
  fetchBlackoutDates,
  createBlackoutDate,
  deleteBlackoutDate,
} from '../../lib/supabase/adminBookingQueries'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const IST_OFFSET_MINUTES = 5 * 60 + 30

/**
 * availability_rules.start_time/end_time are stored in UTC (the whole
 * booking system does — see docs/logs.md's IST conversion entry), but staff
 * think and enter hours in IST. Converts an "HH:MM" IST input to "HH:MM:00"
 * UTC for storage, and back for display. Same-day wraparound only (a shift
 * crossing midnight IST would need day_of_week to shift too, which none of
 * this business's actual hours do — not handled here).
 */
function istToUtcTimeString(istHHMM: string): string {
  const [h, m] = istHHMM.split(':').map(Number)
  const totalMinutes = (h * 60 + m - IST_OFFSET_MINUTES + 1440) % 1440
  const utcH = Math.floor(totalMinutes / 60)
  const utcM = totalMinutes % 60
  return `${String(utcH).padStart(2, '0')}:${String(utcM).padStart(2, '0')}:00`
}

function utcToIstTimeString(utcHHMMSS: string): string {
  const [h, m] = utcHHMMSS.split(':').map(Number)
  const totalMinutes = (h * 60 + m + IST_OFFSET_MINUTES) % 1440
  const istH = Math.floor(totalMinutes / 60)
  const istM = totalMinutes % 60
  return `${String(istH).padStart(2, '0')}:${String(istM).padStart(2, '0')}`
}

function AdminAvailabilityPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: services } = useFetch(fetchPublishedServices, [])
  const { data: rules, loading: rulesLoading, error: rulesError } = useFetch(fetchAvailabilityRules, [refreshKey])
  const {
    data: blackouts,
    loading: blackoutsLoading,
    error: blackoutsError,
  } = useFetch(fetchBlackoutDates, [refreshKey])

  const [newServiceId, setNewServiceId] = useState('')
  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('17:00')
  const [newBuffer, setNewBuffer] = useState(15)
  const [ruleError, setRuleError] = useState<string | null>(null)
  const [ruleSaving, setRuleSaving] = useState(false)

  const [blackoutDate, setBlackoutDate] = useState('')
  const [blackoutReason, setBlackoutReason] = useState('')
  const [blackoutError, setBlackoutError] = useState<string | null>(null)
  const [blackoutSaving, setBlackoutSaving] = useState(false)

  function refresh() {
    setRefreshKey((k) => k + 1)
  }

  async function handleAddRule(e: FormEvent) {
    e.preventDefault()
    if (!newServiceId) {
      setRuleError('Select a service.')
      return
    }
    setRuleSaving(true)
    setRuleError(null)
    try {
      await createAvailabilityRule({
        serviceId: newServiceId,
        dayOfWeek: newDay,
        startTime: istToUtcTimeString(newStart),
        endTime: istToUtcTimeString(newEnd),
        bufferMinutes: newBuffer,
      })
      refresh()
    } catch {
      setRuleError('Failed to add rule. Please try again.')
    } finally {
      setRuleSaving(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateAvailabilityRule(id, { isActive: !isActive })
      refresh()
    } catch {
      setRuleError('Failed to update rule. Please try again.')
    }
  }

  async function handleDeleteRule(id: string) {
    try {
      await deleteAvailabilityRule(id)
      refresh()
    } catch {
      setRuleError('Failed to delete rule. Please try again.')
    }
  }

  async function handleAddBlackout(e: FormEvent) {
    e.preventDefault()
    if (!blackoutDate) return
    setBlackoutSaving(true)
    setBlackoutError(null)
    try {
      await createBlackoutDate(blackoutDate, blackoutReason || undefined)
      setBlackoutDate('')
      setBlackoutReason('')
      refresh()
    } catch {
      setBlackoutError('Failed to add blackout date. Please try again.')
    } finally {
      setBlackoutSaving(false)
    }
  }

  async function handleDeleteBlackout(id: string) {
    try {
      await deleteBlackoutDate(id)
      refresh()
    } catch {
      setBlackoutError('Failed to remove blackout date. Please try again.')
    }
  }

  return (
    <AdminLayout title="Availability">
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg text-ink">Weekly hours</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Recurring working-hours windows per service. Team-wide (no specific practitioner) —
            per-practitioner rules aren't editable here yet.
          </p>

          <form onSubmit={handleAddRule} className="mt-4 space-y-3 rounded-xl border border-ink/10 p-4">
            <div>
              <Select
                id="rule-service"
                label="Service"
                value={newServiceId}
                onChange={setNewServiceId}
                placeholder="Select a service"
                options={(services ?? []).filter((s) => s.is_bookable).map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Select
                  id="rule-day"
                  label="Day"
                  value={String(newDay)}
                  onChange={(v) => setNewDay(Number(v))}
                  options={DAY_LABELS.map((label, i) => ({ value: String(i), label }))}
                />
              </div>
              <div>
                <label htmlFor="rule-buffer" className={labelClasses}>
                  Buffer (minutes)
                </label>
                <input
                  id="rule-buffer"
                  type="number"
                  min={0}
                  step={5}
                  value={newBuffer}
                  onChange={(e) => setNewBuffer(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rule-start" className={labelClasses}>
                  Start (IST)
                </label>
                <input
                  id="rule-start"
                  type="time"
                  required
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="rule-end" className={labelClasses}>
                  End (IST)
                </label>
                <input
                  id="rule-end"
                  type="time"
                  required
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {ruleError && (
              <p role="alert" className="text-sm text-terracotta">
                {ruleError}
              </p>
            )}

            <Button type="submit" size="md" disabled={ruleSaving}>
              {ruleSaving ? 'Adding…' : 'Add rule'}
            </Button>
          </form>

          <div className="mt-4">
            <QueryState
              loading={rulesLoading}
              error={rulesError}
              empty={!rulesLoading && !rulesError && (rules?.length ?? 0) === 0}
              emptyMessage="No availability rules configured yet."
            />
            {!rulesLoading && !rulesError && rules && rules.length > 0 && (
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule.id}
                    className={`flex items-center justify-between rounded-lg border border-ink/10 p-3 text-sm ${rule.is_active ? '' : 'opacity-50'}`}
                  >
                    <div>
                      <p className="text-ink">
                        {rule.service?.name ?? 'Unknown service'} — {DAY_LABELS[rule.day_of_week]}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {utcToIstTimeString(rule.start_time)}–{utcToIstTimeString(rule.end_time)} IST ·{' '}
                        {rule.buffer_minutes}min buffer
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rule.id, rule.is_active)}
                        className="font-mono-label text-[10px] uppercase text-teal underline"
                      >
                        {rule.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="font-mono-label text-[10px] uppercase text-terracotta underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Blackout dates</h2>
          <p className="mt-1 text-sm text-ink-soft">Team-wide days unavailable regardless of weekly hours.</p>

          <form onSubmit={handleAddBlackout} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 p-4">
            <div>
              <label htmlFor="blackout-date" className={labelClasses}>
                Date
              </label>
              <input
                id="blackout-date"
                type="date"
                required
                value={blackoutDate}
                onChange={(e) => setBlackoutDate(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="blackout-reason" className={labelClasses}>
                Reason (optional)
              </label>
              <input
                id="blackout-reason"
                type="text"
                value={blackoutReason}
                onChange={(e) => setBlackoutReason(e.target.value)}
                className={inputClasses}
              />
            </div>
            <Button type="submit" size="md" disabled={blackoutSaving}>
              {blackoutSaving ? 'Adding…' : 'Add'}
            </Button>
          </form>

          {blackoutError && (
            <p role="alert" className="mt-2 text-sm text-terracotta">
              {blackoutError}
            </p>
          )}

          <div className="mt-4">
            <QueryState
              loading={blackoutsLoading}
              error={blackoutsError}
              empty={!blackoutsLoading && !blackoutsError && (blackouts?.length ?? 0) === 0}
              emptyMessage="No blackout dates configured."
            />
            {!blackoutsLoading && !blackoutsError && blackouts && blackouts.length > 0 && (
              <ul className="space-y-2">
                {blackouts.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-lg border border-ink/10 p-3 text-sm">
                    <div>
                      <p className="text-ink">{new Date(`${b.date}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      {b.reason && <p className="text-xs text-ink-soft">{b.reason}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlackout(b.id)}
                      className="font-mono-label text-[10px] uppercase text-terracotta underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminAvailabilityPage

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Select } from '../../components/ui/Select'
import { useFetch } from '../../hooks/useFetch'
import { fetchBookings } from '../../lib/supabase/adminBookingQueries'
import { BOOKING_STATUSES, type Booking, type BookingStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rescheduled: 'Rescheduled',
  canceled: 'Canceled',
  completed: 'Completed',
  no_show: 'No-show',
}

type RangeFilter = 'day' | 'week' | 'month' | 'all'

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function isWithinRange(iso: string, range: RangeFilter, referenceDate: Date): boolean {
  if (range === 'all') return true
  const d = new Date(iso)
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)

  if (range === 'day') end.setDate(end.getDate() + 1)
  else if (range === 'week') end.setDate(end.getDate() + 7)
  else end.setMonth(end.getMonth() + 1)

  return d >= start && d < end
}

function groupByDate(bookings: Booking[]): Map<string, Booking[]> {
  const grouped = new Map<string, Booking[]>()
  for (const b of bookings) {
    const key = new Date(b.starts_at).toDateString()
    const existing = grouped.get(key) ?? []
    existing.push(b)
    grouped.set(key, existing)
  }
  return grouped
}

function AdminBookingsPage() {
  const { data: bookings, loading, error } = useFetch(fetchBookings, [])
  const [range, setRange] = useState<RangeFilter>('week')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [showTestData, setShowTestData] = useState(false)

  const referenceDate = useMemo(() => new Date(), [])

  const filtered = useMemo(() => {
    return (bookings ?? []).filter((b) => {
      if (!showTestData && b.is_test) return false
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (!isWithinRange(b.starts_at, range, referenceDate)) return false
      return true
    })
  }, [bookings, range, statusFilter, showTestData, referenceDate])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])
  const sortedDateKeys = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [grouped],
  )

  return (
    <AdminLayout title="Bookings">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-ink/15 p-1">
          {(['day', 'week', 'month', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`font-mono-label rounded-full px-3 py-1.5 text-[11px] uppercase transition-colors ${range === r ? 'bg-ink text-cream' : 'text-ink-soft'}`}
            >
              {r}
            </button>
          ))}
        </div>

        <Select
          id="booking-status-filter"
          ariaLabel="Filter by status"
          size="compact"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as BookingStatus | 'all')}
          options={[{ value: 'all', label: 'All statuses' }, ...BOOKING_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
        />

        <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
          <input
            type="checkbox"
            checked={showTestData}
            onChange={(e) => setShowTestData(e.target.checked)}
            className="accent-teal"
          />
          Show test data
        </label>

        <Link
          to="/admin/bookings/new"
          className="font-mono-label ml-auto rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
        >
          New booking
        </Link>
      </div>

      <div className="mt-4">
        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && sortedDateKeys.length === 0}
          emptyMessage="No bookings in this range."
        />

        {!loading && !error && sortedDateKeys.length > 0 && (
          <div className="space-y-6">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                <p className="font-mono-label text-[10px] uppercase text-ink-soft">
                  {formatDateLabel(new Date(dateKey))}
                </p>
                <div className="mt-2 overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {grouped.get(dateKey)!.map((b) => (
                        <tr key={b.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                          <td className="w-24 px-4 py-3 text-ink-soft">{formatTimeLabel(b.starts_at)}</td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/bookings/${b.id}`}
                              className="text-ink underline decoration-ink/20 hover:decoration-teal"
                            >
                              {b.client_full_name}
                            </Link>
                            {b.is_test && (
                              <span className="font-mono-label ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] uppercase text-gold">
                                Test
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-ink-soft">{b.service?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-ink-soft">{b.client_phone}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono-label rounded-full border border-ink/15 px-2.5 py-1 text-[10px] uppercase text-ink-soft">
                              {STATUS_LABELS[b.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminBookingsPage

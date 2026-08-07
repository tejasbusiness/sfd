import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Select } from '../../components/ui/Select'
import { useFetch } from '../../hooks/useFetch'
import { fetchTickets } from '../../lib/supabase/adminTicketQueries'
import { TICKET_STATUSES, type Ticket, type TicketStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const PRIORITY_LABELS: Record<Ticket['priority'], string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function AdminTicketsPage() {
  const { data: tickets, loading, error } = useFetch(fetchTickets, [])
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [showTestData, setShowTestData] = useState(false)

  const filtered = useMemo(() => {
    return (tickets ?? []).filter((t) => {
      if (!showTestData && t.is_test) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      return true
    })
  }, [tickets, statusFilter, showTestData])

  return (
    <AdminLayout title="Support Tickets">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          id="ticket-status-filter"
          ariaLabel="Filter by status"
          size="compact"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as TicketStatus | 'all')}
          options={[{ value: 'all', label: 'All statuses' }, ...TICKET_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
        />

        <label className="font-mono-label ml-auto flex items-center gap-2 text-[11px] uppercase text-ink-soft">
          <input
            type="checkbox"
            checked={showTestData}
            onChange={(e) => setShowTestData(e.target.checked)}
            className="accent-teal"
          />
          Show test data
        </label>
      </div>

      <div className="mt-4">
        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && filtered.length === 0}
          emptyMessage="No tickets match these filters."
        />

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                    <td className="px-4 py-3">
                      <Link to={`/admin/tickets/${t.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                        {t.subject}
                      </Link>
                      {t.is_test && (
                        <span className="font-mono-label ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] uppercase text-gold">
                          Test
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <div>{t.client?.full_name ?? '—'}</div>
                      {t.client?.phone && <div className="text-xs">{t.client.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{PRIORITY_LABELS[t.priority]}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono-label rounded-full border border-ink/15 px-2.5 py-1 text-[10px] uppercase text-ink-soft">
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{t.assignee?.full_name ?? 'Unassigned'}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminTicketsPage

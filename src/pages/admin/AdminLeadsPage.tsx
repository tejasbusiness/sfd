import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Select } from '../../components/ui/Select'
import { useFetch } from '../../hooks/useFetch'
import { fetchLeads } from '../../lib/supabase/adminQueries'
import { LEAD_STATUSES, type Lead, type LeadStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function AdminLeadsPage() {
  const { data: leads, loading, error } = useFetch(fetchLeads, [])
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [showTestData, setShowTestData] = useState(false)

  const sources = useMemo(() => {
    const set = new Set((leads ?? []).map((l) => l.source).filter((s): s is string => !!s))
    return Array.from(set).sort()
  }, [leads])

  const filtered = useMemo(() => {
    return (leads ?? []).filter((lead) => {
      if (!showTestData && lead.is_test) return false
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false
      return true
    })
  }, [leads, statusFilter, sourceFilter, showTestData])

  return (
    <AdminLayout title="Leads">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          id="lead-status-filter"
          ariaLabel="Filter by status"
          size="compact"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as LeadStatus | 'all')}
          options={[{ value: 'all', label: 'All statuses' }, ...LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
        />

        <Select
          id="lead-source-filter"
          ariaLabel="Filter by source"
          size="compact"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={[{ value: 'all', label: 'All sources' }, ...sources.map((s) => ({ value: s, label: s }))]}
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
        <QueryState loading={loading} error={error} empty={!loading && !error && filtered.length === 0} emptyMessage="No leads match these filters." />

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Entry Service</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead: Lead) => (
                  <tr key={lead.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                    <td className="px-4 py-3">
                      <Link to={`/admin/leads/${lead.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                        {lead.full_name}
                      </Link>
                      {lead.is_test && (
                        <span className="font-mono-label ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] uppercase text-gold">
                          Test
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <div>{lead.phone}</div>
                      {lead.email && <div className="text-xs">{lead.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{lead.entry_service?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{lead.source ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono-label rounded-full border border-ink/15 px-2.5 py-1 text-[10px] uppercase text-ink-soft">
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{lead.assignee?.full_name ?? 'Unassigned'}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(lead.created_at)}</td>
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

export default AdminLeadsPage

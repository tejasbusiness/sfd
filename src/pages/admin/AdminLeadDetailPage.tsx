import { useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import {
  fetchLeadById,
  fetchLeadNotes,
  updateLeadStatus,
  assignLead,
  addLeadNote,
  fetchStaffProfiles,
} from '../../lib/supabase/adminQueries'
import { LEAD_STATUSES, type LeadStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function AdminLeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: lead, loading, error } = useFetch(() => fetchLeadById(id!), [id, refreshKey])
  const { data: notes, loading: notesLoading } = useFetch(() => fetchLeadNotes(id!), [id, refreshKey])
  const { data: staff } = useFetch(fetchStaffProfiles, [])

  const [statusSaving, setStatusSaving] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)
  const [noteBody, setNoteBody] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleStatusChange(status: LeadStatus) {
    if (!id) return
    setStatusSaving(true)
    setActionError(null)
    try {
      await updateLeadStatus(id, status)
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to update status. Please try again.')
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleAssign(assignedTo: string) {
    if (!id) return
    setAssignSaving(true)
    setActionError(null)
    try {
      await assignLead(id, assignedTo || null)
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to update assignment. Please try again.')
    } finally {
      setAssignSaving(false)
    }
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault()
    if (!id || !user || !noteBody.trim()) return
    setNoteSaving(true)
    setActionError(null)
    try {
      await addLeadNote(id, noteBody.trim(), user.id, profile?.full_name ?? 'Staff')
      setNoteBody('')
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to add note. Please try again.')
    } finally {
      setNoteSaving(false)
    }
  }

  return (
    <AdminLayout title="Lead">
      <button
        type="button"
        onClick={() => navigate('/admin/leads')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to leads
      </button>

      <QueryState loading={loading} error={error} />

      {!loading && !error && lead && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-ink/10 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">{lead.full_name}</h2>
                {lead.is_test && (
                  <span className="font-mono-label rounded-full bg-gold/20 px-2 py-0.5 text-[9px] uppercase text-gold">
                    Test data
                  </span>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Mobile</dt>
                  <dd className="mt-0.5 text-ink">{lead.phone}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Email</dt>
                  <dd className="mt-0.5 text-ink">{lead.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Entry Service</dt>
                  <dd className="mt-0.5 text-ink">{lead.entry_service?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Source</dt>
                  <dd className="mt-0.5 text-ink">
                    {lead.source ?? '—'} {lead.form_type && `(${lead.form_type})`}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Received</dt>
                  <dd className="mt-0.5 text-ink">{formatDateTime(lead.created_at)}</dd>
                </div>
              </dl>
              {lead.message && (
                <div className="mt-4 rounded-lg bg-sage/50 p-3 text-sm text-ink">
                  <p className="font-mono-label mb-1 text-[10px] uppercase text-ink-soft">Message</p>
                  {lead.message}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-ink/10 p-5">
              <h3 className="font-display text-lg text-ink">Notes</h3>
              <QueryState loading={notesLoading} error={null} empty={!notesLoading && (notes?.length ?? 0) === 0} emptyMessage="No notes yet." />
              {!notesLoading && notes && notes.length > 0 && (
                <ul className="mt-3 space-y-3">
                  {notes.map((note) => (
                    <li key={note.id} className="rounded-lg bg-sage/40 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-label text-[10px] uppercase text-ink-soft">
                          {note.author_name ?? 'Staff'}
                        </span>
                        <span className="text-xs text-ink-soft">{formatDateTime(note.created_at)}</span>
                      </div>
                      <p className="mt-1 text-ink">{note.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleAddNote} className="mt-4">
                <label htmlFor="note-body" className={labelClasses}>
                  Add a note
                </label>
                <textarea
                  id="note-body"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  className={inputClasses}
                  placeholder="Internal note — not visible to the client."
                />
                <Button type="submit" size="md" disabled={noteSaving || !noteBody.trim()} className="mt-2">
                  {noteSaving ? 'Saving…' : 'Add note'}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            {actionError && (
              <p role="alert" className="text-sm text-terracotta">
                {actionError}
              </p>
            )}

            <div className="rounded-xl border border-ink/10 p-5">
              <Select
                id="lead-status"
                label="Status"
                value={lead.status}
                disabled={statusSaving}
                onChange={(v) => handleStatusChange(v as LeadStatus)}
                options={LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </div>

            <div className="rounded-xl border border-ink/10 p-5">
              <Select
                id="lead-assignee"
                label="Assigned to"
                value={lead.assigned_to ?? ''}
                disabled={assignSaving}
                onChange={handleAssign}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...(staff ?? []).map((s) => ({ value: s.id, label: s.full_name ?? s.role })),
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminLeadDetailPage

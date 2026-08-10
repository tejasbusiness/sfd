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
  fetchTicketById,
  fetchTicketMessages,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  addTicketMessage,
} from '../../lib/supabase/adminTicketQueries'
import { fetchStaffProfiles } from '../../lib/supabase/adminQueries'
import { TICKET_STATUSES, TICKET_PRIORITIES, type TicketStatus, type TicketPriority } from '../../lib/supabase/types'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
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

function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: ticket, loading, error } = useFetch(() => fetchTicketById(id!), [id, refreshKey])
  const { data: messages, loading: messagesLoading } = useFetch(() => fetchTicketMessages(id!), [id, refreshKey])
  const { data: staff } = useFetch(fetchStaffProfiles, [])

  const [statusSaving, setStatusSaving] = useState(false)
  const [prioritySaving, setPrioritySaving] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyVisibility, setReplyVisibility] = useState<'internal' | 'customer'>('internal')
  const [replySaving, setReplySaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleStatusChange(status: TicketStatus) {
    if (!id || !ticket) return
    setStatusSaving(true)
    setActionError(null)
    try {
      await updateTicketStatus(id, status, ticket.client_id, ticket.subject, ticket.client?.full_name ?? 'there')
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to update status. Please try again.')
    } finally {
      setStatusSaving(false)
    }
  }

  async function handlePriorityChange(priority: TicketPriority) {
    if (!id) return
    setPrioritySaving(true)
    setActionError(null)
    try {
      await updateTicketPriority(id, priority)
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to update priority. Please try again.')
    } finally {
      setPrioritySaving(false)
    }
  }

  async function handleAssign(assignedTo: string) {
    if (!id) return
    setAssignSaving(true)
    setActionError(null)
    try {
      await assignTicket(id, assignedTo || null)
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to update assignment. Please try again.')
    } finally {
      setAssignSaving(false)
    }
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!id || !user || !replyBody.trim()) return
    setReplySaving(true)
    setActionError(null)
    try {
      await addTicketMessage(id, replyBody.trim(), replyVisibility, user.id, profile?.full_name ?? 'Staff')
      setReplyBody('')
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Failed to post reply. Please try again.')
    } finally {
      setReplySaving(false)
    }
  }

  return (
    <AdminLayout title="Ticket">
      <button
        type="button"
        onClick={() => navigate('/admin/tickets')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to tickets
      </button>

      <QueryState loading={loading} error={error} />

      {!loading && !error && ticket && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-ink/10 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">{ticket.subject}</h2>
                {ticket.is_test && (
                  <span className="font-mono-label rounded-full bg-gold/20 px-2 py-0.5 text-[9px] uppercase text-gold">
                    Test data
                  </span>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Client</dt>
                  <dd className="mt-0.5 text-ink">{ticket.client?.full_name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Phone</dt>
                  <dd className="mt-0.5 text-ink">{ticket.client?.phone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Created</dt>
                  <dd className="mt-0.5 text-ink">{formatDateTime(ticket.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-mono-label text-[10px] uppercase text-ink-soft">Last updated</dt>
                  <dd className="mt-0.5 text-ink">{formatDateTime(ticket.updated_at)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-ink/10 p-5">
              <h3 className="font-display text-lg text-ink">Conversation</h3>
              <QueryState
                loading={messagesLoading}
                error={null}
                empty={!messagesLoading && (messages?.length ?? 0) === 0}
                emptyMessage="No messages yet."
              />
              {!messagesLoading && messages && messages.length > 0 && (
                <ul className="mt-3 space-y-3">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={`rounded-lg p-3 text-sm ${m.visibility === 'customer' ? 'bg-teal/10' : 'bg-sage/40'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-label text-[10px] uppercase text-ink-soft">
                          {m.author_name ?? 'Unknown'} ·{' '}
                          <span className={m.visibility === 'customer' ? 'text-teal' : 'text-ink-soft'}>
                            {m.visibility === 'customer' ? 'Customer-visible' : 'Internal'}
                          </span>
                        </span>
                        <span className="text-xs text-ink-soft">{formatDateTime(m.created_at)}</span>
                      </div>
                      <p className="mt-1 text-ink">{m.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleReply} className="mt-4">
                <label htmlFor="reply-body" className={labelClasses}>
                  Reply
                </label>
                <textarea
                  id="reply-body"
                  rows={3}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className={inputClasses}
                  placeholder="Write a reply…"
                />
                <div className="mt-2 flex items-center gap-4">
                  <label className="font-mono-label flex items-center gap-1.5 text-[11px] uppercase text-ink-soft">
                    <input
                      type="radio"
                      name="visibility"
                      checked={replyVisibility === 'internal'}
                      onChange={() => setReplyVisibility('internal')}
                      className="accent-teal"
                    />
                    Internal note
                  </label>
                  <label className="font-mono-label flex items-center gap-1.5 text-[11px] uppercase text-ink-soft">
                    <input
                      type="radio"
                      name="visibility"
                      checked={replyVisibility === 'customer'}
                      onChange={() => setReplyVisibility('customer')}
                      className="accent-teal"
                    />
                    Visible to client
                  </label>
                </div>
                <Button type="submit" size="md" disabled={replySaving || !replyBody.trim()} className="mt-2">
                  {replySaving ? 'Posting…' : 'Post reply'}
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
                id="ticket-status"
                label="Status"
                value={ticket.status}
                disabled={statusSaving}
                onChange={(v) => handleStatusChange(v as TicketStatus)}
                options={TICKET_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </div>

            <div className="rounded-xl border border-ink/10 p-5">
              <Select
                id="ticket-priority"
                label="Priority"
                value={ticket.priority}
                disabled={prioritySaving}
                onChange={(v) => handlePriorityChange(v as TicketPriority)}
                options={TICKET_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
              />
            </div>

            <div className="rounded-xl border border-ink/10 p-5">
              <Select
                id="ticket-assignee"
                label="Assigned to"
                value={ticket.assigned_to ?? ''}
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

export default AdminTicketDetailPage

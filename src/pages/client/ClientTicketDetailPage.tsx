import { useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ClientLayout from '../../components/client/ClientLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { fetchMyTicketById, fetchMyTicketMessages, replyToTicket } from '../../lib/supabase/clientTicketQueries'
import type { TicketStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
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

function ClientTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: ticket, loading, error } = useFetch(() => fetchMyTicketById(id!), [id, refreshKey])
  const { data: messages, loading: messagesLoading } = useFetch(() => fetchMyTicketMessages(id!), [id, refreshKey])

  const [replyBody, setReplyBody] = useState('')
  const [replySaving, setReplySaving] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  async function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!id || !user || !replyBody.trim()) return
    setReplySaving(true)
    setReplyError(null)
    try {
      await replyToTicket(id, replyBody.trim(), user.id, profile?.full_name ?? 'You')
      setReplyBody('')
      setRefreshKey((k) => k + 1)
    } catch {
      setReplyError('Failed to send reply. Please try again.')
    } finally {
      setReplySaving(false)
    }
  }

  return (
    <ClientLayout title="Ticket">
      <button
        type="button"
        onClick={() => navigate('/client/tickets')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to tickets
      </button>

      <QueryState loading={loading} error={error} />

      {!loading && !error && ticket && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-ink/10 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{ticket.subject}</h2>
              <span className="font-mono-label rounded-full border border-ink/15 px-2.5 py-1 text-[10px] uppercase text-ink-soft">
                {STATUS_LABELS[ticket.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">Opened {formatDateTime(ticket.created_at)}</p>
          </div>

          <div className="rounded-xl border border-ink/10 p-5">
            <QueryState loading={messagesLoading} error={null} empty={!messagesLoading && (messages?.length ?? 0) === 0} emptyMessage="No messages yet." />
            {!messagesLoading && messages && messages.length > 0 && (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg bg-sage/40 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-label text-[10px] uppercase text-ink-soft">{m.author_name ?? 'Support'}</span>
                      <span className="text-xs text-ink-soft">{formatDateTime(m.created_at)}</span>
                    </div>
                    <p className="mt-1 text-ink">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleReply} className="mt-4">
              <label htmlFor="client-reply-body" className={labelClasses}>
                Reply
              </label>
              <textarea
                id="client-reply-body"
                rows={3}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className={inputClasses}
                placeholder="Add more detail or ask a follow-up…"
              />
              {replyError && (
                <p role="alert" className="mt-2 text-sm text-terracotta">
                  {replyError}
                </p>
              )}
              <Button type="submit" size="md" disabled={replySaving || !replyBody.trim()} className="mt-2">
                {replySaving ? 'Sending…' : 'Send reply'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}

export default ClientTicketDetailPage

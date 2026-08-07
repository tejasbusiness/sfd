import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClientLayout from '../../components/client/ClientLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { fetchMyTickets, createTicket } from '../../lib/supabase/clientTicketQueries'
import type { TicketStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function ClientTicketsPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { data: tickets, loading, error } = useFetch(fetchMyTickets, [])

  const [showNewForm, setShowNewForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!user || !subject.trim() || !message.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const ticketId = await createTicket(subject.trim(), user.id, message.trim(), profile?.full_name ?? 'You')
      navigate(`/client/tickets/${ticketId}`)
    } catch {
      setSubmitError('Failed to submit ticket. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <ClientLayout title="Support Tickets">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Track your support requests and reply here — our team responds directly on the ticket.</p>
        <Button type="button" onClick={() => setShowNewForm((s) => !s)}>
          {showNewForm ? 'Cancel' : 'New ticket'}
        </Button>
      </div>

      {showNewForm && (
        <form onSubmit={handleCreate} className="mt-4 max-w-xl space-y-4 rounded-xl border border-ink/10 p-5">
          <div>
            <label htmlFor="new-ticket-subject" className={labelClasses}>
              Subject
            </label>
            <input
              id="new-ticket-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="new-ticket-message" className={labelClasses}>
              Message
            </label>
            <textarea
              id="new-ticket-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClasses}
            />
          </div>
          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}
          <Button type="submit" disabled={submitting || !subject.trim() || !message.trim()}>
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && (tickets?.length ?? 0) === 0}
          emptyMessage="You haven't submitted any tickets yet."
        />

        {!loading && !error && tickets && tickets.length > 0 && (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/client/tickets/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:border-teal"
                >
                  <div>
                    <p className="text-ink">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">Opened {formatDate(t.created_at)}</p>
                  </div>
                  <span className="font-mono-label rounded-full border border-ink/15 px-2.5 py-1 text-[10px] uppercase text-ink-soft">
                    {STATUS_LABELS[t.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ClientLayout>
  )
}

export default ClientTicketsPage

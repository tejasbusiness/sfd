import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { usePushSubscription } from '../../hooks/usePushSubscription'
import type { AppNotification } from '../../lib/supabase/types'

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.round(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}

function notificationHref(n: AppNotification): string | null {
  if (n.lead_id) return `/admin/leads/${n.lead_id}`
  if (n.ticket_id) return `/admin/tickets/${n.ticket_id}`
  if (n.booking_id) return `/admin/bookings`
  return null
}

/**
 * In-app notification bell (docs/07's fallback for when push isn't granted)
 * + the entry point for opting into Web Push. Lives in AdminLayout's header,
 * so it's present on every /admin/* page.
 */
function NotificationBell({ userId }: { userId: string | undefined }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(userId)
  const push = usePushSubscription(userId)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleNotificationClick(n: AppNotification) {
    if (!n.is_read) markRead(n.id)
    const href = notificationHref(n)
    if (href) navigate(href)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        className="relative rounded-full border border-ink/15 p-2 text-ink-soft transition-colors hover:border-teal hover:text-teal"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="font-mono-label absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] text-cream">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-ink/15 bg-cream shadow-lg">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <p className="font-display text-sm text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="font-mono-label text-[10px] uppercase text-teal hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="p-4 text-sm text-ink-soft">Loading…</p>}
            {!loading && notifications.length === 0 && <p className="p-4 text-sm text-ink-soft">No notifications yet.</p>}
            {!loading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`block w-full border-b border-ink/5 px-4 py-3 text-left last:border-0 hover:bg-sage/40 ${
                    n.is_read ? '' : 'bg-sage/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-ink">{n.title}</p>
                    {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{n.body}</p>
                  <p className="font-mono-label mt-1 text-[9px] uppercase text-ink-soft/70">{formatRelativeTime(n.created_at)}</p>
                </button>
              ))}
          </div>

          {push.supported && (
            <div className="border-t border-ink/10 px-4 py-3">
              {push.subscribed ? (
                <button
                  type="button"
                  onClick={() => push.unsubscribe()}
                  disabled={push.loading}
                  className="font-mono-label text-[10px] uppercase text-ink-soft hover:text-terracotta"
                >
                  {push.loading ? 'Working…' : 'Turn off push notifications'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => push.subscribe()}
                  disabled={push.loading || push.permission === 'denied'}
                  className="font-mono-label text-[10px] uppercase text-teal hover:underline disabled:cursor-not-allowed disabled:text-ink-soft disabled:no-underline"
                >
                  {push.permission === 'denied'
                    ? 'Push blocked in browser settings'
                    : push.loading
                      ? 'Working…'
                      : 'Enable push notifications'}
                </button>
              )}
              {push.error && <p className="mt-1 text-xs text-terracotta">{push.error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell

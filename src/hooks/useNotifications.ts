import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/supabase/adminQueries'
import type { AppNotification } from '../lib/supabase/types'

/**
 * Realtime admin notification feed (docs/07): fetches recent broadcast
 * notifications + this user's read state, then subscribes to Postgres
 * Changes on the notifications table so new leads/bookings/tickets/replies
 * appear live without a refresh — the Realtime piece of the in-app bell.
 * Web Push (docs/07's other delivery path) is handled separately by
 * usePushSubscription; this hook is also the source of truth the bell's
 * unread count reads from.
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchNotifications(userId)
      .then((data) => {
        if (!cancelled) setNotifications(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = payload.new as AppNotification
          if (row.is_test) return
          setNotifications((prev) => [{ ...row, is_read: false }, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications])

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      try {
        await markNotificationRead(notificationId, userId)
      } catch {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n)))
      }
    },
    [userId],
  )

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await markAllNotificationsRead(unreadIds, userId)
    } catch {
      setNotifications((prev) => prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: false } : n)))
    }
  }, [notifications, userId])

  return { notifications, unreadCount, loading, error, markRead, markAllRead }
}

import { useCallback, useEffect, useState } from 'react'
import { deletePushSubscription, fetchOwnPushSubscription, savePushSubscription } from '../lib/supabase/adminQueries'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function base64UrlToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

/**
 * Web Push opt-in for the admin bell (docs/07): registers the service
 * worker, requests browser permission, and stores the resulting
 * PushSubscription in push_subscriptions so send-push can target this
 * device. In-app bell notifications (useNotifications) work regardless —
 * this is the "also notify even when the admin tab isn't open" layer.
 */
export function usePushSubscription(userId: string | undefined) {
  const [permission, setPermission] = useState<PushPermissionState>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!supported) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as PushPermissionState)
  }, [supported])

  useEffect(() => {
    if (!supported || !userId) return
    let cancelled = false

    navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((reg) => reg?.pushManager.getSubscription())
      .then(async (existing) => {
        if (cancelled || !existing) return
        const row = await fetchOwnPushSubscription(userId, existing.endpoint)
        if (!cancelled) setSubscribed(!!row)
      })
      .catch(() => {
        // No existing registration/subscription yet — leave subscribed=false.
      })

    return () => {
      cancelled = true
    }
  }, [supported, userId])

  const subscribe = useCallback(async () => {
    if (!supported || !userId) return
    if (!VAPID_PUBLIC_KEY) {
      setError('Web Push is not configured for this deployment yet.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult as PushPermissionState)
      if (permissionResult !== 'granted') {
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
      })

      const p256dhKey = pushSubscription.getKey('p256dh')
      const authKey = pushSubscription.getKey('auth')
      if (!p256dhKey || !authKey) throw new Error('Push subscription is missing required keys.')

      await savePushSubscription(
        userId,
        pushSubscription.endpoint,
        arrayBufferToBase64Url(p256dhKey),
        arrayBufferToBase64Url(authKey),
      )
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable push notifications.')
    } finally {
      setLoading(false)
    }
  }, [supported, userId])

  const unsubscribe = useCallback(async () => {
    if (!supported) return
    setLoading(true)
    setError(null)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const existing = await registration?.pushManager.getSubscription()
      if (existing) {
        await deletePushSubscription(existing.endpoint)
        await existing.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable push notifications.')
    } finally {
      setLoading(false)
    }
  }, [supported])

  return { supported, permission, subscribed, loading, error, subscribe, unsubscribe }
}

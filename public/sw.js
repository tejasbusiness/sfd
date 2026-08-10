// Web Push service worker for the admin notification bell (docs/07).
// Registered by usePushSubscription on the admin app only — the public
// marketing site never registers this.

self.addEventListener('push', (event) => {
  let payload = { title: 'New notification', body: '', url: '/admin' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    // Non-JSON push payload — fall back to the defaults above rather than throwing.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.svg',
      data: { url: payload.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/admin'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})

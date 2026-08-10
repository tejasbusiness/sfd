import { supabase } from './client'
import type { AppNotification, Lead, LeadMessage, LeadStatus, StaffProfile, Subscription } from './types'

/**
 * Staff-only reads/writes for the admin app (RLS-gated via is_staff(), see
 * migrations 0004/0006) — kept separate from lib/supabase/queries.ts, which
 * is public/anon-facing marketing content only.
 */

// subscriptions.client_id has no FK from leads (only a shared value once a
// lead converts to a customer), so it can't be a Supabase embedded select —
// fetched separately and merged client-side. Picks each client's most
// recently updated subscription when more than one row exists (upgrades/
// re-subscribes).
async function fetchLatestSubscriptionsByClientIds(clientIds: string[]): Promise<Map<string, Subscription>> {
  const uniqueIds = Array.from(new Set(clientIds))
  if (uniqueIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, tier:pricing_tiers(name)')
    .in('client_id', uniqueIds)
    .order('updated_at', { ascending: false })

  if (error) throw error

  const byClientId = new Map<string, Subscription>()
  for (const sub of data as Subscription[]) {
    if (sub.client_id && !byClientId.has(sub.client_id)) {
      byClientId.set(sub.client_id, sub)
    }
  }
  return byClientId
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, entry_service:services(name), assignee:profiles!leads_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  const leads = data as Lead[]

  const clientIds = leads.map((l) => l.client_id).filter((id): id is string => !!id)
  const subsByClientId = await fetchLatestSubscriptionsByClientIds(clientIds)
  for (const lead of leads) {
    lead.subscription = lead.client_id ? (subsByClientId.get(lead.client_id) ?? null) : null
  }

  return leads
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, entry_service:services(name), assignee:profiles!leads_assigned_to_fkey(full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  const lead = data as Lead

  if (lead.client_id) {
    const subsByClientId = await fetchLatestSubscriptionsByClientIds([lead.client_id])
    lead.subscription = subsByClientId.get(lead.client_id) ?? null
  } else {
    lead.subscription = null
  }

  return lead
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

export async function assignLead(id: string, assignedTo: string | null): Promise<void> {
  const { error } = await supabase.from('leads').update({ assigned_to: assignedTo }).eq('id', id)
  if (error) throw error
}

export async function fetchLeadNotes(leadId: string): Promise<LeadMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', leadId)
    .eq('context_type', 'lead_note')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as LeadMessage[]
}

export async function addLeadNote(leadId: string, body: string, authorId: string, authorName: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    context_type: 'lead_note',
    lead_id: leadId,
    visibility: 'internal',
    author_id: authorId,
    author_name: authorName,
    body,
  })
  if (error) throw error
}

export async function fetchStaffProfiles(): Promise<StaffProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'staff_support', 'staff_sales'])
    .order('full_name', { ascending: true })

  if (error) throw error
  return data as StaffProfile[]
}

const NOTIFICATION_FETCH_LIMIT = 50

/**
 * Most-recent notifications (broadcast to all staff) plus this user's own
 * read state, merged client-side — notification_reads is a separate table
 * (see 0023_notifications.sql) so read state stays independent per staff
 * member. Excludes is_test rows unless includeTestData is set, matching the
 * show-test-data convention used elsewhere in the admin app.
 */
export async function fetchNotifications(userId: string, includeTestData = false): Promise<AppNotification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(NOTIFICATION_FETCH_LIMIT)

  if (!includeTestData) query = query.eq('is_test', false)

  const { data: notifications, error } = await query
  if (error) throw error

  const { data: reads, error: readsError } = await supabase.from('notification_reads').select('notification_id').eq('user_id', userId)
  if (readsError) throw readsError

  const readIds = new Set((reads ?? []).map((r) => r.notification_id))
  return (notifications as AppNotification[]).map((n) => ({ ...n, is_read: readIds.has(n.id) }))
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notification_reads')
    .upsert({ notification_id: notificationId, user_id: userId }, { onConflict: 'notification_id,user_id' })
  if (error) throw error
}

export async function markAllNotificationsRead(notificationIds: string[], userId: string): Promise<void> {
  if (notificationIds.length === 0) return
  const rows = notificationIds.map((id) => ({ notification_id: id, user_id: userId }))
  const { error } = await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id' })
  if (error) throw error
}

export async function fetchOwnPushSubscription(userId: string, endpoint: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function savePushSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: 'endpoint' })
  if (error) throw error
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) throw error
}

/**
 * Fires the send-push edge function so every subscribed staff device gets a
 * Web Push notification. Called client-side right after a notification-
 * triggering insert, since Postgres can't make outbound HTTPS calls itself
 * (see supabase/functions/send-push's header comment). Best-effort — a push
 * delivery failure shouldn't block or surface an error on the action that
 * triggered it (e.g. a customer submitting a lead form).
 */
export async function triggerPushNotification(title: string, body: string, url?: string): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', { body: { title, body, url } })
  } catch {
    // Best-effort — see comment above.
  }
}

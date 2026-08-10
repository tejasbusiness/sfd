import { supabase } from './client'
import type { LeadMessage, Ticket, TicketPriority, TicketStatus } from './types'

/**
 * Staff-only reads/writes for support tickets — is_staff()-gated (migration
 * 0006), same tier as leads/bookings. Two FKs from tickets to profiles
 * (client_id, assigned_to) require explicit constraint names on the embed,
 * same gotcha as leads.assigned_to.
 */

export async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, client:profiles!tickets_client_id_fkey(full_name, phone), assignee:profiles!tickets_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Ticket[]
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, client:profiles!tickets_client_id_fkey(full_name, phone), assignee:profiles!tickets_assigned_to_fkey(full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Ticket
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  clientId: string | null,
  subject: string,
  clientName: string,
): Promise<void> {
  const { error } = await supabase.from('tickets').update({ status }).eq('id', id)
  if (error) throw error

  // Best-effort ticket_resolved_checkin email (docs/09) — fired here rather
  // than a DB trigger since send-email needs an outbound HTTPS call, which
  // Postgres can't make itself (same pattern as every other automation
  // trigger in this build). Requires clientId since tickets/profiles carry
  // no email column (only auth.users does) — send-email resolves it
  // server-side via the service-role client. Guest/anonymous tickets
  // (client_id null) have no account to email, so they're skipped.
  if (status === 'resolved' && clientId) {
    supabase.functions
      .invoke('send-email', {
        body: { triggerKey: 'ticket_resolved_checkin', clientId, mergeFields: { name: clientName, ticket_subject: subject }, ticketId: id },
      })
      .catch(() => {})
  }
}

export async function updateTicketPriority(id: string, priority: TicketPriority): Promise<void> {
  const { error } = await supabase.from('tickets').update({ priority }).eq('id', id)
  if (error) throw error
}

export async function assignTicket(id: string, assignedTo: string | null): Promise<void> {
  const { error } = await supabase.from('tickets').update({ assigned_to: assignedTo }).eq('id', id)
  if (error) throw error
}

export async function fetchTicketMessages(ticketId: string): Promise<LeadMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('context_type', 'ticket')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as LeadMessage[]
}

export async function addTicketMessage(
  ticketId: string,
  body: string,
  visibility: 'internal' | 'customer',
  authorId: string,
  authorName: string,
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    context_type: 'ticket',
    ticket_id: ticketId,
    visibility,
    author_id: authorId,
    author_name: authorName,
    body,
  })
  if (error) throw error
}

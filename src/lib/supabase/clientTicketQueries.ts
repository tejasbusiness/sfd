import { supabase } from './client'
import type { LeadMessage, Ticket } from './types'

/**
 * Customer-facing ticket reads/writes, gated by tickets_select_own /
 * tickets_insert_own_or_public / messages_select_customer_visible /
 * messages_insert_customer_reply (migration 0006) — RLS restricts every read
 * and write here to the signed-in user's own client_id, so there is no
 * explicit .eq('client_id', ...) needed client-side; the database enforces it.
 */

export async function fetchMyTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Ticket[]
}

export async function fetchMyTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()
  if (error) throw error
  return data as Ticket
}

export async function createTicket(subject: string, clientId: string, firstMessageBody: string, authorName: string): Promise<string> {
  const { data, error } = await supabase.from('tickets').insert({ subject, client_id: clientId }).select('id').single()
  if (error) throw error

  const ticketId = (data as { id: string }).id
  const { error: msgError } = await supabase.from('messages').insert({
    context_type: 'ticket',
    ticket_id: ticketId,
    visibility: 'customer',
    author_id: clientId,
    author_name: authorName,
    body: firstMessageBody,
  })
  if (msgError) throw msgError

  return ticketId
}

export async function fetchMyTicketMessages(ticketId: string): Promise<LeadMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as LeadMessage[]
}

export async function replyToTicket(ticketId: string, body: string, authorId: string, authorName: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    context_type: 'ticket',
    ticket_id: ticketId,
    visibility: 'customer',
    author_id: authorId,
    author_name: authorName,
    body,
  })
  if (error) throw error
}

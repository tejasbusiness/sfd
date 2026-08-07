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

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
  const { error } = await supabase.from('tickets').update({ status }).eq('id', id)
  if (error) throw error
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

import { supabase } from './client'
import type { Lead, LeadMessage, LeadStatus, StaffProfile } from './types'

/**
 * Staff-only reads/writes for the admin app (RLS-gated via is_staff(), see
 * migrations 0004/0006) — kept separate from lib/supabase/queries.ts, which
 * is public/anon-facing marketing content only.
 */

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, entry_service:services(name), assignee:profiles!leads_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Lead[]
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, entry_service:services(name), assignee:profiles!leads_assigned_to_fkey(full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Lead
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

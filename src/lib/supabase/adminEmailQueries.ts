import { supabase } from './client'
import type { EmailTemplate, EmailTriggerLogEntry } from './types'

/**
 * email_templates is is_admin()-only for both read and write (migration 0008,
 * same tier as `settings`) — callers must gate the whole page on
 * role === 'admin', not just disable a save button. email_trigger_log is
 * staff-readable (any role can audit what was sent) but has no client-side
 * write policy — only send-email/run-email-sweeps (service-role) write to it.
 */

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase.from('email_templates').select('*').order('trigger_key', { ascending: true })
  if (error) throw error
  return data as EmailTemplate[]
}

export async function updateEmailTemplate(
  id: string,
  fields: { subject: string; body_html: string; is_active: boolean },
): Promise<void> {
  const { error } = await supabase.from('email_templates').update(fields).eq('id', id)
  if (error) throw error
}

export async function fetchEmailTriggerLog(limit = 50): Promise<EmailTriggerLogEntry[]> {
  const { data, error } = await supabase
    .from('email_trigger_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as EmailTriggerLogEntry[]
}

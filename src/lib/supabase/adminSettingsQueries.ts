import { supabase } from './client'
import type { Setting, SettingKey } from './types'

/**
 * settings is is_admin()-only for BOTH read and write (migration 0003) — unlike
 * the CMS tables, there's no is_staff() read tier here. Callers must gate the
 * whole page on role === 'admin', not just disable a save button, since even
 * fetchAllSettings() will come back RLS-denied for staff_sales/staff_support.
 */

export async function fetchAllSettings(): Promise<Setting[]> {
  const { data, error } = await supabase.from('settings').select('*').order('key', { ascending: true })
  if (error) throw error
  return data as Setting[]
}

export async function updateSetting(key: SettingKey, value: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('settings').update({ value }).eq('key', key)
  if (error) throw error
}

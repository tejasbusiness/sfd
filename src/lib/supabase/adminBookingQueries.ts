import { supabase } from './client'
import type { AvailabilityRule, BlackoutDate, Booking, BookingStatus } from './types'

/** Staff-only booking-management reads/writes (RLS-gated via is_staff(), migration 0005). */

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, service:services(name, default_duration_minutes), practitioner:profiles!bookings_practitioner_id_fkey(full_name)',
    )
    .order('starts_at', { ascending: true })

  if (error) throw error
  return data as Booking[]
}

export async function fetchBookingById(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, service:services(name, default_duration_minutes), practitioner:profiles!bookings_practitioner_id_fkey(full_name)',
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Booking
}

export interface CreateManualBookingParams {
  serviceId: string
  practitionerId?: string | null
  startsAt: string
  endsAt: string
  status: BookingStatus
  clientFullName: string
  clientPhone: string
  clientEmail?: string
  notes?: string
  isTest?: boolean
}

/**
 * Checks for an existing active booking overlapping [startsAt, endsAt) on
 * the same service — returns a warning string if one exists, or null. Staff
 * creation deliberately doesn't hard-block on this (unlike the public
 * create-booking edge function's atomic check, meant to stop concurrent
 * anonymous visitors racing for the same slot) — a staff member may
 * legitimately want to log a phone booking that overlaps a hold, so this
 * surfaces the conflict for a judgment call instead of refusing outright.
 */
export async function checkBookingOverlap(
  serviceId: string,
  startsAt: string,
  endsAt: string,
  excludeBookingId?: string,
): Promise<string | null> {
  let query = supabase
    .from('bookings')
    .select('id, starts_at, client_full_name')
    .eq('service_id', serviceId)
    .in('status', ['pending', 'confirmed', 'rescheduled'])
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)

  if (excludeBookingId) query = query.neq('id', excludeBookingId)

  const { data, error } = await query
  if (error) throw error
  if (!data || data.length === 0) return null
  return `Overlaps an existing booking with ${data[0].client_full_name} at ${new Date(data[0].starts_at).toLocaleString()}.`
}

/**
 * Staff-created bookings go straight to the table (RLS: is_staff() has full
 * access, migration 0005) — unlike the public booking flow, this does NOT
 * route through create-booking edge function's atomic availability check.
 * Staff are trusted to book outside normal hours/around holds deliberately
 * (e.g. a phone-booked slot, a favor for a returning client); the edge
 * function's race-prevention matters for concurrent anonymous visitors, not
 * a single staff member creating one row at a time. Call checkBookingOverlap
 * first to warn (not block) on conflicts.
 */
export async function createManualBooking(params: CreateManualBookingParams): Promise<void> {
  const { error } = await supabase.from('bookings').insert({
    service_id: params.serviceId,
    practitioner_id: params.practitionerId ?? null,
    starts_at: params.startsAt,
    ends_at: params.endsAt,
    status: params.status,
    client_full_name: params.clientFullName,
    client_phone: params.clientPhone,
    client_email: params.clientEmail ?? null,
    notes: params.notes ?? null,
    is_test: params.isTest ?? false,
  })
  if (error) throw error
}

export interface UpdateBookingParams {
  startsAt?: string
  endsAt?: string
  status?: BookingStatus
  practitionerId?: string | null
  notes?: string | null
  clientFullName?: string
  clientPhone?: string
  clientEmail?: string | null
}

export async function updateBooking(id: string, params: UpdateBookingParams): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (params.startsAt !== undefined) patch.starts_at = params.startsAt
  if (params.endsAt !== undefined) patch.ends_at = params.endsAt
  if (params.status !== undefined) patch.status = params.status
  if (params.practitionerId !== undefined) patch.practitioner_id = params.practitionerId
  if (params.clientFullName !== undefined) patch.client_full_name = params.clientFullName
  if (params.clientPhone !== undefined) patch.client_phone = params.clientPhone
  if (params.clientEmail !== undefined) patch.client_email = params.clientEmail
  if (params.notes !== undefined) patch.notes = params.notes

  const { error } = await supabase.from('bookings').update(patch).eq('id', id)
  if (error) throw error
}

export async function cancelBookingAsStaff(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status: 'canceled' }).eq('id', id)
  if (error) throw error
}

export async function fetchAvailabilityRules(): Promise<AvailabilityRule[]> {
  const { data, error } = await supabase
    .from('availability_rules')
    .select('*, service:services(name)')
    .order('service_id', { ascending: true })
    .order('day_of_week', { ascending: true })

  if (error) throw error
  return data as AvailabilityRule[]
}

export interface CreateAvailabilityRuleParams {
  serviceId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  bufferMinutes: number
  practitionerId?: string | null
}

export async function createAvailabilityRule(params: CreateAvailabilityRuleParams): Promise<void> {
  const { error } = await supabase.from('availability_rules').insert({
    service_id: params.serviceId,
    practitioner_id: params.practitionerId ?? null,
    day_of_week: params.dayOfWeek,
    start_time: params.startTime,
    end_time: params.endTime,
    buffer_minutes: params.bufferMinutes,
  })
  if (error) throw error
}

export async function updateAvailabilityRule(
  id: string,
  params: Partial<CreateAvailabilityRuleParams & { isActive: boolean }>,
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (params.startTime !== undefined) patch.start_time = params.startTime
  if (params.endTime !== undefined) patch.end_time = params.endTime
  if (params.bufferMinutes !== undefined) patch.buffer_minutes = params.bufferMinutes
  if (params.isActive !== undefined) patch.is_active = params.isActive

  const { error } = await supabase.from('availability_rules').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteAvailabilityRule(id: string): Promise<void> {
  const { error } = await supabase.from('availability_rules').delete().eq('id', id)
  if (error) throw error
}

export async function fetchBlackoutDates(): Promise<BlackoutDate[]> {
  const { data, error } = await supabase.from('blackout_dates').select('*').order('date', { ascending: true })
  if (error) throw error
  return data as BlackoutDate[]
}

export async function createBlackoutDate(date: string, reason?: string, practitionerId?: string | null): Promise<void> {
  const { error } = await supabase.from('blackout_dates').insert({
    date,
    reason: reason ?? null,
    practitioner_id: practitionerId ?? null,
  })
  if (error) throw error
}

export async function deleteBlackoutDate(id: string): Promise<void> {
  const { error } = await supabase.from('blackout_dates').delete().eq('id', id)
  if (error) throw error
}

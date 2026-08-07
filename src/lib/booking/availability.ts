import { supabase } from '../supabase/client'

export interface TimeSlot {
  startsAt: string // ISO
  endsAt: string // ISO
  /** Already booked (or otherwise unavailable) — shown in the picker, but not selectable. */
  isBooked: boolean
}

interface AvailabilityRuleRow {
  day_of_week: number
  start_time: string // "HH:MM:SS"
  end_time: string
  buffer_minutes: number
  practitioner_id: string | null
}

interface BookedSlotRow {
  starts_at: string
  ends_at: string
}

/**
 * Client-side slot computation for display purposes only — the server
 * (create-booking edge function) re-validates every slot atomically before
 * insert, so this never needs to be perfectly race-proof, just good enough
 * to show a sensible picker. Generates slots for the next `daysAhead` days.
 */
export async function fetchAvailableSlots(
  serviceId: string,
  durationMinutes: number,
  daysAhead = 14,
): Promise<TimeSlot[]> {
  const [rulesRes, blackoutsRes, bookingsRes] = await Promise.all([
    supabase
      .from('availability_rules')
      .select('day_of_week, start_time, end_time, buffer_minutes, practitioner_id')
      .eq('service_id', serviceId)
      .eq('is_active', true),
    supabase.from('blackout_dates').select('date, practitioner_id'),
    supabase.rpc('get_booked_slots', { p_service_id: serviceId }),
  ])

  if (rulesRes.error) throw rulesRes.error
  if (blackoutsRes.error) throw blackoutsRes.error
  if (bookingsRes.error) throw bookingsRes.error

  const rules = (rulesRes.data ?? []) as AvailabilityRuleRow[]
  const blackoutDates = new Set((blackoutsRes.data ?? []).map((b) => b.date))
  const existingBookings = ((bookingsRes.data ?? []) as BookedSlotRow[]).map((b) => ({
    start: new Date(b.starts_at).getTime(),
    end: new Date(b.ends_at).getTime(),
  }))

  const slots: TimeSlot[] = []
  const now = new Date()

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const day = new Date(now)
    day.setUTCDate(day.getUTCDate() + dayOffset)
    const dateOnly = day.toISOString().slice(0, 10)

    if (blackoutDates.has(dateOnly)) continue

    const dayOfWeek = day.getUTCDay()
    const rulesForDay = rules.filter((r) => r.day_of_week === dayOfWeek)

    for (const rule of rulesForDay) {
      const [startH, startM] = rule.start_time.split(':').map(Number)
      const [endH, endM] = rule.end_time.split(':').map(Number)
      // Step by meeting duration + buffer (e.g. 30 min meeting + 15 min
      // buffer_minutes = 45 min between slot starts) so back-to-back
      // bookings always leave a real gap, not just a zero-width boundary.
      const stepMinutes = durationMinutes + (rule.buffer_minutes ?? 0)

      let slotStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), startH, startM))
      const windowEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), endH, endM))

      while (slotStart.getTime() + durationMinutes * 60_000 <= windowEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000)

        // Past slots aren't real options and stay hidden entirely. Booked
        // slots ARE shown, just disabled, per the client-facing picker spec.
        // Overlap check is padded by buffer_minutes on both sides to match
        // create-booking's server-side check — an existing booking's start
        // time isn't necessarily aligned to this slot grid.
        if (slotStart.getTime() > now.getTime()) {
          const bufferMs = (rule.buffer_minutes ?? 0) * 60_000
          const paddedStart = slotStart.getTime() - bufferMs
          const paddedEnd = slotEnd.getTime() + bufferMs
          const isBooked = existingBookings.some((b) => paddedStart < b.end && paddedEnd > b.start)
          slots.push({ startsAt: slotStart.toISOString(), endsAt: slotEnd.toISOString(), isBooked })
        }

        slotStart = new Date(slotStart.getTime() + stepMinutes * 60_000)
      }
    }
  }

  return slots
}

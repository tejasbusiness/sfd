import { supabase } from '../supabase/client'

export interface CreateBookingParams {
  serviceId: string
  practitionerId?: string | null
  startsAt: string
  clientFullName: string
  clientPhone: string
  clientEmail?: string
  notes: string
}

export interface CreateBookingResult {
  bookingId: string
  startsAt: string
  endsAt: string
  status: string
  manageToken: string
}

export interface ManagedBooking {
  bookingId: string
  serviceId: string
  startsAt: string
  endsAt: string
  status: string
  clientFullName: string
}

export class BookingApiError extends Error {}

async function invoke<T>(functionName: string, options: Parameters<typeof supabase.functions.invoke>[1]): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, options)
  if (error) {
    // supabase-js wraps non-2xx responses in a generic error; the actual
    // message from our edge function's jsonError() is in error.context body.
    const context = (error as { context?: Response }).context
    if (context) {
      try {
        const body = await context.clone().json()
        throw new BookingApiError(body.error ?? error.message)
      } catch {
        // fall through to generic message below
      }
    }
    throw new BookingApiError(error.message)
  }
  return data as T
}

export function createBooking(params: CreateBookingParams): Promise<CreateBookingResult> {
  return invoke('create-booking', { body: params })
}

export async function fetchBookingByToken(token: string): Promise<ManagedBooking> {
  const { data, error } = await supabase.functions.invoke(`manage-booking?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  })
  if (error) {
    const context = (error as { context?: Response }).context
    if (context) {
      const body = await context.clone().json().catch(() => null)
      throw new BookingApiError(body?.error ?? error.message)
    }
    throw new BookingApiError(error.message)
  }
  return data as ManagedBooking
}

export function cancelBooking(token: string): Promise<{ status: string; bookingId: string }> {
  return invoke('manage-booking', { body: { token, action: 'cancel' } })
}

export function rescheduleBooking(
  token: string,
  newStartsAt: string,
): Promise<{ status: string; bookingId: string; newStartsAt: string; newManageToken: string }> {
  return invoke('manage-booking', { body: { token, action: 'reschedule', newStartsAt } })
}

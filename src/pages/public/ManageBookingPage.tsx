import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PublicLayout from '../../components/marketing/PublicLayout'
import PageHeader from '../../components/ui/PageHeader'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { useFetch } from '../../hooks/useFetch'
import {
  fetchBookingByToken,
  cancelBooking,
  rescheduleBooking,
  BookingApiError,
  type ManagedBooking,
} from '../../lib/booking/api'
import { fetchAvailableSlots, type TimeSlot } from '../../lib/booking/availability'

// Slots are generated/stored in UTC but displayed in IST throughout the
// booking system — see BookingWidget.tsx and availability.ts.
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  })
}

function ManageBookingPage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const {
    data: booking,
    loading,
    error,
  } = useFetch(() => {
    if (!token) throw new BookingApiError('No booking link token was provided.')
    return fetchBookingByToken(token)
  }, [token])

  if (!token) {
    return (
      <PublicLayout>
        <PageHeader
          eyebrow="Manage Booking"
          title="Link missing"
          description="This page needs a booking link — please use the link from your confirmation email."
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <PageHeader eyebrow="Manage Booking" title="Your appointment" />
      <div className="mx-auto max-w-lg px-4 pb-20 pt-6 sm:px-6">
        <QueryState loading={loading} error={error} />
        {!loading && !error && booking && (
          <BookingManagePanel booking={booking} token={token} />
        )}
      </div>
    </PublicLayout>
  )
}

function BookingManagePanel({ booking, token }: { booking: ManagedBooking; token: string }) {
  const [mode, setMode] = useState<'view' | 'reschedule'>('view')
  const [status, setStatus] = useState(booking.status)
  const [startsAt, setStartsAt] = useState(booking.startsAt)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const durationMinutes = Math.round(
    (new Date(booking.endsAt).getTime() - new Date(booking.startsAt).getTime()) / 60_000,
  )

  const {
    data: allSlots,
    loading: slotsLoading,
    error: slotsError,
  } = useFetch<TimeSlot[]>(
    () => (mode === 'reschedule' ? fetchAvailableSlots(booking.serviceId, durationMinutes) : Promise.resolve([])),
    [mode, booking.serviceId, durationMinutes],
  )
  // Reschedule only offers genuinely open slots — unlike the booking widget,
  // this picker doesn't need to show already-booked times as disabled.
  const slots = allSlots?.filter((slot) => !slot.isBooked)

  async function handleCancel() {
    setSubmitting(true)
    setActionError(null)
    try {
      await cancelBooking(token)
      setStatus('canceled')
    } catch (err) {
      setActionError(err instanceof BookingApiError ? err.message : 'Failed to cancel booking.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReschedule(slot: TimeSlot) {
    setSubmitting(true)
    setActionError(null)
    try {
      const result = await rescheduleBooking(token, slot.startsAt)
      setStartsAt(result.newStartsAt)
      setStatus('rescheduled')
      setMode('view')
      // Update the URL so a page refresh uses the reissued token, not the
      // now-invalid one this page loaded with.
      const url = new URL(window.location.href)
      url.searchParams.set('token', result.newManageToken)
      window.history.replaceState({}, '', url.toString())
    } catch (err) {
      setActionError(err instanceof BookingApiError ? err.message : 'Failed to reschedule booking.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'canceled') {
    return (
      <div className="rounded-2xl border border-ink/10 bg-cream p-7 text-center">
        <p className="font-display text-xl text-ink">This booking has been canceled.</p>
        <p className="mt-2 text-sm text-ink-soft">
          If this was a mistake, please contact us to book a new time.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-7">
      <p className="font-mono-label text-xs uppercase text-teal">{status}</p>
      <p className="font-display mt-2 text-xl text-ink">{formatDateTime(startsAt)}</p>
      <p className="mt-1 text-sm text-ink-soft">{booking.clientFullName}</p>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-terracotta">
          {actionError}
        </p>
      )}

      {mode === 'view' && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setMode('reschedule')} disabled={submitting}>
            Reschedule
          </Button>
          <Button variant="secondary" onClick={handleCancel} disabled={submitting}>
            {submitting ? 'Canceling…' : 'Cancel Booking'}
          </Button>
        </div>
      )}

      {mode === 'reschedule' && (
        <div className="mt-6">
          <p className="font-mono-label text-[10px] uppercase text-ink-soft">Choose a new time</p>
          <QueryState
            loading={slotsLoading}
            error={slotsError}
            empty={!slotsLoading && !slotsError && (slots?.length ?? 0) === 0}
            emptyMessage="No other slots available in the next two weeks."
          />
          {!slotsLoading && !slotsError && slots && slots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReschedule(slot)}
                  className="font-mono-label rounded-full border border-ink/15 px-3.5 py-1.5 text-[11px] uppercase text-ink-soft transition-colors hover:border-teal hover:text-teal disabled:opacity-50"
                >
                  {formatDateTime(slot.startsAt)}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMode('view')}
            className="font-mono-label mt-4 text-[10px] uppercase text-teal underline"
          >
            Cancel change
          </button>
        </div>
      )}
    </div>
  )
}

export default ManageBookingPage

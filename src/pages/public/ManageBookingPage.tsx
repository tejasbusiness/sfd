import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
          variant="clinical"
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <PageHeader eyebrow="Manage Booking" title="Your appointment" variant="clinical" />
      <div className="mx-auto max-w-lg px-4 pb-20 pt-6 sm:px-6">
        <QueryState loading={loading} error={error} variant="clinical" />
        {!loading && !error && booking && (
          <BookingManagePanel booking={booking} token={token} />
        )}
      </div>
    </PublicLayout>
  )
}

function BookingManagePanel({ booking, token }: { booking: ManagedBooking; token: string }) {
  const prefersReducedMotion = useReducedMotion()
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

  const fadeTransition = { duration: prefersReducedMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] as const }

  if (status === 'canceled') {
    return (
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
        className="rounded-2xl border border-studio-line bg-white p-7 text-center"
      >
        <p className="font-sans text-xl font-bold text-studio-ink">This booking has been canceled.</p>
        <p className="mt-2 text-sm text-studio-ink-soft">
          If this was a mistake, please contact us to book a new time.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-2xl border border-studio-line bg-white p-7">
      <p className="font-mono-label text-xs uppercase text-studio-ink">{status}</p>
      <p className="font-sans mt-2 text-xl font-bold text-studio-ink">{formatDateTime(startsAt)}</p>
      <p className="mt-1 text-sm text-studio-ink-soft">{booking.clientFullName}</p>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-studio-ink">
          {actionError}
        </p>
      )}

      <AnimatePresence mode="wait">
        {mode === 'view' && (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Button variant="clinical-ghost" onClick={() => setMode('reschedule')} disabled={submitting}>
              Reschedule
            </Button>
            <Button variant="clinical-ghost" onClick={handleCancel} disabled={submitting}>
              {submitting ? 'Canceling…' : 'Cancel Booking'}
            </Button>
          </motion.div>
        )}

        {mode === 'reschedule' && (
          <motion.div
            key="reschedule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="mt-6"
          >
            <p className="font-mono-label text-[10px] uppercase text-studio-ink-soft">Choose a new time</p>
            <QueryState
              loading={slotsLoading}
              error={slotsError}
              empty={!slotsLoading && !slotsError && (slots?.length ?? 0) === 0}
              emptyMessage="No other slots available in the next two weeks."
              variant="clinical"
            />
            {!slotsLoading && !slotsError && slots && slots.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((slot, index) => (
                  <motion.button
                    key={slot.startsAt}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReschedule(slot)}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.03 }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    className="font-mono-label rounded-full border border-studio-line px-3.5 py-1.5 text-[11px] uppercase text-studio-ink-soft transition-colors hover:border-studio-ink hover:text-studio-ink disabled:opacity-50"
                  >
                    {formatDateTime(slot.startsAt)}
                  </motion.button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMode('view')}
              className="font-mono-label mt-4 text-[10px] uppercase text-studio-ink underline"
            >
              Cancel change
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageBookingPage

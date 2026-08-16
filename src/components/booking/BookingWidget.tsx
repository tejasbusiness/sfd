import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useFetch } from '../../hooks/useFetch'
import { fetchAvailableSlots, type TimeSlot } from '../../lib/booking/availability'
import { createBooking, BookingApiError, type CreateBookingResult } from '../../lib/booking/api'
import { Button } from '../ui/Button'
import { clinicalInputClasses, clinicalLabelClasses } from '../ui/Input'
import MobileNumberField, { type MobileNumberValue } from '../ui/MobileNumberField'
import QueryState from '../ui/QueryState'
import BookingCalendar from './BookingCalendar'

interface BookingWidgetProps {
  serviceId: string
  serviceName: string
  durationMinutes: number
  onBooked?: (result: CreateBookingResult) => void
}

const MESSAGE_MAX_LENGTH = 1000

type WizardStep = 'date' | 'time' | 'details' | 'review'

const STEP_LABELS: Record<WizardStep, string> = {
  date: 'Choose a date',
  time: 'Choose a time',
  details: 'Your details',
  review: 'Review & confirm',
}

const STEP_ORDER: WizardStep[] = ['date', 'time', 'details', 'review']

// Slots are generated/stored in UTC but business hours and every displayed
// time are IST (India Standard Time, UTC+5:30) — see availability.ts and
// 0014_ist_business_hours_and_slot_buffer.sql.
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  })
}

// Slot dates from fetchAvailableSlots are UTC calendar dates, and
// BookingCalendar runs with timeZone="UTC" (see BookingCalendar.tsx) so its
// selected/cell dates are UTC-anchored too — toISOString().slice(0, 10) is
// safe and consistent across both.
function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function StepProgress({ step }: { step: WizardStep }) {
  const currentIndex = STEP_ORDER.indexOf(step)
  return (
    <div className="mb-3 flex items-center gap-1.5">
      {STEP_ORDER.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors ${i <= currentIndex ? 'bg-studio-ink' : 'bg-studio-line'}`}
        />
      ))}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono-label mb-2.5 inline-flex items-center gap-1 text-[11px] uppercase text-studio-ink-soft transition-colors hover:text-studio-ink"
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  )
}

function BookingWidget({ serviceId, serviceName, durationMinutes, onBooked }: BookingWidgetProps) {
  const prefersReducedMotion = useReducedMotion()
  const stepTransition = { duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] as const }
  const {
    data: slots,
    loading,
    error,
  } = useFetch(() => fetchAvailableSlots(serviceId, durationMinutes), [serviceId, durationMinutes])

  const [step, setStep] = useState<WizardStep>('date')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState<MobileNumberValue>({ countryCode: '+91', digits: '' })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateBookingResult | null>(null)

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, TimeSlot[]>()
    for (const slot of slots ?? []) {
      const key = dateKey(new Date(slot.startsAt))
      const existing = grouped.get(key) ?? []
      existing.push(slot)
      grouped.set(key, existing)
    }
    return grouped
  }, [slots])

  // A date is selectable on the calendar only if it has at least one
  // non-booked slot — a fully-booked day still has slots in slotsByDate
  // (they're shown disabled if reached), but shouldn't be pickable from the
  // calendar step.
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    for (const [key, daySlots] of slotsByDate) {
      if (daySlots.some((slot) => !slot.isBooked)) dates.add(key)
    }
    return dates
  }, [slotsByDate])

  const slotsForSelectedDate = selectedDate ? (slotsByDate.get(dateKey(selectedDate)) ?? []) : []

  const messageTooLong = notes.length > MESSAGE_MAX_LENGTH
  const detailsValid =
    fullName.trim().length > 0 && mobile.digits.length === 10 && notes.trim().length > 0 && !messageTooLong

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setStep('time')
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot)
    setStep('details')
  }

  function handleDetailsContinue(e: FormEvent) {
    e.preventDefault()
    if (!detailsValid) return
    setStep('review')
  }

  async function handleConfirm() {
    if (!selectedSlot) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const booking = await createBooking({
        serviceId,
        startsAt: selectedSlot.startsAt,
        clientFullName: fullName.trim(),
        clientEmail: email.trim() || undefined,
        clientPhone: `${mobile.countryCode}${mobile.digits}`,
        notes: notes.trim(),
      })
      setResult(booking)
      onBooked?.(booking)
    } catch (err) {
      setSubmitError(
        err instanceof BookingApiError ? err.message : 'Something went wrong booking this slot. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10, scale: prefersReducedMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-studio-ink/30 bg-studio-bg-card-soft p-7 text-center"
      >
        <p className="font-mono-label text-xs uppercase text-studio-ink">Confirmed</p>
        <p className="font-sans mt-2 text-2xl font-bold text-studio-ink">
          {formatDateLabel(new Date(result.startsAt))} at {formatTimeLabel(result.startsAt)}
        </p>
        <p className="mt-2 text-sm text-studio-ink-soft">
          {email.trim()
            ? 'A confirmation has been sent to your email. You can reschedule or cancel from the link in that email at any time.'
            : "We've got your booking. Our team will reach out on the phone number you provided to confirm."}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-2xl border border-studio-line bg-white p-4 sm:p-5">
      <h2 className="font-sans text-lg font-bold text-studio-ink">Book {serviceName}</h2>
      <p className="mt-0.5 text-xs text-studio-ink-soft">
        {durationMinutes} minutes · {STEP_LABELS[step]}
      </p>

      <div className="mt-3">
        <StepProgress step={step} />

        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && availableDates.size === 0}
          emptyMessage="No slots available in the next two weeks — please check back soon or contact us directly."
          variant="clinical"
        />

        {!loading && !error && availableDates.size > 0 && (
          <AnimatePresence mode="wait">
            {step === 'date' && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -12 }}
                transition={stepTransition}
              >
                <BookingCalendar
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  dayHasAvailability={(date) => availableDates.has(dateKey(date))}
                  variant="clinical"
                />
              </motion.div>
            )}

            {step === 'time' && selectedDate && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -12 }}
                transition={stepTransition}
              >
                <BackButton onClick={() => setStep('date')} />
                <p className="font-mono-label text-[10px] uppercase text-studio-ink-soft">
                  {formatDateLabel(selectedDate)}
                </p>
                {slotsForSelectedDate.length === 0 ? (
                  <p className="mt-4 text-sm text-studio-ink-soft">No times left on this date. Please choose another.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {slotsForSelectedDate.map((slot, index) => (
                      <motion.button
                        key={slot.startsAt}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => handleSlotSelect(slot)}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: prefersReducedMotion ? 0 : index * 0.025 }}
                        whileHover={slot.isBooked || prefersReducedMotion ? undefined : { scale: 1.04 }}
                        whileTap={slot.isBooked || prefersReducedMotion ? undefined : { scale: 0.96 }}
                        className="font-mono-label rounded-full border border-studio-line px-3 py-1.5 text-[11px] uppercase text-studio-ink-soft transition-colors hover:border-studio-ink hover:text-studio-ink disabled:cursor-not-allowed disabled:border-studio-line/50 disabled:text-studio-ink-soft/35 disabled:line-through disabled:hover:border-studio-line/50"
                      >
                        {formatTimeLabel(slot.startsAt)}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'details' && selectedSlot && (
              <motion.form
                key="details"
                onSubmit={handleDetailsContinue}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -12 }}
                transition={stepTransition}
              >
                <BackButton onClick={() => setStep('time')} />

                <div className="flex items-center justify-between rounded-lg bg-studio-bg-card-soft px-3 py-2">
                  <p className="text-sm text-studio-ink">
                    {formatDateLabel(new Date(selectedSlot.startsAt))} at {formatTimeLabel(selectedSlot.startsAt)}
                  </p>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div>
                    <label htmlFor="booking-name" className={clinicalLabelClasses}>
                      Name
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={clinicalInputClasses}
                    />
                  </div>

                  <MobileNumberField id="booking-mobile" required value={mobile} onChange={setMobile} variant="clinical" />

                  <div>
                    <label htmlFor="booking-email" className={clinicalLabelClasses}>
                      Email (optional)
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={clinicalInputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-notes" className={clinicalLabelClasses}>
                      What would you like to talk about?
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={2}
                      required
                      maxLength={MESSAGE_MAX_LENGTH}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={clinicalInputClasses}
                    />
                    <p
                      className={`font-mono-label mt-0.5 text-right text-[10px] uppercase ${messageTooLong ? 'text-studio-ink' : 'text-studio-ink-soft'}`}
                    >
                      {notes.length}/{MESSAGE_MAX_LENGTH}
                    </p>
                  </div>
                </div>

                <Button type="submit" variant="clinical" disabled={!detailsValid} className="mt-3 w-full">
                  Continue
                </Button>
              </motion.form>
            )}

            {step === 'review' && selectedSlot && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -12 }}
                transition={stepTransition}
              >
                <BackButton onClick={() => setStep('details')} />

                <dl className="space-y-2 rounded-lg border border-studio-line p-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-studio-ink-soft">When</dt>
                    <dd className="text-right text-studio-ink">
                      {formatDateLabel(new Date(selectedSlot.startsAt))} at {formatTimeLabel(selectedSlot.startsAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-studio-ink-soft">Name</dt>
                    <dd className="text-right text-studio-ink">{fullName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-studio-ink-soft">Mobile</dt>
                    <dd className="text-right text-studio-ink">
                      {mobile.countryCode} {mobile.digits}
                    </dd>
                  </div>
                  {email.trim() && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-studio-ink-soft">Email</dt>
                      <dd className="text-right text-studio-ink">{email}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-studio-ink-soft">Message</dt>
                    <dd className="max-w-[70%] text-right text-studio-ink">{notes}</dd>
                  </div>
                </dl>

                {submitError && (
                  <p role="alert" className="mt-3 text-sm text-studio-ink">
                    {submitError}
                  </p>
                )}

                <Button onClick={handleConfirm} variant="clinical" disabled={submitting} className="mt-3 w-full">
                  {submitting ? 'Booking…' : 'Book Now'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default BookingWidget

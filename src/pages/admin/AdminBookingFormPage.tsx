import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import QueryState from '../../components/ui/QueryState'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import MobileNumberField, { type MobileNumberValue } from '../../components/ui/MobileNumberField'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices } from '../../lib/supabase/queries'
import { fetchStaffProfiles } from '../../lib/supabase/adminQueries'
import {
  fetchBookingById,
  createManualBooking,
  updateBooking,
  checkBookingOverlap,
} from '../../lib/supabase/adminBookingQueries'
import { BOOKING_STATUSES, type BookingStatus } from '../../lib/supabase/types'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rescheduled: 'Rescheduled',
  canceled: 'Canceled',
  completed: 'Completed',
  no_show: 'No-show',
}

/** <input type="datetime-local"> works in local time — convert to/from ISO explicitly. */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function AdminBookingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: services, loading: servicesLoading } = useFetch(fetchPublishedServices, [])
  const { data: staff } = useFetch(fetchStaffProfiles, [])
  const { data: existing, loading: existingLoading, error: existingError } = useFetch(
    () => (isEditing ? fetchBookingById(id!) : Promise.resolve(null)),
    [id],
  )

  const [serviceId, setServiceId] = useState('')
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [status, setStatus] = useState<BookingStatus>('confirmed')
  const [practitionerId, setPractitionerId] = useState('')
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState<MobileNumberValue>({ countryCode: '+91', digits: '' })
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setServiceId(existing.service_id)
    setStartsAtLocal(toDatetimeLocalValue(existing.starts_at))
    setDurationMinutes(
      Math.round((new Date(existing.ends_at).getTime() - new Date(existing.starts_at).getTime()) / 60_000),
    )
    setStatus(existing.status)
    setPractitionerId(existing.practitioner_id ?? '')
    setFullName(existing.client_full_name)
    setEmail(existing.client_email ?? '')
    setNotes(existing.notes ?? '')
    // client_phone is stored as one combined string (e.g. "+919123456789") —
    // MobileNumberField expects it split, so parse it back for editing.
    const match = existing.client_phone.match(/^(\+\d{1,3})(\d{10})$/)
    if (match) setMobile({ countryCode: match[1], digits: match[2] })
  }, [existing])

  const selectedService = useMemo(() => services?.find((s) => s.id === serviceId), [services, serviceId])

  useEffect(() => {
    if (selectedService?.default_duration_minutes && !isEditing) {
      setDurationMinutes(selectedService.default_duration_minutes)
    }
  }, [selectedService, isEditing])

  async function handleCheckOverlap() {
    if (!serviceId || !startsAtLocal) return
    const startsAt = new Date(startsAtLocal).toISOString()
    const endsAt = new Date(new Date(startsAtLocal).getTime() + durationMinutes * 60_000).toISOString()
    const warning = await checkBookingOverlap(serviceId, startsAt, endsAt, id)
    setOverlapWarning(warning)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!isEditing && !serviceId) {
      setSubmitError('Select a service.')
      return
    }

    if (mobile.digits.length !== 10) {
      setSubmitError('Enter a 10-digit mobile number.')
      return
    }

    setSubmitting(true)
    try {
      const startsAt = new Date(startsAtLocal).toISOString()
      const endsAt = new Date(new Date(startsAtLocal).getTime() + durationMinutes * 60_000).toISOString()
      const clientPhone = `${mobile.countryCode}${mobile.digits}`

      if (isEditing) {
        await updateBooking(id!, {
          startsAt,
          endsAt,
          status,
          practitionerId: practitionerId || null,
          notes: notes || null,
          clientFullName: fullName,
          clientPhone,
          clientEmail: email || null,
        })
      } else {
        await createManualBooking({
          serviceId,
          practitionerId: practitionerId || null,
          startsAt,
          endsAt,
          status,
          clientFullName: fullName,
          clientPhone,
          clientEmail: email || undefined,
          notes: notes || undefined,
        })
      }
      navigate('/admin/bookings')
    } catch {
      setSubmitError(`Failed to ${isEditing ? 'update' : 'create'} booking. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const loading = servicesLoading || (isEditing && existingLoading)

  return (
    <AdminLayout title={isEditing ? 'Edit booking' : 'New booking'}>
      <button
        type="button"
        onClick={() => navigate('/admin/bookings')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to bookings
      </button>

      <QueryState loading={loading} error={existingError} />

      {!loading && !existingError && (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <Select
              id="booking-service"
              label="Service"
              disabled={isEditing}
              value={serviceId}
              onChange={setServiceId}
              placeholder="Select a service"
              options={(services ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="booking-starts" className={labelClasses}>
                Date &amp; time
              </label>
              <input
                id="booking-starts"
                type="datetime-local"
                required
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                onBlur={handleCheckOverlap}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="booking-duration" className={labelClasses}>
                Duration (minutes)
              </label>
              <input
                id="booking-duration"
                type="number"
                min={5}
                step={5}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                onBlur={handleCheckOverlap}
                className={inputClasses}
              />
            </div>
          </div>

          {overlapWarning && (
            <p role="alert" className="text-sm text-terracotta">
              {overlapWarning}
            </p>
          )}

          <div>
            <Select
              id="booking-status"
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as BookingStatus)}
              options={BOOKING_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            />
          </div>

          <div>
            <Select
              id="booking-practitioner"
              label="Practitioner (optional)"
              value={practitionerId}
              onChange={setPractitionerId}
              options={[
                { value: '', label: 'Unassigned / whole team' },
                ...(staff ?? []).map((s) => ({ value: s.id, label: s.full_name ?? s.role })),
              ]}
            />
          </div>

          <div>
            <label htmlFor="booking-name" className={labelClasses}>
              Client name
            </label>
            <input
              id="booking-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
            />
          </div>

          <MobileNumberField required value={mobile} onChange={setMobile} />

          <div>
            <label htmlFor="booking-email" className={labelClasses}>
              Email (optional)
            </label>
            <input
              id="booking-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="booking-notes" className={labelClasses}>
              Notes (optional)
            </label>
            <textarea
              id="booking-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClasses}
            />
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create booking'}
          </Button>
        </form>
      )}
    </AdminLayout>
  )
}

export default AdminBookingFormPage

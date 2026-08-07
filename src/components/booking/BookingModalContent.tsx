import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { supabase } from '../../lib/supabase/client'
import type { Service } from '../../lib/supabase/types'
import QueryState from '../ui/QueryState'
import BookingWidget from './BookingWidget'

async function fetchBookableServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .eq('is_bookable', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

interface BookingModalContentProps {
  onBooked: () => void
}

/**
 * Content for the global "Book a Call" modal (header/footer/hero/sticky
 * CTA). Unlike the per-service booking widget on ServiceDetailPage, this
 * isn't scoped to one service — it lists whichever services are bookable
 * and lets the visitor pick, defaulting straight to the widget when only
 * one exists (true today: just "1-on-1 Website Help").
 */
function BookingModalContent({ onBooked }: BookingModalContentProps) {
  const { data: services, loading, error } = useFetch(fetchBookableServices, [])
  const [selected, setSelected] = useState<Service | null>(null)

  const active = selected ?? (services?.length === 1 ? services[0] : null)

  // BookingWidget renders its own "Book <service>" heading + step progress,
  // so this component's heading is only shown before a service is chosen
  // (the picker list, or loading/error/empty states) to avoid a duplicate
  // heading stack once a service is active.
  return (
    <div>
      {!active && (
        <>
          <p className="font-mono-label text-xs uppercase text-teal">Book a Call</p>
          <h2 className="font-display mt-1.5 text-xl text-ink">Choose a call type</h2>
        </>
      )}

      <div className={active ? '' : 'mt-4'}>
        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && (services?.length ?? 0) === 0}
          emptyMessage="No bookable calls are available right now — please reach out via the contact form instead."
        />

        {!loading && !error && services && services.length > 1 && !active && (
          <div className="space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelected(service)}
                className="w-full rounded-lg border border-ink/10 p-4 text-left transition-colors hover:border-teal"
              >
                <p className="font-display text-lg text-ink">{service.name}</p>
                {service.short_description && (
                  <p className="mt-1 text-sm text-ink-soft">{service.short_description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {active && (
          // BookingWidget shows its own in-place confirmation state;
          // auto-close the modal a moment later so the visitor sees the
          // confirmation before it disappears, rather than closing instantly.
          <BookingWidget
            serviceId={active.id}
            serviceName={active.name}
            durationMinutes={active.default_duration_minutes ?? 30}
            onBooked={() => setTimeout(onBooked, 2500)}
          />
        )}
      </div>
    </div>
  )
}

export default BookingModalContent

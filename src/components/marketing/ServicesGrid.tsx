import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'

/**
 * Rule C: renders entirely from the services table, no per-service JSX
 * branching. Adding a new service or niche framing later is a content
 * change in Supabase, not a code change here.
 */
function ServicesGrid() {
  const { data: services, loading, error } = useFetch(fetchPublishedServices, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="What We Do" title="Built for how patients actually book." />

      <QueryState loading={loading} error={error} empty={!loading && !error && services?.length === 0} />

      {!loading && !error && services && services.length > 0 && (
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              className="group relative bg-cream p-7 text-left transition-colors hover:bg-sage"
            >
              <span className="font-mono-label text-[10px] text-ink-soft">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-3 text-xl text-ink">{service.name}</h3>
              {service.short_description && (
                <p className="mt-2 text-sm text-ink-soft">{service.short_description}</p>
              )}
              <span className="font-mono-label mt-4 inline-block text-[10px] uppercase text-teal opacity-0 transition-opacity group-hover:opacity-100">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default ServicesGrid

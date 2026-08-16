import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

/**
 * Rule C: renders entirely from the services table, no per-service JSX
 * branching. Adding a new service or niche framing later is a content
 * change in Supabase, not a code change here.
 */
function ServicesGrid() {
  const { data: services, loading, error } = useFetch(fetchPublishedServices, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="What we do" title="Six ways in. One outcome." variant="clinical" />

      <QueryState loading={loading} error={error} empty={!loading && !error && services?.length === 0} />

      {!loading && !error && services && services.length > 0 && (
        <Reveal className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-studio-line bg-studio-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.id} as="span" index={index}>
                <Link
                  to={`/services/${service.slug}`}
                  className="group block h-full bg-white p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-studio-bg-card-soft"
                >
                  <span className="font-mono text-[11px] text-studio-ink-faint transition-colors group-hover:text-studio-ink">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-studio-ink">{service.name}</h3>
                  {service.short_description && (
                    <p className="mt-2 text-sm leading-relaxed text-studio-ink-soft">
                      {service.short_description}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}
    </section>
  )
}

export default ServicesGrid

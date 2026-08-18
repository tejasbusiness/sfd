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
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="What we do" title="Six ways in. One outcome." variant="supahub" />

      <QueryState loading={loading} error={error} empty={!loading && !error && services?.length === 0} variant="supahub" />

      {!loading && !error && services && services.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} index={index}>
              <Link
                to={`/services/${service.slug}`}
                className="group block h-full rounded-[24px] border border-supahub-mist bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(134,47,231,0.25)]"
              >
                <span className="text-xs font-bold text-supahub-lavender-mist">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="font-bricolage mt-3.5 text-xl font-semibold tracking-[-0.02em] text-supahub-ink">
                  {service.name}
                </h3>
                {service.short_description && (
                  <p className="mt-2.5 text-sm leading-relaxed text-supahub-slate">{service.short_description}</p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

export default ServicesGrid

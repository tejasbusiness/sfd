import { useFetch } from '../../hooks/useFetch'
import { fetchFeaturedTestimonials } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

function StarRow() {
  return (
    <div className="mb-4 flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-studio-ink">
          <path d="M10 1l2.6 6h6.4l-5.2 3.8 2 6.2-5.8-4-5.8 4 2-6.2L1 7h6.4z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialsSection() {
  const { data: testimonials, loading, error } = useFetch(fetchFeaturedTestimonials, [])

  const hasContent = !loading && !error && testimonials && testimonials.length > 0

  if (!loading && !error && (!testimonials || testimonials.length === 0)) {
    return null
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="In their words" title="Trusted by practices like yours." variant="clinical" />

      <QueryState loading={loading} error={error} />

      {hasContent && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={t.id} index={index}>
              <figure className="h-full rounded-2xl border border-studio-line bg-white p-7">
                <StarRow />
                <blockquote className="text-[15px] leading-relaxed text-studio-ink">"{t.quote}"</blockquote>
                <figcaption className="font-mono-label mt-5 text-[11px] uppercase text-studio-ink-soft">
                  {t.client_name}
                  {t.practice_name && <span className="text-studio-ink"> · {t.practice_name}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

export default TestimonialsSection

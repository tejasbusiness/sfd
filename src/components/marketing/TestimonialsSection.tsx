import { useFetch } from '../../hooks/useFetch'
import { fetchFeaturedTestimonials } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'

function TestimonialsSection() {
  const { data: testimonials, loading, error } = useFetch(fetchFeaturedTestimonials, [])

  const hasContent = !loading && !error && testimonials && testimonials.length > 0

  if (!loading && !error && (!testimonials || testimonials.length === 0)) {
    return null
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Testimonials" title="What practices say." />

      <QueryState loading={loading} error={error} />

      {hasContent && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-ink/10 bg-cream p-7">
              <blockquote className="font-display text-lg leading-snug text-ink">
                "{t.quote}"
              </blockquote>
              <figcaption className="font-mono-label mt-5 text-[10px] uppercase text-ink-soft">
                {t.client_name}
                {t.practice_name && <span className="text-teal"> · {t.practice_name}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}

export default TestimonialsSection

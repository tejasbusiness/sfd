import { useFetch } from '../../hooks/useFetch'
import { fetchFeaturedTestimonials } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

const AVATAR_ACCENTS = [
  'var(--color-supahub-violet)',
  'var(--color-supahub-hot-pink)',
  'var(--color-supahub-amber)',
  'var(--color-supahub-ultra-violet)',
]

function StarRow() {
  return (
    <div className="mt-3.5 flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#f59e0b]">
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
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="In their words" title="Trusted by practices like yours." variant="supahub" />

      <QueryState loading={loading} error={error} variant="supahub" />

      {hasContent && (
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {testimonials.map((t, index) => {
            const accent = AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]
            const initials = t.client_name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            return (
              <Reveal key={t.id} index={index} className="mb-4 break-inside-avoid">
                <figure className="relative rounded-[20px] border border-supahub-mist bg-white p-6">
                  <span className="absolute right-5 top-4 font-serif text-[28px] leading-none text-supahub-mist" aria-hidden="true">
                    &rdquo;
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ background: accent }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <div>
                      <figcaption className="text-base font-semibold text-supahub-ink">{t.client_name}</figcaption>
                      {t.practice_name && <p className="text-sm text-supahub-slate">{t.practice_name}</p>}
                    </div>
                  </div>
                  <blockquote className="mt-4 text-[15px] leading-relaxed text-supahub-ink">"{t.quote}"</blockquote>
                  <StarRow />
                </figure>
              </Reveal>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TestimonialsSection

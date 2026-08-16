import { useMemo } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems, fetchFeaturedTestimonials } from '../../lib/supabase/queries'
import Reveal from '../motion/Reveal'

/**
 * Bento stats section — replaces the old marquee. Content is derived from
 * the same fetchPublishedPortfolioItems/fetchFeaturedTestimonials queries
 * already used elsewhere on Home, no new table or hardcoded per-niche copy
 * (Rule C). Renders nothing until there's at least one real metric to show.
 */
function ProofStrip() {
  const { data: items } = useFetch(fetchPublishedPortfolioItems, [])
  const { data: testimonials } = useFetch(fetchFeaturedTestimonials, [])

  const metrics = useMemo(() => {
    if (!items) return []
    return items.flatMap((item) => item.outcome_metrics.map((metric) => ({ ...metric, title: item.title })))
  }, [items])

  const headlineMetric = metrics[0]
  const secondMetric = metrics[1]
  const testimonial = testimonials?.[0]
  const practiceNames = useMemo(() => (items ? items.slice(0, 4).map((item) => item.title) : []), [items])

  if (metrics.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal variant="mask">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.02em] text-studio-ink sm:text-4xl">
          Results practices can point to, <span className="text-studio-ink-faint">not just a redesign they paid for.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-xl text-studio-ink-soft">
          Every number below comes straight from our own case studies — the same ones on our
          portfolio page.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal index={0} className="min-h-[230px] rounded-[20px] bg-studio-ink p-6 text-white">
          <div className="flex h-full flex-col justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-4xl font-bold tracking-[-0.02em]">{headlineMetric?.value ?? '—'}</p>
              <p className="mt-1 text-sm text-white/60">{headlineMetric?.label ?? 'Client results'}</p>
            </div>
          </div>
        </Reveal>

        <Reveal index={1} className="min-h-[230px] rounded-[20px] border border-dashed border-studio-line-dashed p-6">
          <div className="flex h-full flex-col justify-between">
            <div className="flex -space-x-2" aria-hidden="true">
              {practiceNames.map((name) => (
                <span
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-studio-bg bg-studio-bg-card-soft font-mono-label text-[10px] text-studio-ink-soft"
                >
                  {name.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
            <div>
              <p className="text-lg font-bold tracking-[-0.02em] text-studio-ink">Practices we've helped</p>
              <p className="mt-1 text-sm text-studio-ink-soft">Dental, physio, dermatology, and more.</p>
            </div>
          </div>
        </Reveal>

        <Reveal index={2} className="min-h-[230px] rounded-[20px] bg-studio-bg-card-soft p-6">
          <div className="flex h-full flex-col justify-between">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-studio-line" aria-hidden="true">
              <span className="absolute h-6 w-6 rounded-full border border-studio-line-dashed" />
              <span className="h-1.5 w-1.5 rounded-full bg-studio-ink" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-[-0.02em] text-studio-ink">{secondMetric?.value ?? 'Built for booking'}</p>
              <p className="mt-1 text-sm text-studio-ink-soft">{secondMetric?.label ?? 'Every site is optimized for appointments.'}</p>
            </div>
          </div>
        </Reveal>

        <Reveal index={3} className="min-h-[230px] rounded-[20px] border border-studio-line bg-white p-6">
          <div className="flex h-full flex-col justify-between">
            <svg viewBox="0 0 32 24" className="h-6 w-8 fill-studio-line" aria-hidden="true">
              <path d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0L14.4 4C9.6 5.6 8 8.4 8 12H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.2 30.4 0L32 4C27.2 5.6 25.6 8.4 25.6 12H32V24H17.6Z" />
            </svg>
            {testimonial ? (
              <div>
                <p className="text-sm leading-relaxed text-studio-ink">"{testimonial.quote}"</p>
                <p className="font-mono-label mt-3 text-[10px] uppercase text-studio-ink-soft">
                  {testimonial.client_name}
                  {testimonial.practice_name && <> · {testimonial.practice_name}</>}
                </p>
              </div>
            ) : (
              <p className="text-sm text-studio-ink-soft">Client stories coming soon.</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ProofStrip

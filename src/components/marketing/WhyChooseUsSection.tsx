import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems } from '../../lib/supabase/queries'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Built for Patient Bookings',
    description: 'Every layout and page is designed around one goal — turning visitors into booked appointments.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <rect x="6" y="2.5" width="12" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Healthcare & Wellness Only',
    description: "We work exclusively with practices like yours, so every site starts from what actually converts patients.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M13 3L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Fast Turnaround',
    description: 'We work efficiently so your new site is live and bringing in patients quickly.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Ongoing Support',
    description: "We're always here to help with updates, questions, and technical support.",
  },
]

/**
 * Content is data-driven from fetchPublishedPortfolioItems (Rule C) — the
 * headline stat is a real count of published case studies, not an
 * illustrative/hardcoded figure.
 */
function WhyChooseUsSection() {
  const { data: items, loading } = useFetch(fetchPublishedPortfolioItems, [])
  const prefersReducedMotion = useReducedMotion()

  const practiceCount = useMemo(() => items?.length ?? 0, [items])

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Why choose us"
        title="Why Healthcare Professionals Choose SynergyFirst Digital"
        align="left"
        variant="clinical"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal delay={0.08}>
            <p className="max-w-lg text-studio-ink-soft">
              Having a great website matters. At SynergyFirst Digital, we believe every practice
              deserves a site that actually brings in patients — without the generic templates or
              guesswork.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 max-w-lg text-studio-ink-soft">
              Our team focuses exclusively on healthcare and wellness practices, so we understand
              what makes a visitor pick up the phone or book online.
            </p>
          </Reveal>

          <ul className="mt-8 flex flex-col gap-3">
            {REASONS.map((reason, index) => (
              <Reveal key={reason.title} as="li" index={index}>
                <motion.div
                  className="flex items-start gap-4 rounded-2xl p-3 -m-3 transition-colors duration-300 hover:bg-white"
                  whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-studio-bg-card-soft text-studio-ink shadow-[0_1px_2px_rgba(20,20,20,0.06)]"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.12, rotate: -6, backgroundColor: '#141414', color: '#ffffff' }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden="true"
                  >
                    {reason.icon}
                  </motion.span>
                  <div>
                    <p className="font-bold tracking-[-0.02em] text-studio-ink">{reason.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-studio-ink-soft">{reason.description}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal variant="fade" delay={0.1} className="lg:pt-2">
          <motion.div
            className="group relative overflow-hidden rounded-[20px] bg-studio-ink p-8 text-white sm:p-10"
            initial={{ boxShadow: '0 8px 24px -12px rgba(20,20,20,0.35)' }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { y: -6, scale: 1.015, boxShadow: '0 28px 56px -16px rgba(20,20,20,0.55)' }
            }
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#1c4ed8] opacity-0 blur-[60px]"
              aria-hidden="true"
              whileHover={prefersReducedMotion ? undefined : { opacity: 0.3, scale: 1.2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <p className="relative text-5xl font-bold tracking-[-0.02em] sm:text-6xl">
              {loading ? (
                <span className="inline-block h-[1em] w-24 animate-pulse rounded bg-white/10 align-middle" />
              ) : practiceCount > 0 ? (
                `${practiceCount}+`
              ) : (
                'Coming soon'
              )}
            </p>
            <p className="relative mt-3 font-bold text-[#9fc0ff]">Automation for Healthcare Professionals!</p>
            <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              From booking to follow-up, we build the automation that puts your clinic on auto-pilot!
              — that's the SynergyFirst Digital difference.
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

export default WhyChooseUsSection

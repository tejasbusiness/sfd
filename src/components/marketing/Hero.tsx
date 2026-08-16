import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useBookingModal } from '../../context/BookingModalContext'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems } from '../../lib/supabase/queries'
import type { PortfolioItem } from '../../lib/supabase/types'
import NicheStrip from './NicheStrip'
import AutomationOrbit from './AutomationOrbit'
import officeHero from '../../assets/office-hero.jpg'

const headlineMaskVariants = {
  hidden: { y: '110%' },
  shown: { y: 0 },
}

const FALLBACK_TRUST_NAMES = 'Riverside Dental · Clearview Physio · Sage Wellness'

interface CaseStudyPreviewCardProps {
  items: PortfolioItem[] | null
  loading: boolean
  error: unknown
}

function CaseStudyPreviewCard({ items, loading, error }: CaseStudyPreviewCardProps) {
  const item = items?.[0]
  const metric = item?.outcome_metrics?.[0]

  return (
    <div className="w-full max-w-[280px] overflow-hidden rounded-[20px] border border-studio-line bg-white shadow-[0_20px_50px_-20px_rgba(20,20,20,0.25)]">
      <div className="flex aspect-[4/3] flex-col justify-end bg-studio-ink p-4 text-white">
        {!loading && !error && metric ? (
          <p className="text-2xl font-bold tracking-[-0.02em]">{metric.value}</p>
        ) : (
          <p className="text-2xl font-bold tracking-[-0.02em]">Real results</p>
        )}
        {!loading && !error && metric ? (
          <p className="mt-0.5 text-xs text-white/60">{metric.label}</p>
        ) : (
          <p className="mt-0.5 text-xs text-white/60">for practices like yours</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <p className="text-sm font-medium text-studio-ink">
          {!loading && !error && item ? item.title : 'Case studies coming soon'}
        </p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-studio-bg-card-soft text-studio-ink" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}

function Hero() {
  const { openBookingModal } = useBookingModal()
  const prefersReducedMotion = useReducedMotion()
  const { data: items, loading, error } = useFetch(fetchPublishedPortfolioItems, [])

  const trustNames = items && items.length > 0 ? items.slice(0, 3).map((item) => item.title).join(' · ') : FALLBACK_TRUST_NAMES

  const btnX = useMotionValue(0)
  const btnY = useMotionValue(0)
  const btnSpringX = useSpring(btnX, { stiffness: 300, damping: 20 })
  const btnSpringY = useSpring(btnY, { stiffness: 300, damping: 20 })

  function handleMagneticMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    btnX.set((e.clientX - rect.left - rect.width / 2) * 0.25)
    btnY.set((e.clientY - rect.top - rect.height / 2) * 0.25)
  }

  function handleMagneticLeave() {
    btnX.set(0)
    btnY.set(0)
  }

  return (
    <section className="relative px-3 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-mono-label flex items-center gap-2 text-xs text-studio-ink-faint"
            >
              <span className="h-[2px] w-5 bg-studio-ink-faint" />
              We Build..
            </motion.p>

            <h1 className="mt-4 text-[2rem] leading-[1.04] tracking-[-0.02em] sm:text-6xl lg:text-[3rem]">
              {[
                { text: 'Websites that book patients.', weight: 'font-light text-studio-ink-faint' },
                { text: 'Automation that keeps them.', weight: 'font-bold text-studio-ink' },
              ].map((line, i) => (
                <span key={line.text} className="block overflow-hidden">
                  <motion.span
                    className={`inline-block ${line.weight}`}
                    initial="hidden"
                    animate="shown"
                    variants={prefersReducedMotion ? { hidden: { y: 0 }, shown: { y: 0 } } : headlineMaskVariants}
                    transition={{ duration: 0.9, delay: 0.35 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-studio-ink-soft"
            >
              We build conversion-focused websites and the automation behind them — booking,
              follow-up, and patient communication — exclusively for Healthcare & Wellness Professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <motion.button
                type="button"
                onClick={openBookingModal}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                style={{ x: btnSpringX, y: btnSpringY }}
                className="flex items-center gap-2 rounded-full bg-studio-ink py-1.5 pl-6 pr-1.5 text-sm font-medium text-white transition-colors hover:brightness-110"
              >
                Book a Call
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-studio-ink" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </motion.button>
              <a href="/portfolio" className="text-sm font-medium text-studio-ink underline decoration-studio-line decoration-2 underline-offset-4 transition-colors hover:decoration-studio-ink">
                See Our Work
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mt-6"
            >
              <NicheStrip />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden justify-end lg:flex"
          >
            <AutomationOrbit />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 lg:mt-14"
        >
          <div className="relative aspect-[16/9.5] w-full overflow-hidden rounded-[28px] sm:aspect-[21/10]">
            <img
              src={officeHero}
              alt="The SynergyFirst Digital studio"
              className="h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(234,234,231,0.25) 0%, rgba(20,20,20,0) 38%, rgba(20,20,20,0.55) 100%)',
              }}
              aria-hidden="true"
            />
            <div className="absolute bottom-0 left-0 max-w-sm p-5 text-white sm:p-8">
              <p className="text-sm leading-relaxed text-white/85">
                Trusted by dental, physio, and wellness practices to design and run websites that
                turn visitors into booked appointments.
              </p>
              <p className="font-mono-label mt-3 text-[11px] uppercase text-white/60">
                {trustNames}
              </p>
            </div>
          </div>

          <div className="absolute -top-6 right-4 lg:hidden">
            <CaseStudyPreviewCard items={items} loading={loading} error={error} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

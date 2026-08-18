import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices, fetchPublishedPortfolioItems } from '../../lib/supabase/queries'

// Fallback only — used when no published service/portfolio item has any
// niche_tags yet, so the strip never renders empty. Matches the target
// niche list from docs/01-overview-and-stack.md, not invented copy.
const FALLBACK_NICHES = [
  'Dentists',
  'Dermatologists',
  'Physio & Chiro',
  'Pediatricians',
  'Eye Clinics',
  'Dietitians',
  'Fitness & Wellness',
]

// Rotating accent per pill, purely decorative — cycles through the Supahub
// palette so the row reads as lively/varied rather than one flat color.
const ACCENTS = [
  '#862fe7',
  '#e22ba4',
  '#dc5f05',
  '#5f259e',
  '#0f9e85',
  '#2563eb',
]

// niche_tags are stored as slugs (e.g. "eye-clinic") — this is presentation
// formatting only, not new content, so it stays Rule C-compliant.
function formatNicheLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface NicheStripProps {
  className?: string
}

function NicheStrip({ className = '' }: NicheStripProps) {
  const { data: services } = useFetch(fetchPublishedServices, [])
  const { data: portfolioItems } = useFetch(fetchPublishedPortfolioItems, [])
  const prefersReducedMotion = useReducedMotion()

  const niches = useMemo(() => {
    const tags = new Set<string>()
    services?.forEach((service) => service.niche_tags.forEach((tag) => tags.add(tag)))
    portfolioItems?.forEach((item) => item.niche_tags.forEach((tag) => tags.add(tag)))
    return tags.size > 0 ? Array.from(tags).map(formatNicheLabel) : FALLBACK_NICHES
  }, [services, portfolioItems])

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-supahub-slate">Built for</span>
      {niches.map((niche, index) => {
        const accent = ACCENTS[index % ACCENTS.length]
        return (
          <motion.span
            key={niche}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.85 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: [0, -4, 0], scale: 1 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.3, delay: 0.04 * index }
                : {
                    opacity: { duration: 0.4, delay: 0.5 + 0.06 * index, ease: [0.16, 1, 0.3, 1] },
                    scale: { duration: 0.4, delay: 0.5 + 0.06 * index, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 + 0.15 * index },
                  }
            }
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -4,
                    scale: 1.08,
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    borderColor: '#111827',
                    boxShadow: `0 10px 22px -10px ${accent}80`,
                    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                  }
            }
            className="group flex cursor-default items-center gap-1 rounded-full border border-supahub-mist bg-white px-2.5 py-1 text-[11px] font-semibold text-supahub-slate shadow-[0_1px_4px_rgba(17,24,39,0.05)]"
          >
            <span
              className="h-1 w-1 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
            {niche}
          </motion.span>
        )
      })}
    </div>
  )
}

export default NicheStrip

import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedServices } from '../../lib/supabase/queries'

// Rotating icon-badge palette, purely decorative — services.icon has no
// established rendering convention in this codebase (unused elsewhere), so
// this cycles a small set of colored badges rather than guessing a format.
const BADGES = [
  { bg: 'bg-[#e5edff]', fg: 'text-[#1c4ed8]' },
  { bg: 'bg-[#e3f7ea]', fg: 'text-[#1a9b4d]' },
  { bg: 'bg-[#f3e8ff]', fg: 'text-[#9333ea]' },
  { bg: 'bg-[#fff4dd]', fg: 'text-[#c2790a]' },
  { bg: 'bg-[#ffe8e6]', fg: 'text-[#e0483c]' },
  { bg: 'bg-[#e0f7fa]', fg: 'text-[#0891b2]' },
]

// Keyed by service slug so each entry gets a distinct, relevant icon.
// Falls back to a generic spark icon for any slug not covered here, so a
// newly added service never renders blank — matches the fallback pattern
// already used elsewhere in this session (NicheStrip, Hero).
const ICON_PATHS: Record<string, ReactElement> = {
  'web-design': (
    <>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 20.5h6M12 17v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  seo: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.5 19.5L15.2 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12l1.2-2.5L12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'ai-solutions': (
    <path
      d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  'one-on-one-help': (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 9.5l4-2.3v9.6l-4-2.3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  'social-media-marketing': (
    <>
      <circle cx="6" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.8L16 7M8 13.2l8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'whatsapp-business-api': (
    <path
      d="M12 3.5A8.5 8.5 0 004.6 16.7L3.5 20.5l3.9-1a8.5 8.5 0 104.6-16z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
}

const FALLBACK_ICON = (
  <path d="M13 3L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
)

function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {ICON_PATHS[slug] ?? FALLBACK_ICON}
    </svg>
  )
}

interface ServicesNavMenuProps {
  navLinkClassName: string
}

function ServicesNavMenu({ navLinkClassName }: ServicesNavMenuProps) {
  const { data: services } = useFetch(fetchPublishedServices, [])
  const [open, setOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link to="/services" className={`flex items-center gap-1 ${navLinkClassName}`}>
        Services
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3 w-3"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </Link>

      <AnimatePresence>
        {open && services && services.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-full z-50 mt-3 w-[380px] -translate-x-1/2 rounded-2xl border border-studio-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(20,20,20,0.25)]"
          >
            {services.map((service, index) => {
              const badge = BADGES[index % BADGES.length]
              return (
                <Link
                  key={service.id}
                  to={`/services/${service.slug}`}
                  className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors duration-200 hover:bg-studio-bg-card-soft"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badge.bg} ${badge.fg} transition-transform duration-200 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    <ServiceIcon slug={service.slug} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold tracking-[-0.01em] text-studio-ink">{service.name}</span>
                    {service.short_description && (
                      <span className="mt-0.5 block text-xs leading-snug text-studio-ink-soft">
                        {service.short_description}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ServicesNavMenu

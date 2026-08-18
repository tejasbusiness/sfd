import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useBookingModal } from '../../context/BookingModalContext'

const SPARK_PATH = 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'

interface DropdownItem {
  label: string
  to: string
  chip: 'violet' | 'pink' | 'amber' | 'mint' | 'green' | 'blue' | 'teal'
  icon: ReactNode
  /** Set when the target route doesn't exist yet — flagged in the build report. */
  stub?: boolean
}

const CHIP_CLASSES: Record<DropdownItem['chip'], string> = {
  violet: 'bg-supahub-lavender-field text-supahub-violet',
  pink: 'bg-[#ffe4f8] text-supahub-hot-pink',
  amber: 'bg-[#fdead9] text-supahub-amber',
  mint: 'bg-supahub-mint text-[#0f9e85]',
  green: 'bg-[#dcfce7] text-[#16a34a]',
  blue: 'bg-[#dbeafe] text-[#2563eb]',
  teal: 'bg-[#cffafe] text-[#0891b2]',
}

// Real slugs match ServicesNavMenu's ICON_PATHS keys / seeded service slugs.
// Service detail routing is data-driven (/services/:slug), so these resolve
// once the corresponding row exists in Supabase.
const SERVICE_ITEMS: DropdownItem[] = [
  {
    label: 'Web Design',
    to: '/services/web-design',
    chip: 'violet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: 'SEO',
    to: '/services/seo',
    chip: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 13l4-4 4 3 8-8M20 4h-4M20 4v4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'AI Automation',
    to: '/services/ai-solutions',
    chip: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Social Media Marketing',
    to: '/services/social-media-marketing',
    chip: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 8.5h18M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp Business API',
    to: '/services/whatsapp-business-api',
    chip: 'mint',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.35-9.3-8.8C1.2 8.9 3 5.6 6.6 5.1c2-.3 3.6.7 5.4 2.9 1.8-2.2 3.4-3.2 5.4-2.9 3.6.5 5.4 3.8 3.9 7.1C19 16.65 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: '1-on-1 Website Help',
    to: '/services/one-on-one-help',
    chip: 'amber',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.2 3.2 0 0 1 0 6M21 20c0-2.7-1.8-5-4.3-5.7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

// "Case Studies" has no distinct route from Portfolio in this codebase yet —
// both point at /portfolio (flagged in the build report as a nav mismatch).
const WORK_ITEMS: DropdownItem[] = [
  {
    label: 'Case Studies',
    to: '/portfolio',
    chip: 'violet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19V5a1 1 0 0 1 1-1h9l6 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14 4v5a1 1 0 0 0 1 1h5M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    to: '/portfolio',
    chip: 'teal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="3" width="8" height="5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="11" width="8" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="13" width="8" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
]

// Image Resizer and Invoice Generator have no page/route in this codebase
// yet — stubbed to "#" and flagged in the build report as nav mismatches.
const TOOLS_ITEMS: DropdownItem[] = [
  {
    label: 'Website Prompt Generator',
    to: '/website-prompt-generator',
    chip: 'violet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Image Resizer',
    to: '#',
    stub: true,
    chip: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Invoice Generator',
    to: '#',
    stub: true,
    chip: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 12h6M9 15.5h6M9 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function NavDropdownLink({ item }: { item: DropdownItem }) {
  return (
    <Link
      to={item.to}
      className="group flex items-center gap-2.5 whitespace-nowrap rounded-[10px] p-2 text-sm font-medium text-supahub-graphite transition-colors hover:bg-supahub-fog hover:text-supahub-ink"
    >
      <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] ${CHIP_CLASSES[item.chip]}`}>
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
      </span>
      {item.label}
    </Link>
  )
}

interface NavDropdownProps {
  label: string
  items: DropdownItem[]
}

function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 py-1 text-[15px] font-medium text-supahub-ink transition-colors hover:text-supahub-violet"
      >
        {label}
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3 w-3"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-[calc(100%+16px)] z-50 min-w-[248px] -translate-x-1/2 rounded-2xl border border-supahub-mist bg-white p-2 shadow-[0_20px_40px_-16px_rgba(17,24,39,0.18)]"
          >
            {items.map((item) => (
              <NavDropdownLink key={item.label} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SiteHeader() {
  const { openBookingModal } = useBookingModal()
  const prefersReducedMotion = useReducedMotion()

  return (
    <header className="sticky top-0 z-40 border-b border-supahub-mist bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-[17px] font-bold text-supahub-ink">
          <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px] text-supahub-violet">
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
          SynergyFirst
        </Link>

        <span className="flex-1" />

        <nav className="hidden items-center gap-5 min-[1081px]:flex">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-[15px] font-medium transition-colors hover:text-supahub-violet ${isActive ? 'text-supahub-violet' : 'text-supahub-ink'}`
            }
          >
            About
          </NavLink>
          <NavDropdown label="Service" items={SERVICE_ITEMS} />
          <NavDropdown label="Our Work" items={WORK_ITEMS} />
          <NavDropdown label="Free Tools" items={TOOLS_ITEMS} />
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `text-[15px] font-medium transition-colors hover:text-supahub-violet ${isActive ? 'text-supahub-violet' : 'text-supahub-ink'}`
            }
          >
            Pricing
          </NavLink>
          {/* No Enterprise page exists yet — stubbed to "#", flagged in the build report. */}
          <a href="#" className="text-[15px] font-medium text-supahub-ink transition-colors hover:text-supahub-violet">
            Enterprise
          </a>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `text-[15px] font-medium transition-colors hover:text-supahub-violet ${isActive ? 'text-supahub-violet' : 'text-supahub-ink'}`
            }
          >
            Contact Us
          </NavLink>
        </nav>

        <motion.button
          type="button"
          onClick={openBookingModal}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-supahub-violet px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_0_0_1px_rgba(11,61,121,0.16)_inset] hover:brightness-105"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
          Book a Call
        </motion.button>
      </div>
    </header>
  )
}

export default SiteHeader

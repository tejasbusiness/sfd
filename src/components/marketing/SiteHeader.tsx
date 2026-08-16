import { Link, NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useBookingModal } from '../../context/BookingModalContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'text-studio-ink' : 'text-studio-ink-soft hover:text-studio-ink'}`

function SiteHeader() {
  const { openBookingModal } = useBookingModal()
  const prefersReducedMotion = useReducedMotion()

  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-studio-line bg-white/80 px-4 py-2.5 shadow-[0_8px_30px_-14px_rgba(20,20,20,0.15)] backdrop-blur-md sm:px-5">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-studio-ink">
          <span className="h-5 w-5 rounded-full border-2 border-studio-ink" aria-hidden="true" />
          SynergyFirst
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/services" className={navLinkClass}>
            Services
          </NavLink>
          <NavLink to="/portfolio" className={navLinkClass}>
            Portfolio
          </NavLink>
          <NavLink to="/pricing" className={navLinkClass}>
            Pricing
          </NavLink>
          <NavLink to="/website-prompt-generator" className={navLinkClass}>
            Prompt Generator
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        <motion.button
          type="button"
          onClick={openBookingModal}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 rounded-full bg-studio-ink py-1 pl-4 pr-1 text-sm font-medium text-white transition-colors hover:brightness-110"
        >
          Book a Call
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-studio-ink" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </motion.button>
      </div>
    </header>
  )
}

export default SiteHeader

import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useBookingModal } from '../../context/BookingModalContext'
import Reveal from '../motion/Reveal'

function SiteFooter() {
  const { openBookingModal } = useBookingModal()
  const prefersReducedMotion = useReducedMotion()

  return (
    <footer className="mx-3 rounded-t-[32px] bg-studio-ink text-white sm:mx-6">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="font-mono-label text-xs uppercase text-white/50">Let's talk</p>
        <Reveal variant="mask">
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
            Ready for a site that works <span className="text-white/40">as hard as you do?</span>
          </h2>
        </Reveal>
        <Reveal className="mt-8">
          <motion.button
            type="button"
            onClick={openBookingModal}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex items-center gap-2 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-sm font-medium text-studio-ink transition-colors hover:brightness-95"
          >
            Book a Call
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-studio-ink text-white" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.button>
        </Reveal>

        <div className="mt-20 flex flex-col items-center gap-4 border-t border-white/15 pt-8 text-xs text-white/50 sm:flex-row sm:justify-between">
          <span className="font-mono-label uppercase">
            © {new Date().getFullYear()} SynergyFirst Digital
          </span>
          <nav className="flex gap-5 font-mono-label uppercase">
            <Link to="/services" className="hover:text-white">
              Services
            </Link>
            <Link to="/portfolio" className="hover:text-white">
              Portfolio
            </Link>
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter

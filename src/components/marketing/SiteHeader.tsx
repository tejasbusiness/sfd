import { Link, NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useBookingModal } from '../../context/BookingModalContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-mono-label text-[11px] uppercase transition-colors ${isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'}`

function SiteHeader() {
  const { openBookingModal } = useBookingModal()

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          SynergyFirst<span className="text-teal"> / </span>Digital
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
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

        <Button size="md" onClick={openBookingModal}>
          Book a Call
        </Button>
      </div>
    </header>
  )
}

export default SiteHeader

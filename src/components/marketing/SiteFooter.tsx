import { Link } from 'react-router-dom'
import { LinkButton } from '../ui/Button'

function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="font-mono-label text-xs uppercase text-teal">Let's talk</p>
        <h2 className="font-display mt-3 text-3xl font-light leading-tight sm:text-5xl">
          Ready for a website that
          <br className="hidden sm:block" /> <span className="italic">books appointments</span>?
        </h2>
        <div className="mt-8">
          <LinkButton to="/contact" variant="inverse" size="lg">
            Book a Call
          </LinkButton>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 border-t border-cream/15 pt-8 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <span className="font-mono-label uppercase">
            © {new Date().getFullYear()} SynergyFirst Digital
          </span>
          <nav className="flex gap-5 font-mono-label uppercase">
            <Link to="/services" className="hover:text-cream">
              Services
            </Link>
            <Link to="/portfolio" className="hover:text-cream">
              Portfolio
            </Link>
            <Link to="/pricing" className="hover:text-cream">
              Pricing
            </Link>
            <Link to="/contact" className="hover:text-cream">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter

import { Button } from '../ui/Button'
import { useBookingModal } from '../../context/BookingModalContext'

interface StickyMobileCtaProps {
  label?: string
  onClick?: () => void
}

/**
 * Sticky mobile CTA bar for service/pricing pages, per docs/02. Hidden on
 * md+ since the header's persistent "Book a Call" button covers desktop.
 * Defaults to opening the booking modal; pass onClick to override (e.g.
 * PricingPage's "See Plans" scrolls the page instead of booking a call).
 */
function StickyMobileCta({ label = 'Book a Call', onClick }: StickyMobileCtaProps) {
  const { openBookingModal } = useBookingModal()

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream p-3 md:hidden">
      <Button size="lg" className="w-full" onClick={onClick ?? openBookingModal}>
        {label}
      </Button>
    </div>
  )
}

export default StickyMobileCta

import { LinkButton } from '../ui/Button'

interface StickyMobileCtaProps {
  label?: string
}

/**
 * Sticky mobile CTA bar for service/pricing pages, per docs/02. Hidden on
 * md+ since the header's persistent "Book a Call" button covers desktop.
 */
function StickyMobileCta({ label = 'Book a Call' }: StickyMobileCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 md:hidden">
      <LinkButton to="/contact" size="lg" className="w-full">
        {label}
      </LinkButton>
    </div>
  )
}

export default StickyMobileCta

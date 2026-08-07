import { createContext, useContext, useState, type ReactNode } from 'react'
import Modal from '../components/ui/Modal'
import BookingModalContent from '../components/booking/BookingModalContent'

interface BookingModalContextValue {
  openBookingModal: () => void
}

const BookingModalContext = createContext<BookingModalContextValue | undefined>(undefined)

/**
 * Global "Book a Call" trigger — the CTA appears in several independent
 * components (header, footer, hero, sticky mobile bar), so a shared context
 * avoids prop-drilling an onOpen callback through all of them.
 */
export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <BookingModalContext.Provider value={{ openBookingModal: () => setOpen(true) }}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title="Book a Call">
        <BookingModalContent onBooked={() => setOpen(false)} />
      </Modal>
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (!context) throw new Error('useBookingModal must be used within a BookingModalProvider')
  return context
}

import { motion } from 'framer-motion'
import { Button, LinkButton } from '../ui/Button'
import HeroCollage from './HeroCollage'
import { useBookingModal } from '../../context/BookingModalContext'

const NICHE_TAGS = ['#Dentists', '#Physio', '#Dermatology', '#Pediatrics', '#Yoga Studios']

function Hero() {
  const { openBookingModal } = useBookingModal()

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono-label text-xs uppercase text-teal"
          >
            Web Design · SEO · AI Solutions — For Healthcare & Wellness
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display mt-4 text-[13vw] font-light leading-[0.92] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            Sites that
            <br />
            <span className="italic text-teal">get patients</span>
            <br />
            booked.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 max-w-md text-base text-ink-soft"
          >
            We design, build, and grow websites exclusively for practices like yours —
            appointment-driven, trust-sensitive, and judged on whether the phone rings, not on
            how the homepage looks in a portfolio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" onClick={openBookingModal}>
              Book a Call
            </Button>
            <LinkButton to="/services" variant="secondary" size="lg">
              Explore Services
            </LinkButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {NICHE_TAGS.map((tag) => (
              <span
                key={tag}
                className="font-mono-label rounded-full border border-ink/15 px-3 py-1 text-[10px] uppercase text-ink-soft"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        <HeroCollage />
      </div>
    </section>
  )
}

export default Hero

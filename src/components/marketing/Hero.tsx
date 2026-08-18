import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useBookingModal } from '../../context/BookingModalContext'

// Each floating icon gets its own bob duration/delay (Framer Motion, not CSS
// @keyframes) so the float never falls into visible lock-step — matches the
// artifact's per-icon animation-duration/animation-delay pairs.
const FLOATING_ICONS = [
  {
    key: 'calendar',
    className: 'supahub-floating-icon supahub-floating-icon--md supahub-fi-calendar',
    duration: 6.2,
    delay: 0,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9.5h18M8 3v3.2M16 3v3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8.3" cy="14" r="1.1" fill="currentColor" />
        <circle cx="12" cy="14" r="1.1" fill="currentColor" />
        <circle cx="15.7" cy="14" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'chat',
    className: 'supahub-floating-icon supahub-floating-icon--sm supahub-fi-chat',
    duration: 5.4,
    delay: 1.4,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 3.5V16h-1A2.5 2.5 0 0 1 4 13.5v-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'pulse',
    className: 'supahub-floating-icon supahub-floating-icon--md supahub-fi-pulse',
    duration: 6.8,
    delay: 0.7,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h4l2-6 4 12 2-8 1.5 2H21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'automate',
    className: 'supahub-floating-icon supahub-floating-icon--sm supahub-fi-automate',
    duration: 5.8,
    delay: 2.1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M9 3h6l.6 2.4a7 7 0 0 1 2 1.15l2.35-.75 3 5.2-1.9 1.6a7 7 0 0 1 0 2.4l1.9 1.6-3 5.2-2.35-.75a7 7 0 0 1-2 1.15L15 21H9l-.6-2.4a7 7 0 0 1-2-1.15l-2.35.75-3-5.2 1.9-1.6a7 7 0 0 1 0-2.4L1.05 7.6l3-5.2 2.35.75a7 7 0 0 1 2-1.15L9 3Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    key: 'browser',
    className: 'supahub-floating-icon supahub-floating-icon--sm supahub-fi-browser',
    duration: 7.2,
    delay: 0.3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="6" cy="6.75" r="0.9" fill="currentColor" />
        <circle cx="8.6" cy="6.75" r="0.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'bell',
    className: 'supahub-floating-icon supahub-floating-icon--sm supahub-fi-bell',
    duration: 5.2,
    delay: 2.6,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5c-3 0-5 2.2-5 5.4v2.4c0 1-.4 2-1.2 2.8L5 15h14l-.8-.9a4 4 0 0 1-1.2-2.8V8.9c0-3.2-2-5.4-5-5.4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'heart',
    className: 'supahub-floating-icon supahub-floating-icon--md supahub-fi-heart',
    duration: 6.5,
    delay: 1.1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 20.2s-7.8-4.6-9.8-9.3C.9 7.6 2.6 4.6 6 4.1c2-.3 3.8.7 6 3.1 2.2-2.4 4-3.4 6-3.1 3.4.5 5.1 3.5 3.8 6.8-2 4.7-9.8 9.3-9.8 9.3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'check',
    className: 'supahub-floating-icon supahub-floating-icon--sm supahub-fi-check',
    duration: 5.9,
    delay: 1.8,
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M8.3 12.3l2.4 2.4 5-5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const SPARK_PATH = 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'

const headlineMaskVariants: Variants = {
  hidden: { y: '110%' },
  shown: { y: 0 },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0 },
}

const AVATARS = [
  { initials: 'RD', bg: 'var(--color-supahub-violet)' },
  { initials: 'CP', bg: 'var(--color-supahub-hot-pink)' },
  { initials: 'SW', bg: 'var(--color-supahub-amber)' },
  { initials: 'MK', bg: 'var(--color-supahub-ink)' },
  { initials: 'NP', bg: 'var(--color-supahub-ultra-violet)' },
]

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#f59e0b]">
          <path d="M10 1l2.6 6h6.4l-5.2 3.8 2 6.2-5.8-4-5.8 4 2-6.2L1 7h6.4z" />
        </svg>
      ))}
    </div>
  )
}

function Hero() {
  const { openBookingModal } = useBookingModal()
  const prefersReducedMotion = useReducedMotion()

  const headlineTransition = (i: number) => ({
    duration: 0.7,
    delay: 0.3 + i * 0.12,
    ease: [0.16, 1, 0.3, 1] as const,
  })

  return (
    <section className="supahub-hero pt-14 sm:pt-16">
      <div className="supahub-orb supahub-orb-fill" aria-hidden="true" />
      <div className="supahub-orb supahub-orb-amber" aria-hidden="true" />
      <div className="supahub-orb supahub-orb-pink" aria-hidden="true" />
      <div className="supahub-orb supahub-orb-hotspot" aria-hidden="true" />
      <div className="supahub-orb supahub-orb-edge-glow" aria-hidden="true" />
      <div className="supahub-orb supahub-orb-rim" aria-hidden="true" />

      {FLOATING_ICONS.map((item, i) => (
        <motion.span
          key={item.key}
          className={item.className}
          aria-hidden="true"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.6, y: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: [0, -10, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : {
                  opacity: { duration: 0.5, delay: 0.9 + i * 0.06 },
                  scale: { duration: 0.5, delay: 0.9 + i * 0.06, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: 1.3 + item.delay },
                }
          }
        >
          {item.icon}
        </motion.span>
      ))}

      <div className="relative z-[1] mx-auto max-w-[900px] px-4 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full bg-supahub-lavender-field px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet"
        >
          Websites &amp; Automation for Healthcare Practices
        </motion.span>

        <h1 className="font-bricolage mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-supahub-ink sm:text-5xl lg:text-[56px] lg:tracking-[-1.4px]">
          <span className="block overflow-hidden">
            <motion.span
              className="inline-block"
              initial="hidden"
              animate="shown"
              variants={prefersReducedMotion ? { hidden: { y: 0 }, shown: { y: 0 } } : headlineMaskVariants}
              transition={headlineTransition(0)}
            >
              Websites that book patients,
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="inline-block"
              initial="hidden"
              animate="shown"
              variants={prefersReducedMotion ? { hidden: { y: 0 }, shown: { y: 0 } } : headlineMaskVariants}
              transition={headlineTransition(1)}
            >
              automation that keeps them
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial="hidden"
          animate="shown"
          variants={prefersReducedMotion ? { hidden: { opacity: 1, y: 0 }, shown: { opacity: 1, y: 0 } } : fadeUpVariants}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-5 max-w-[600px] text-lg leading-relaxed text-supahub-slate"
        >
          Conversion-focused sites and the booking, follow-up, and patient-communication
          automation behind them — built exclusively for healthcare &amp; wellness professionals.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="shown"
          variants={prefersReducedMotion ? { hidden: { opacity: 1, y: 0 }, shown: { opacity: 1, y: 0 } } : fadeUpVariants}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            type="button"
            onClick={openBookingModal}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-xl bg-supahub-ink px-6 py-3.5 text-base font-semibold text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-supahub-lavender-mist">
              <path d={SPARK_PATH} fill="currentColor" />
            </svg>
            Book a Call
          </motion.button>
          <span className="h-6 w-px bg-supahub-mist" aria-hidden="true" />
          <a href="/website-prompt-generator" className="px-1 text-[15px] font-medium text-supahub-ink hover:text-supahub-violet">
            Free Website Prompt Generator
          </a>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="shown"
          variants={prefersReducedMotion ? { hidden: { opacity: 1, y: 0 }, shown: { opacity: 1, y: 0 } } : fadeUpVariants}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-7 flex items-center justify-center gap-3.5"
        >
          <div className="flex" aria-hidden="true">
            {AVATARS.map((a) => (
              <span
                key={a.initials}
                style={{ background: a.bg }}
                className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(17,24,39,0.15)] first:ml-0"
              >
                {a.initials}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <StarRow />
            <p className="text-sm font-medium text-supahub-ink">loved by 300+ practices</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[1] mx-auto mt-16 hidden max-w-[1180px] px-6 sm:block"
      >
        <div className="relative h-[300px] overflow-hidden">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute right-[3%] top-3.5 z-[4] h-7 w-7 text-supahub-hot-pink"
            aria-hidden="true"
          >
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute bottom-4 left-[5%] z-[4] h-5 w-5 text-[#3b82f6]"
            aria-hidden="true"
          >
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>

          <div className="absolute left-1/2 top-0 z-[3] w-[380px] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_rgba(124,58,237,0.2)]">
            <div className="flex items-center gap-1 border-b border-supahub-mist px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="pt-3.5 pb-1 text-center text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet">
              Patient Feedback Portal
            </p>
            <div className="px-5 pb-6 pt-2">
              {[
                { title: 'Online booking widget', meta: '42 upvotes', badge: '129' },
                { title: 'SMS appointment reminders', meta: '31 upvotes', badge: '96' },
                { title: 'New patient intake forms', meta: '19 upvotes', badge: '58' },
              ].map((row, i, arr) => (
                <div
                  key={row.title}
                  className={`flex items-center justify-between py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-supahub-fog' : ''}`}
                >
                  <div>
                    <p className="font-medium text-supahub-ink">{row.title}</p>
                    <p className="text-xs text-supahub-slate">{row.meta}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#1f2534] px-2 py-0.5 text-xs font-bold text-white">
                    {row.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute top-[84px] z-[1] w-[320px] overflow-hidden rounded-2xl bg-white opacity-90 shadow-[0_24px_50px_rgba(124,58,237,0.2)]"
            style={{ left: 'calc(50% - 390px)' }}
          >
            <div className="flex items-center gap-1 border-b border-supahub-mist px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="pt-3.5 pb-1 text-center text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet">
              Changelog
            </p>
            <div className="px-5 pb-6 pt-2">
              {[
                { t: 'WhatsApp Business API launch', d: 'Automated recall & follow-up messaging', dot: 'var(--color-supahub-violet)' },
                { t: '45-min buffer between bookings', d: 'Prevents back-to-back scheduling', dot: 'var(--color-supahub-hot-pink)' },
                { t: 'Dual-currency pricing', d: 'INR & USD, geo-detected', dot: 'var(--color-supahub-amber)' },
              ].map((entry) => (
                <div key={entry.t} className="flex gap-2.5 py-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: entry.dot }} />
                  <div>
                    <p className="text-[13px] font-semibold text-supahub-ink">{entry.t}</p>
                    <p className="mt-0.5 text-xs text-supahub-slate">{entry.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute top-[84px] z-[1] w-[320px] overflow-hidden rounded-2xl bg-white opacity-90 shadow-[0_24px_50px_rgba(124,58,237,0.2)]"
            style={{ left: 'calc(50% + 140px)' }}
          >
            <div className="flex items-center gap-1 border-b border-supahub-mist px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="pt-3.5 pb-1 text-center text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet">
              Roadmap
            </p>
            <div className="px-5 pb-6 pt-2">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-supahub-slate">In Progress</p>
              <div className="mb-2 rounded-[10px] bg-supahub-fog px-3 py-2.5 text-[13px] font-medium text-supahub-ink">
                AI chatbot widget
              </div>
              <div className="rounded-[10px] bg-supahub-fog px-3 py-2.5 text-[13px] font-medium text-supahub-ink">
                Client dashboard
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero

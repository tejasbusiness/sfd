import { motion } from 'framer-motion'

/**
 * Signature element: a hand-built collage of vintage-anatomical-plate line
 * art (the heart study — literal and metaphorical for a business selling to
 * healthcare practices) layered with a botanical sprig, torn geometric
 * "paper" shards, and a rotating badge. Built as inline SVG/DOM rather than
 * a stock photo so every shape is original and art-directed specifically
 * for this brief, not a generic medical stock image.
 */
function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md sm:max-w-lg" aria-hidden="true">
      {/* soft sage backdrop disc */}
      <div className="absolute inset-6 rounded-full bg-sage" />

      {/* torn terracotta paper shard */}
      <motion.div
        initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
        animate={{ opacity: 1, rotate: -6, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute -left-4 top-8 h-40 w-40 sm:h-52 sm:w-52"
        style={{
          background: 'var(--color-terracotta)',
          clipPath: 'polygon(8% 0%, 100% 12%, 88% 100%, 0% 78%)',
          opacity: 0.85,
        }}
      />

      {/* gold dot-grain circle, offset lower right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="grain-texture absolute bottom-4 right-2 h-28 w-28 rounded-full sm:h-36 sm:w-36"
        style={{ backgroundColor: 'var(--color-gold)', opacity: 0.25 }}
      />

      {/* anatomical heart-study line art, the sculptural centerpiece */}
      <motion.svg
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        viewBox="0 0 320 360"
        className="absolute inset-0 h-full w-full drop-shadow-sm"
        role="img"
        aria-label="Illustrated anatomical heart study, a symbol of the practices we build for"
      >
        <g fill="none" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M160 300c-52-34-96-78-96-132 0-38 28-62 60-62 20 0 34 10 36 26 2-16 16-26 36-26 32 0 60 24 60 62 0 54-44 98-96 132z" />
          <path d="M160 300c-52-34-96-78-96-132 0-38 28-62 60-62 20 0 34 10 36 26" opacity="0.5" />
          <path d="M118 132c8 18 6 40-6 56M186 128c10 14 12 34 4 52M148 108c-2 22 6 42 22 54" strokeWidth="1" opacity="0.6" />
          <path d="M96 168h28l10-24 14 40 12-56 10 32h34" strokeWidth="1.6" />
          <circle cx="160" cy="176" r="118" opacity="0.25" strokeDasharray="2 6" />
        </g>
      </motion.svg>

      {/* botanical sprig, overlapping the lower-left of the heart study */}
      <motion.svg
        initial={{ opacity: 0, rotate: -20 }}
        animate={{ opacity: 1, rotate: -14 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        viewBox="0 0 120 200"
        className="absolute -bottom-2 left-0 h-40 w-24 sm:h-52 sm:w-32"
      >
        <g fill="none" stroke="var(--color-teal-dark)" strokeWidth="1.6" strokeLinecap="round">
          <path d="M60 190C56 140 60 90 66 20" />
          <path d="M62 150c-18-8-28-24-30-44 22 2 36 14 42 30" fill="var(--color-teal)" opacity="0.9" />
          <path d="M64 110c18-6 30-20 34-38-22 0-38 10-46 26" fill="var(--color-teal)" opacity="0.9" />
          <path d="M62 70c-14-6-22-18-24-34 18 2 30 12 34 26" fill="var(--color-teal)" opacity="0.9" />
          <circle cx="67" cy="20" r="7" fill="var(--color-terracotta)" stroke="none" />
        </g>
      </motion.svg>

      {/* rotating circular badge, echoing the reference's showreel dial */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute -right-2 top-1/2 h-24 w-24 -translate-y-1/2 sm:h-28 sm:w-28"
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          <defs>
            <path id="badge-circle-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <circle cx="50" cy="50" r="49" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="1" />
          <text className="font-mono-label" fontSize="8.2" fill="var(--color-ink)" letterSpacing="2">
            <textPath href="#badge-circle-path">
              BOOKING OPEN • BOOKING OPEN •
            </textPath>
          </text>
        </motion.svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-terracotta" />
        </div>
      </motion.div>
    </div>
  )
}

export default HeroCollage

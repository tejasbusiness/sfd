import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const TOOLS = [
  { label: 'n8n', style: 'font-bold' },
  { label: 'OpenAI', style: 'font-bold' },
  { label: 'Claude', style: 'font-semibold italic' },
  { label: 'Zapier', style: 'font-bold' },
  { label: 'Airtable', style: 'font-semibold' },
  { label: 'Retell AI', style: 'font-semibold' },
  { label: 'ElevenLabs', style: 'font-semibold' },
  { label: 'Perplexity', style: 'font-semibold' },
  { label: 'Make', style: 'font-bold' },
  { label: 'GoHighLevel', style: 'font-semibold' },
]

const ACCENTS = ['#1c4ed8', '#ff5a4e', '#22a35a', '#a855f7', '#f59e0b', '#0ea5e9']

const SIZE = 400
const RADIUS = 175
const PERIOD_SECONDS = 30

/**
 * Replaces the case-study preview card in the desktop hero slot. Tool names
 * are static wordmark chips (fixed presentation, same accepted-exception
 * class as ProcessSection.STEPS/FaqSection.FAQS) — no downloaded brand SVGs,
 * styled as our-stack labels rather than pixel-accurate official logos.
 * Simple flat circular orbit: the whole ring rotates via a single looping
 * `animate`, each chip counter-rotates to stay upright — no per-frame state,
 * no depth/occlusion math, so nothing ever passes behind the hub. Reduced
 * motion renders the same ring layout with no rotation, per this session's
 * Reveal/NicheStrip pattern of a static equivalent, not a slower one.
 */
function AutomationOrbit() {
  const prefersReducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="relative shrink-0 max-w-full" style={{ width: SIZE, height: SIZE, maxWidth: '100%', aspectRatio: '1 / 1' }}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-studio-line-dashed"
        style={{ width: RADIUS * 2 + 44, height: RADIUS * 2 + 44 }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 z-10 flex h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-studio-ink p-5 text-center text-white shadow-[0_30px_60px_-24px_rgba(20,20,20,0.4)]"
      >
        <p className="text-xs font-bold leading-tight tracking-[-0.01em]">Automation for Healthcare</p>
        <p className="mt-1.5 text-[10px] leading-snug text-white/60">Booking to follow-up, on auto-pilot</p>
      </motion.div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: prefersReducedMotion ? 0 : 360 }}
        transition={{
          opacity: { duration: 0.6, delay: 0.9 },
          rotate: prefersReducedMotion ? undefined : { duration: PERIOD_SECONDS, repeat: Infinity, ease: 'linear', delay: 0.9 },
        }}
      >
        {TOOLS.map((tool, index) => {
          const angle = (index / TOOLS.length) * 2 * Math.PI - Math.PI / 2
          const x = SIZE / 2 + RADIUS * Math.cos(angle)
          const y = SIZE / 2 + RADIUS * Math.sin(angle)
          const accent = ACCENTS[index % ACCENTS.length]
          const isHovered = hovered === index

          return (
            <div
              key={tool.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y, zIndex: isHovered ? 20 : 1 }}
            >
              <motion.div
                animate={{ rotate: prefersReducedMotion ? 0 : -360 }}
                transition={prefersReducedMotion ? undefined : { duration: PERIOD_SECONDS, repeat: Infinity, ease: 'linear', delay: 0.9 }}
              >
                <motion.div
                  onHoverStart={() => setHovered(index)}
                  onHoverEnd={() => setHovered(null)}
                  whileHover={{ scale: 1.15, boxShadow: `0 12px 24px -10px ${accent}80`, transition: { duration: 0.2 } }}
                  className="group relative flex h-10 items-center justify-center rounded-full border border-studio-line bg-white px-3.5 shadow-[0_4px_10px_rgba(20,20,20,0.08)]"
                >
                  <span className="mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                  <span className={`whitespace-nowrap text-[11px] text-studio-ink ${tool.style}`}>{tool.label}</span>
                </motion.div>
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default AutomationOrbit

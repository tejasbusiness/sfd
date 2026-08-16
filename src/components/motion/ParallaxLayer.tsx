import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface ParallaxLayerProps {
  children: ReactNode
  range?: [number, number]
  className?: string
}

/**
 * Decorative background motif that drifts as its own section scrolls
 * through the viewport. Scoped to a local section ref (never window
 * scroll) so the transform calculation stays cheap and self-contained.
 * Always aria-hidden/pointer-events-none/absolute — never affects layout
 * or CLS regardless of the transform value.
 */
function ParallaxLayer({ children, range = [-40, 40], className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], range)

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div style={prefersReducedMotion ? undefined : { y }} className={className}>
        {children}
      </motion.div>
    </div>
  )
}

export default ParallaxLayer

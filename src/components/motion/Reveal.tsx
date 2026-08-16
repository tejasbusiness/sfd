import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealVariant = 'up' | 'mask' | 'fade'
type RevealElement = 'div' | 'span' | 'li'

interface RevealProps {
  children: ReactNode
  as?: RevealElement
  variant?: RevealVariant
  index?: number
  delay?: number
  className?: string
}

const VARIANTS: Record<RevealVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 16 },
    shown: { opacity: 1, y: 0 },
  },
  mask: {
    hidden: { opacity: 0, y: '100%' },
    shown: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    shown: { opacity: 1 },
  },
}

const STATIC_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0 },
  shown: { opacity: 1, y: 0 },
}

/**
 * Shared scroll-reveal wrapper for below-fold sections. whileInView with
 * once:true — a one-time reveal, not continuous scroll tracking — so it
 * stays cheap on long pages. Reduced-motion is branched at the variant
 * level (renders immediately visible, no committed hidden state) rather
 * than just shortened, since a duration change alone can't stop a
 * whileInView-driven transform.
 */
function Reveal({ children, as = 'div', variant = 'up', index = 0, delay = 0, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = prefersReducedMotion ? STATIC_VARIANTS : VARIANTS[variant]
  const totalDelay = delay + index * 0.06
  const wrapperClassName = variant === 'mask' ? `overflow-hidden ${className ?? ''}` : className

  const motionProps = {
    className: wrapperClassName,
    initial: 'hidden' as const,
    whileInView: 'shown' as const,
    viewport: { once: true, amount: 0.3 },
    variants,
    transition: { duration: 0.7, delay: totalDelay, ease: [0.16, 1, 0.3, 1] as const },
  }

  if (as === 'span') return <motion.span {...motionProps}>{children}</motion.span>
  if (as === 'li') return <motion.li {...motionProps}>{children}</motion.li>
  return <motion.div {...motionProps}>{children}</motion.div>
}

export default Reveal

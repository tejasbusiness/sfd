import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface BaseProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse' | 'clinical' | 'clinical-ghost' | 'supahub' | 'supahub-ghost'
  size?: 'md' | 'lg'
}

const variantClasses: Record<NonNullable<BaseProps['variant']>, string> = {
  primary: 'bg-ink text-cream hover:bg-teal-dark',
  secondary: 'bg-transparent text-ink border border-ink/25 hover:border-ink',
  ghost: 'text-ink hover:bg-sage',
  inverse: 'bg-cream text-ink hover:bg-sage',
  // "Studio Neutral" variants — used by the redesigned public site.
  clinical: 'rounded-full bg-studio-ink text-white hover:brightness-110 focus-visible:outline-studio-ink',
  'clinical-ghost':
    'rounded-full border border-studio-ink/20 bg-transparent text-studio-ink hover:bg-studio-bg-card-soft focus-visible:outline-studio-ink',
  // "Supahub" variants — match the approved artifact's .btn-primary/.btn-dark
  // (dark-ink fill, 12px radius, Inter font) and .btn-ghost (outlined).
  supahub: 'rounded-xl bg-supahub-ink text-white hover:brightness-110 focus-visible:outline-supahub-violet',
  'supahub-ghost':
    'rounded-xl border border-supahub-ink bg-transparent text-supahub-ink hover:bg-supahub-fog focus-visible:outline-supahub-violet',
}

const sizeClasses: Record<NonNullable<BaseProps['size']>, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

function classes(variant: BaseProps['variant'] = 'primary', size: BaseProps['size'] = 'md') {
  const isClinical = variant === 'clinical' || variant === 'clinical-ghost'
  const isSupahub = variant === 'supahub' || variant === 'supahub-ghost'
  const type = isClinical || isSupahub ? 'font-sans font-medium normal-case' : 'font-mono-label uppercase text-xs'
  const radius = isSupahub ? '' : 'rounded-full'
  return `inline-flex items-center justify-center gap-2 ${radius} ${type} transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${variantClasses[variant]} ${sizeClasses[size]}`
}

interface ButtonProps extends BaseProps, HTMLMotionProps<'button'> {
  children: ReactNode
}

export function Button({ variant, size, children, className = '', ...rest }: ButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.button
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`${classes(variant, size)} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

interface LinkButtonProps extends BaseProps {
  to: string
  className?: string
  children: ReactNode
}

export function LinkButton({ to, variant, size, children, className = '' }: LinkButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      <Link to={to} className={`${classes(variant, size)} ${className}`}>
        {children}
      </Link>
    </motion.div>
  )
}

import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface BaseProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse'
  size?: 'md' | 'lg'
}

const variantClasses: Record<NonNullable<BaseProps['variant']>, string> = {
  primary: 'bg-ink text-cream hover:bg-teal-dark',
  secondary: 'bg-transparent text-ink border border-ink/25 hover:border-ink',
  ghost: 'text-ink hover:bg-sage',
  inverse: 'bg-cream text-ink hover:bg-sage',
}

const sizeClasses: Record<NonNullable<BaseProps['size']>, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

function classes(variant: BaseProps['variant'] = 'primary', size: BaseProps['size'] = 'md') {
  return `inline-flex items-center justify-center gap-2 rounded-full font-mono-label text-xs uppercase transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${variantClasses[variant]} ${sizeClasses[size]}`
}

interface ButtonProps extends BaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function Button({ variant, size, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${classes(variant, size)} ${className}`} {...rest}>
      {children}
    </button>
  )
}

interface LinkButtonProps extends BaseProps {
  to: string
  className?: string
  children: ReactNode
}

export function LinkButton({ to, variant, size, children, className = '' }: LinkButtonProps) {
  return (
    <Link to={to} className={`${classes(variant, size)} ${className}`}>
      {children}
    </Link>
  )
}

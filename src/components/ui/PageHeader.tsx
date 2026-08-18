import type { ReactNode } from 'react'
import Reveal from '../motion/Reveal'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  children?: ReactNode
  variant?: 'editorial' | 'clinical' | 'supahub'
}

function PageHeader({ eyebrow, title, description, children, variant = 'editorial' }: PageHeaderProps) {
  if (variant === 'supahub') {
    return (
      <div className="supahub-page-header">
        <div className="supahub-ph-orb supahub-ph-fill" aria-hidden="true" />
        <div className="supahub-ph-orb supahub-ph-pink" aria-hidden="true" />
        <div className="supahub-ph-orb supahub-ph-rim" aria-hidden="true" />
        <div className="relative z-[1] mx-auto max-w-3xl px-4 pb-4 pt-20 text-center sm:px-6">
          <Reveal variant="mask">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet">{eyebrow}</p>
          </Reveal>
          <Reveal variant="mask" delay={0.08}>
            <h1 className="font-bricolage mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] text-supahub-ink sm:text-5xl">
              {title}
            </h1>
          </Reveal>
          {description && (
            <Reveal delay={0.16}>
              <p className="mx-auto mt-4 max-w-xl text-supahub-slate">{description}</p>
            </Reveal>
          )}
          {children}
        </div>
      </div>
    )
  }

  if (variant === 'clinical') {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-20 text-center sm:px-6">
        <Reveal variant="mask">
          <p className="font-mono-label flex items-center justify-center gap-2 text-xs text-studio-ink-faint">
            <span className="h-[2px] w-5 bg-studio-ink-faint" />
            {eyebrow}
          </p>
        </Reveal>
        <Reveal variant="mask" delay={0.08}>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-[-0.02em] text-studio-ink sm:text-5xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className="mx-auto mt-4 max-w-xl text-studio-ink-soft">{description}</p>
          </Reveal>
        )}
        {children}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-20 pb-4 text-center sm:px-6">
      <p className="font-mono-label text-xs uppercase text-teal">{eyebrow}</p>
      <h1 className="font-display mt-3 text-4xl font-light leading-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {description && <p className="mx-auto mt-4 max-w-xl text-ink-soft">{description}</p>}
      {children}
    </div>
  )
}

export default PageHeader

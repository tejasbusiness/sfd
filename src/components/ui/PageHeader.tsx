import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  children?: ReactNode
}

function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
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

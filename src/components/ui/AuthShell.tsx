import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthShellProps {
  eyebrow: string
  title: string
  children: ReactNode
}

function AuthShell({ eyebrow, title, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display block text-center text-lg text-ink">
          SynergyFirst<span className="text-teal"> / </span>Digital
        </Link>

        <div className="mt-10 rounded-2xl border border-ink/10 bg-cream p-7 sm:p-8">
          <p className="font-mono-label text-center text-xs uppercase text-teal">{eyebrow}</p>
          <h1 className="font-display mt-2 text-center text-2xl font-light text-ink">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  )
}

export default AuthShell

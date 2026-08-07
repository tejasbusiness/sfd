import { type ReactNode } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Bookings and Invoices are confirmed next-phase tabs (docs/12) — this shell
// is built so adding them is a new NAV_ITEMS entry + page, not a new auth
// model or layout. Only linking to what exists so the nav never dead-ends.
const NAV_ITEMS = [{ to: '/client/tickets', label: 'Support Tickets' }]

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return `font-mono-label block rounded-lg px-3 py-2 text-xs uppercase transition-colors ${
    isActive ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sage hover:text-ink'
  }`
}

function ClientLayout({ title, children }: { title: string; children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-ink/10 px-4 py-6 md:block">
          <Link to="/" className="font-display block px-3 text-lg text-ink">
            SynergyFirst<span className="text-teal"> / </span>Digital
          </Link>
          <nav className="mt-6 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-ink/10 px-4 py-4 sm:px-6">
            <h1 className="font-display text-xl text-ink">{title}</h1>
            <div className="flex items-center gap-3">
              <span className="font-mono-label hidden text-[10px] uppercase text-ink-soft sm:inline">
                {profile?.full_name ?? 'Account'}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="font-mono-label rounded-full border border-ink/15 px-3.5 py-1.5 text-[11px] uppercase text-ink-soft transition-colors hover:border-teal hover:text-teal"
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default ClientLayout

import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/availability', label: 'Availability' },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/tickets', label: 'Tickets' },
  { to: '/admin/settings', label: 'Settings' },
]

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return `font-mono-label block rounded-lg px-3 py-2 text-xs uppercase transition-colors ${
    isActive ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sage hover:text-ink'
  }`
}

/**
 * Shared shell for every /admin/* page. Deploys as its own app on
 * admin.synergyfirstdigital.com in production (docs/00-INDEX.md ->
 * "Deployment topology") but lives in the same codebase/route tree during
 * local dev — this layout is where that split would happen later without
 * touching individual admin pages.
 */
function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
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
          <p className="font-display px-3 text-lg text-ink">SFD Admin</p>
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
                {profile?.full_name ?? profile?.role}
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

export default AdminLayout

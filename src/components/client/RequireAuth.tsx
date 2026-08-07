import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Gates every /client/* route. Any signed-in user (customer or staff) may
 * enter — unlike RequireStaffRole, this is not role-restricted, since the
 * client dashboard is the customer-facing side of the same auth used by
 * /admin (docs/12's "one login, broader auth scope" requirement).
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-mono-label text-xs uppercase text-ink-soft">Loading…</p>
      </div>
    )
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />
  }

  return <>{children}</>
}

export default RequireAuth

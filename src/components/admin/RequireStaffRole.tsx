import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const STAFF_ROLES = ['admin', 'staff_support', 'staff_sales']

/**
 * Gates every /admin/* route. Redirects signed-out visitors to login (with a
 * ?redirect= back to where they were headed) and signed-in non-staff users
 * (e.g. a customer account) to the homepage rather than showing them an
 * "unauthorized" admin shell.
 */
function RequireStaffRole({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
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

  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RequireStaffRole

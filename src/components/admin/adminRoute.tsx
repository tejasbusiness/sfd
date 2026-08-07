import type { ReactElement } from 'react'
import RequireStaffRole from './RequireStaffRole'

/** Wraps a page element with RequireStaffRole — shorthand for /admin/* route definitions. */
export function adminRoute(element: ReactElement): ReactElement {
  return <RequireStaffRole>{element}</RequireStaffRole>
}

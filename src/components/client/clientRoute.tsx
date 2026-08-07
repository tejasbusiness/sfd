import type { ReactElement } from 'react'
import RequireAuth from './RequireAuth'

/** Wraps a page element with RequireAuth — shorthand for /client/* route definitions. */
export function clientRoute(element: ReactElement): ReactElement {
  return <RequireAuth>{element}</RequireAuth>
}

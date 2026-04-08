import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '../store'
import type { UserRole } from '../types'

export function ProtectedRoute() {
  const location = useLocation()
  const hasHydrated = useSessionStore((state) => state.hasHydrated)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    const redirectTarget = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const hasHydrated = useSessionStore((state) => state.hasHydrated)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const activeRole = useSessionStore((state) => state.activeRole)

  if (!hasHydrated) {
    return null
  }

  if (isAuthenticated) {
    const defaultRoute = activeRole === 'company' ? '/company/jobs' : '/dashboard'
    return <Navigate to={defaultRoute} replace />
  }

  return <Outlet />
}

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const activeRole = useSessionStore((state) => state.activeRole)

  if (!allowedRoles.includes(activeRole)) {
    const fallbackRoute = activeRole === 'company' ? '/company/jobs' : '/dashboard'
    return <Navigate to={fallbackRoute} replace />
  }

  return <Outlet />
}


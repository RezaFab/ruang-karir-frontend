import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '../store'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    const redirectTarget = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}


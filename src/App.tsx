import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLozad } from './hooks/useLozad'
import { AppRoutes } from './routes'
import { useSessionStore } from './store'
import { authApiService } from './services'
import { setTokenRefreshHandler, setUnauthorizedHandler } from './services/httpClient'

function LozadAwareRoutes() {
  const location = useLocation()

  useLozad('.lozad', location.pathname)

  return <AppRoutes />
}

function SessionAuthSync() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useSessionStore((state) => state.logout)

  useEffect(() => {
    setTokenRefreshHandler(async () => {
      const { refreshToken, updateAuthTokens } = useSessionStore.getState()

      if (!refreshToken) {
        return null
      }

      try {
        const response = await authApiService.refresh({ refreshToken })
        const refreshedAccessToken = response.data.accessToken

        if (!refreshedAccessToken) {
          return null
        }

        updateAuthTokens({
          accessToken: refreshedAccessToken,
          refreshToken: response.data.refreshToken,
        })

        return refreshedAccessToken
      } catch {
        return null
      }
    })

    setUnauthorizedHandler(() => {
      logout()

      if (location.pathname === '/login') {
        return
      }

      const redirectTarget = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, { replace: true })
    })

    return () => {
      setTokenRefreshHandler(null)
      setUnauthorizedHandler(null)
    }
  }, [location.pathname, location.search, logout, navigate])

  return null
}

export default function App() {
  return (
    <>
      <SessionAuthSync />
      <LozadAwareRoutes />
    </>
  )
}

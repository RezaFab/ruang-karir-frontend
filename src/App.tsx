import { useLocation } from 'react-router-dom'
import { useLozad } from './hooks/useLozad'
import { AppRoutes } from './routes'

function LozadAwareRoutes() {
  const location = useLocation()

  useLozad('.lozad', location.pathname)

  return <AppRoutes />
}

export default function App() {
  return <LozadAwareRoutes />
}

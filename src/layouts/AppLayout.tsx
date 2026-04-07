import { NavLink, Outlet } from 'react-router-dom'
import { useSessionStore } from '../store'

const navItems = [
  { to: '/assessment', label: 'Assessment' },
  { to: '/assessment/result', label: 'Result' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/badges', label: 'Badges' },
  { to: '/company', label: 'HR View' },
]

export function AppLayout() {
  const activeRole = useSessionStore((state) => state.activeRole)
  const setActiveRole = useSessionStore((state) => state.setActiveRole)

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Ruang Karir App</p>
            <h1 className="font-heading text-2xl font-semibold">Career Intelligence Workspace</h1>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-panel p-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveRole('user')}
              className={`rounded-lg px-3 py-1.5 font-medium ${
                activeRole === 'user' ? 'bg-ink text-white' : 'text-muted'
              }`}
            >
              User View
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('company')}
              className={`rounded-lg px-3 py-1.5 font-medium ${
                activeRole === 'company' ? 'bg-ink text-white' : 'text-muted'
              }`}
            >
              Company View
            </button>
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-6 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-ink text-white' : 'bg-panel text-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

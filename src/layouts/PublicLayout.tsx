import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../components'
import { useSessionStore } from '../store'

export function PublicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const isLanding = location.pathname === '/'
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const sessionDisplayName = useSessionStore((state) => state.sessionDisplayName)
  const sessionEmail = useSessionStore((state) => state.sessionEmail)
  const logout = useSessionStore((state) => state.logout)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current) {
        return
      }

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function requestLogout() {
    setIsProfileMenuOpen(false)
    setIsLogoutDialogOpen(true)
  }

  function handleLogoutConfirm() {
    setIsLogoutDialogOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight text-ink">
            Ruang Karir
          </Link>

          {isLanding ? (
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
              <a href="#masalah" className="hover:text-ink">
                Masalah
              </a>
              <a href="#cara-kerja" className="hover:text-ink">
                Cara Kerja
              </a>
              <a href="#manfaat" className="hover:text-ink">
                Manfaat
              </a>
            </nav>
          ) : (
            <div className="hidden text-sm font-medium text-muted md:block">Platform AI Karier</div>
          )}

          <div className="flex items-center gap-2">
            <Link
              to="/assessment"
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
            >
              Mulai Asesmen
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Profil
                </button>

                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-border bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                  >
                    <div className="border-b border-border px-3 pb-2 pt-1">
                      <p className="text-sm font-semibold text-ink">{sessionDisplayName || 'Pengguna'}</p>
                      <p className="text-xs text-muted">{sessionEmail || '-'}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="mt-2 block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-panel"
                    >
                      Buka Dasbor
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={requestLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-border bg-panel">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <h3 className="font-heading text-xl font-semibold text-ink">Ruang Karir</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Platform AI untuk membantu transisi karier melalui asesmen personal, rekomendasi role, dan
            learning path berbasis kebutuhan industri.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.12em] text-muted">© 2026 RezaFab</p>
        </div>
      </footer>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Konfirmasi Logout"
        description="Anda akan keluar dari sesi saat ini dan harus login kembali untuk melanjutkan."
        confirmLabel="Ya, Logout"
        cancelLabel="Batal"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  )
}


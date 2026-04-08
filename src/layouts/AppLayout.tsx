import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AppDropdown, ConfirmDialog } from '../components'
import { useLogoutMutation } from '../hooks/useAuth'
import { useProgressSummaryQuery } from '../hooks/useCareerApi'
import { useAssessmentStore, useSessionStore } from '../store'
import type { UserRole } from '../types'

interface NavMenuItem {
  to: string
  label: string
}

const roleMenus: Record<UserRole, NavMenuItem[]> = {
  worker: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/assessment', label: 'Asesmen' },
    { to: '/assessment/result', label: 'Hasil AI' },
    { to: '/badges', label: 'Lencana' },
    { to: '/jobs/search', label: 'Pencarian Kerja' },
  ],
  company: [
    { to: '/company/jobs', label: 'Posting Job' },
    { to: '/talent', label: 'Kandidat' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/assessment', label: 'Asesmen' },
    { to: '/assessment/result', label: 'Hasil AI' },
    { to: '/badges', label: 'Lencana' },
    { to: '/jobs/search', label: 'Pencarian Kerja' },
    { to: '/company/jobs', label: 'Posting Job' },
    { to: '/talent', label: 'Kandidat' },
  ],
}

const roleLabel: Record<UserRole, string> = {
  worker: 'Pekerja',
  company: 'Perusahaan',
  admin: 'Admin',
}

function resolveLearningPathId(selectedCareerGoalId?: string) {
  if (selectedCareerGoalId === 'cg-product-manager') {
    return 'lp-product-manager'
  }

  if (selectedCareerGoalId === 'cg-frontend-engineer') {
    return 'lp-frontend-engineer'
  }

  if (selectedCareerGoalId === 'cg-digital-marketing') {
    return 'lp-digital-marketing'
  }

  return 'lp-data-analyst'
}

export function AppLayout() {
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const activeRole = useSessionStore((state) => state.activeRole)
  const sessionDisplayName = useSessionStore((state) => state.sessionDisplayName)
  const sessionEmail = useSessionStore((state) => state.sessionEmail)
  const refreshToken = useSessionStore((state) => state.refreshToken)
  const setActiveRole = useSessionStore((state) => state.setActiveRole)
  const logout = useSessionStore((state) => state.logout)
  const logoutMutation = useLogoutMutation()
  const selectedCareerGoalId = useAssessmentStore((state) => state.selectedCareerGoalId)
  const learningPathId = resolveLearningPathId(selectedCareerGoalId)

  const { data: progressSummary } = useProgressSummaryQuery(
    activeRole === 'worker' || activeRole === 'admin' ? learningPathId : undefined,
  )

  const navItems = useMemo(() => roleMenus[activeRole], [activeRole])
  const roleOptions = useMemo(
    () =>
      (['worker', 'company', 'admin'] as const).map((role) => ({
        value: role,
        label: roleLabel[role],
      })),
    [],
  )

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
    logoutMutation.mutate(
      {
        refreshToken: refreshToken || undefined,
      },
      {
        onSettled: () => {
          logout()
          navigate('/login', { replace: true })
        },
      },
    )
  }

  function handleRoleChange(role: UserRole) {
    setActiveRole(role)
    setIsProfileMenuOpen(false)
    navigate(role === 'company' ? '/company/jobs' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="mx-auto flex w-full max-w-[1380px] gap-6 px-4 py-5 md:px-6">
        <aside className="hidden w-[272px] shrink-0 flex-col rounded-3xl border border-border bg-white p-5 shadow-[0_10px_35px_rgba(14,30,46,0.08)] lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Ruang Karir</p>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-ink">Pusat Belajar Karier</h1>
            <p className="mt-1 text-sm text-muted">Mode {roleLabel[activeRole]}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] text-white shadow-[0_8px_20px_rgba(15,39,64,0.22)]'
                      : 'text-muted hover:bg-panel hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {(activeRole === 'worker' || activeRole === 'admin') && progressSummary ? (
            <article className="mt-auto rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Progres Belajar</p>
              <p className="mt-2 font-heading text-3xl font-semibold text-ink">{progressSummary.completionRate}%</p>
              <p className="mt-1 text-sm text-muted">
                {progressSummary.completedModules}/{progressSummary.totalModules} modul selesai
              </p>
              <div className="mt-3 h-2 rounded-full bg-panel">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#1f6f8b,#50b8a5)]"
                  style={{ width: `${Math.min(progressSummary.completionRate, 100)}%` }}
                />
              </div>
            </article>
          ) : null}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="rounded-3xl border border-border bg-white px-5 py-4 shadow-[0_10px_30px_rgba(14,30,46,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Ruang Karir App</p>
                <p className="mt-1 text-lg font-semibold text-ink">{sessionDisplayName || 'Pengguna'}</p>
                <p className="text-sm text-muted">{sessionEmail || '-'}</p>
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                >
                  Profil
                </button>

                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-30 w-60 rounded-xl border border-border bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                  >
                    <div className="border-b border-border px-3 pb-2 pt-1">
                      <p className="text-sm font-semibold text-ink">{sessionDisplayName || 'Pengguna'}</p>
                      <p className="text-xs text-muted">{sessionEmail || '-'}</p>
                    </div>

                    <div className="mt-2 rounded-lg bg-surface px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Role aktif
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">{roleLabel[activeRole]}</p>
                    </div>

                    <div className="mt-2 px-1">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          Ganti role demo
                        </span>
                        <AppDropdown
                          value={activeRole}
                          options={roleOptions}
                          ariaLabel="Pilih role demo"
                          onChange={(value) => handleRoleChange(value as UserRole)}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={requestLogout}
                      className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-ink text-white' : 'bg-panel text-muted hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Akhiri Sesi?"
        description="Anda akan keluar dari sesi saat ini. Untuk melanjutkan, Anda perlu login kembali."
        confirmLabel="Ya, Logout"
        cancelLabel="Batal"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  )
}

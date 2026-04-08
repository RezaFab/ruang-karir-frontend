import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LoginResponseData, UserRole } from '../types'

interface SessionState {
  isAuthenticated: boolean
  activeRole: UserRole
  sessionUserId: string
  sessionDisplayName: string
  sessionEmail: string
  accessToken: string
  refreshToken: string
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  setActiveRole: (role: UserRole) => void
  setSession: (session: LoginResponseData) => void
  updateAuthTokens: (payload: { accessToken: string; refreshToken?: string }) => void
  logout: () => void
}

function normalizeRole(role: string | undefined): UserRole {
  if (role === 'admin' || role === 'company' || role === 'worker') {
    return role
  }

  if (role === 'user') {
    return 'worker'
  }

  return 'worker'
}

const initialPersistedSessionState = {
  isAuthenticated: false,
  activeRole: 'worker' as UserRole,
  sessionUserId: '',
  sessionDisplayName: '',
  sessionEmail: '',
  accessToken: '',
  refreshToken: '',
}

const initialSessionState = {
  ...initialPersistedSessionState,
  hasHydrated: false,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialSessionState,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setActiveRole: (role) => set({ activeRole: normalizeRole(role) }),
      setSession: (session) =>
        set({
          isAuthenticated: true,
          activeRole: normalizeRole(session.role),
          sessionUserId: session.userId,
          sessionDisplayName: session.displayName,
          sessionEmail: session.email,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? '',
        }),
      updateAuthTokens: (payload) =>
        set((state) => ({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken ?? state.refreshToken,
        })),
      logout: () =>
        set({
          ...initialPersistedSessionState,
          hasHydrated: true,
        }),
    }),
    {
      name: 'ruang-karir-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
        sessionUserId: state.sessionUserId,
        sessionDisplayName: state.sessionDisplayName,
        sessionEmail: state.sessionEmail,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.setActiveRole(state.activeRole)
        state.setHasHydrated(true)
      },
    },
  ),
)


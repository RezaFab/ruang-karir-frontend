import { create } from 'zustand'
import type { UserRole } from '../types'

interface SessionState {
  isAuthenticated: boolean
  activeRole: UserRole
  sessionUserId: string
  setActiveRole: (role: UserRole) => void
  loginAsMockUser: () => void
  logout: () => void
}

const INITIAL_USER_ID = 'user-001'

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: true,
  activeRole: 'user',
  sessionUserId: INITIAL_USER_ID,
  setActiveRole: (role) => set({ activeRole: role }),
  loginAsMockUser: () =>
    set({
      isAuthenticated: true,
      sessionUserId: INITIAL_USER_ID,
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      sessionUserId: '',
    }),
}))

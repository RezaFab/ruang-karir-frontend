import { create } from 'zustand'
import type { LoginResponseData, UserRole } from '../types'

interface SessionState {
  isAuthenticated: boolean
  activeRole: UserRole
  sessionUserId: string
  sessionDisplayName: string
  sessionEmail: string
  accessToken: string
  setActiveRole: (role: UserRole) => void
  setSession: (session: LoginResponseData) => void
  logout: () => void
}

const initialSessionState = {
  isAuthenticated: false,
  activeRole: 'user' as UserRole,
  sessionUserId: '',
  sessionDisplayName: '',
  sessionEmail: '',
  accessToken: '',
}

export const useSessionStore = create<SessionState>((set) => ({
  ...initialSessionState,
  setActiveRole: (role) => set({ activeRole: role }),
  setSession: (session) =>
    set({
      isAuthenticated: true,
      sessionUserId: session.userId,
      sessionDisplayName: session.displayName,
      sessionEmail: session.email,
      accessToken: session.accessToken,
    }),
  logout: () =>
    set({
      ...initialSessionState,
    }),
}))


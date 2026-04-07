import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'
import { createApiResponse, withDelay } from '../mocks/helpers'
import type { AuthApiService } from './authService'

interface MockAccount {
  id: string
  fullName: string
  username: string
  email: string
  password: string
}

const DUMMY_GOOGLE_TOKEN_PREFIX = 'dummy-google-token'

const accountState: MockAccount[] = [
  {
    id: 'admin-001',
    fullName: 'Ruang Karir User',
    username: 'RuangKarirAdmin',
    email: 'ruangkariradmin@ruangkarir.id',
    password: 'NeedLoker',
  },
]

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function buildSessionFromAccount(account: MockAccount, provider: 'password' | 'google') {
  return {
    userId: account.id,
    displayName: account.fullName,
    email: account.email,
    accessToken: `mock-token-${account.id}-${provider}`,
    authProvider: provider,
  } as const
}

function findAccountByIdentifier(identifier: string): MockAccount | undefined {
  const normalizedIdentifier = normalize(identifier)

  return accountState.find(
    (account) =>
      normalize(account.username) === normalizedIdentifier ||
      normalize(account.email) === normalizedIdentifier,
  )
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')

  if (!local || !domain) {
    return '***@***'
  }

  const prefix = local.slice(0, 2)
  return `${prefix}***@${domain}`
}

export const mockAuthApiService: AuthApiService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const account = findAccountByIdentifier(payload.identifier)
    const isPasswordValid = account?.password === payload.password

    if (!account || !isPasswordValid) {
      await withDelay(null, 650)
      throw new Error('Username/email atau password salah.')
    }

    return withDelay(createApiResponse(buildSessionFromAccount(account, 'password'), 'Login berhasil.'), 800)
  },

  async loginWithGoogle(payload: GoogleLoginRequest): Promise<LoginResponse> {
    if (!payload.idToken.trim() || !payload.idToken.startsWith(DUMMY_GOOGLE_TOKEN_PREFIX)) {
      await withDelay(null, 500)
      throw new Error('Dummy Google token tidak valid.')
    }

    const googleAccount: MockAccount = {
      id: 'google-user-001',
      fullName: 'Google User',
      username: 'google.user',
      email: 'google.user@ruangkarir.id',
      password: '',
    }

    const existingGoogleUser = accountState.find((account) => account.id === googleAccount.id)

    if (!existingGoogleUser) {
      accountState.push(googleAccount)
    }

    const sessionSource = existingGoogleUser ?? googleAccount

    return withDelay(
      createApiResponse(buildSessionFromAccount(sessionSource, 'google'), 'Login Google berhasil.'),
      750,
    )
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const normalizedUsername = normalize(payload.username)
    const normalizedEmail = normalize(payload.email)

    const duplicatedAccount = accountState.find(
      (account) =>
        normalize(account.username) === normalizedUsername ||
        normalize(account.email) === normalizedEmail,
    )

    if (duplicatedAccount) {
      await withDelay(null, 650)
      throw new Error('Username atau email sudah terdaftar.')
    }

    const newAccount: MockAccount = {
      id: `user-${Math.random().toString(36).slice(2, 10)}`,
      fullName: payload.fullName.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password,
    }

    accountState.push(newAccount)

    return withDelay(
      createApiResponse(
        {
          userId: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          displayName: newAccount.fullName,
          createdAt: new Date().toISOString(),
        },
        'Akun berhasil dibuat.',
      ),
      850,
    )
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const account = findAccountByIdentifier(payload.identifier)
    const maskedDestination = maskEmail(account?.email ?? 'user@example.com')

    return withDelay(
      createApiResponse(
        {
          deliveryChannel: 'email',
          maskedDestination,
          expiresInMinutes: 15,
        },
        'Link reset password sudah dikirim.',
      ),
      700,
    )
  },
}

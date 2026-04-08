import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponseData,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from '../types'
import { requestJson, requestJsonWithHeaders } from './httpClient'
import { endpoints } from './contracts'
import type { AuthApiService } from './authService'
import { useSessionStore } from '../store'

type GenericRecord = Record<string, unknown>

function asRecord(value: unknown): GenericRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as GenericRecord
}

function readString(record: GenericRecord | null, key: string): string | undefined {
  if (!record) {
    return undefined
  }

  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function normalizeRole(value: string | undefined): UserRole | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'admin') {
    return 'admin'
  }

  if (normalized === 'company' || normalized === 'employer') {
    return 'company'
  }

  if (normalized === 'worker' || normalized === 'user' || normalized === 'candidate') {
    return 'worker'
  }

  return undefined
}

function readRefreshTokenHeader(headers: Headers): string | undefined {
  const refreshToken = headers.get('x-refresh-token')
  if (!refreshToken || !refreshToken.trim()) {
    return undefined
  }

  return refreshToken
}

function normalizeLoginData(
  rawData: unknown,
  provider: 'password' | 'google',
  refreshTokenFromHeader?: string,
): LoginResponseData {
  const data = asRecord(rawData)
  const user = asRecord(data?.user)

  const userId = readString(data, 'userId') ?? readString(data, 'id') ?? readString(user, 'id') ?? ''
  const displayName =
    readString(data, 'displayName') ??
    readString(data, 'fullName') ??
    readString(user, 'fullName') ??
    readString(user, 'name') ??
    'Pengguna Ruang Karir'
  const email = readString(data, 'email') ?? readString(user, 'email') ?? ''
  const accessToken =
    readString(data, 'accessToken') ?? readString(data, 'token') ?? readString(data, 'jwt') ?? ''
  const refreshToken = refreshTokenFromHeader ?? readString(data, 'refreshToken')
  const authProviderRaw = readString(data, 'authProvider')
  const authProvider = authProviderRaw === 'google' || authProviderRaw === 'password' ? authProviderRaw : provider
  const role = normalizeRole(readString(data, 'role') ?? readString(user, 'role'))

  return {
    userId,
    displayName,
    email,
    accessToken,
    refreshToken,
    authProvider,
    role,
  }
}

function normalizeRefreshedAccessToken(rawData: unknown): string {
  const data = asRecord(rawData)
  return readString(data, 'accessToken') ?? readString(data, 'token') ?? readString(data, 'jwt') ?? ''
}

function buildAuthHeaders(): HeadersInit | undefined {
  const accessToken = useSessionStore.getState().accessToken
  if (!accessToken) {
    return undefined
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const realAuthApiService: AuthApiService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { response, headers } = await requestJsonWithHeaders<unknown>(endpoints.authLogin, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const refreshToken = readRefreshTokenHeader(headers)

    return {
      ...response,
      data: normalizeLoginData(response.data, 'password', refreshToken),
    }
  },

  async loginWithGoogle(payload: GoogleLoginRequest): Promise<LoginResponse> {
    const { response, headers } = await requestJsonWithHeaders<unknown>(endpoints.authGoogleLogin, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const refreshToken = readRefreshTokenHeader(headers)

    return {
      ...response,
      data: normalizeLoginData(response.data, 'google', refreshToken),
    }
  },

  async refresh(payload: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { response, headers } = await requestJsonWithHeaders<unknown>(endpoints.authRefresh, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const refreshToken = readRefreshTokenHeader(headers)
    const responseData = asRecord(response.data)

    return {
      ...response,
      data: {
        accessToken: normalizeRefreshedAccessToken(response.data),
        refreshToken: refreshToken ?? readString(responseData, 'refreshToken'),
      },
    }
  },

  logout(payload: LogoutRequest): Promise<LogoutResponse> {
    return requestJson<LogoutResponse['data']>(endpoints.authLogout, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return requestJson<RegisterResponse['data']>(endpoints.authRegister, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return requestJson<ForgotPasswordResponse['data']>(endpoints.authForgotPassword, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}


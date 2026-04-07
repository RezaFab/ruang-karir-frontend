import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'
import { requestJson } from './httpClient'
import { endpoints } from './contracts'
import type { AuthApiService } from './authService'

export const realAuthApiService: AuthApiService = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return requestJson<LoginResponse['data']>(endpoints.authLogin, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  loginWithGoogle(payload: GoogleLoginRequest): Promise<LoginResponse> {
    return requestJson<LoginResponse['data']>(endpoints.authGoogleLogin, {
      method: 'POST',
      body: JSON.stringify(payload),
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


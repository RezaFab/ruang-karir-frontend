import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'

export interface AuthApiService {
  login(payload: LoginRequest): Promise<LoginResponse>
  loginWithGoogle(payload: GoogleLoginRequest): Promise<LoginResponse>
  register(payload: RegisterRequest): Promise<RegisterResponse>
  forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse>
}


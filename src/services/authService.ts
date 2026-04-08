import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'

export interface AuthApiService {
  login(payload: LoginRequest): Promise<LoginResponse>
  refresh(payload: RefreshTokenRequest): Promise<RefreshTokenResponse>
  logout(payload: LogoutRequest): Promise<LogoutResponse>
  loginWithGoogle(payload: GoogleLoginRequest): Promise<LoginResponse>
  register(payload: RegisterRequest): Promise<RegisterResponse>
  forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse>
}


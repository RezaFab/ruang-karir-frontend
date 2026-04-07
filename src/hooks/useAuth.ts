import { useMutation } from '@tanstack/react-query'
import { authApiService } from '../services'
import type {
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from '../types'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await authApiService.login(payload)
      return response.data
    },
  })
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: async (payload: GoogleLoginRequest) => {
      const response = await authApiService.loginWithGoogle(payload)
      return response.data
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await authApiService.register(payload)
      return response.data
    },
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      const response = await authApiService.forgotPassword(payload)
      return response.data
    },
  })
}

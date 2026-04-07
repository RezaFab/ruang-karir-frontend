import type { CareerApiService } from './apiService'
import { mockCareerApiService } from './mockCareerApiService'
import { realCareerApiService } from './realCareerApiService'
import type { AuthApiService } from './authService'
import { mockAuthApiService } from './mockAuthApiService'
import { realAuthApiService } from './realAuthApiService'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

export const careerApiService: CareerApiService = useMockApi
  ? mockCareerApiService
  : realCareerApiService
export const authApiService: AuthApiService = useMockApi ? mockAuthApiService : realAuthApiService

export * from './apiService'
export * from './authService'
export * from './contracts'
export * from './queryKeys'

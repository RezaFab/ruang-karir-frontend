import type { CareerApiService } from './apiService'
import { mockCareerApiService } from './mockCareerApiService'
import { realCareerApiService } from './realCareerApiService'
import type { AuthApiService } from './authService'
import { realAuthApiService } from './realAuthApiService'

function resolveUseMockApi(value: string | undefined, fallback: boolean): boolean {
  if (typeof value === 'undefined') {
    return fallback
  }

  return value !== 'false'
}

const legacyUseMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const useMockCareerApi = resolveUseMockApi(import.meta.env.VITE_USE_MOCK_CAREER_API, legacyUseMockApi)

export const careerApiService: CareerApiService = useMockCareerApi
  ? mockCareerApiService
  : realCareerApiService
export const authApiService: AuthApiService = realAuthApiService

export * from './apiService'
export * from './authService'
export * from './contracts'
export * from './queryKeys'

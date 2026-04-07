import type { CareerApiService } from './apiService'
import { mockCareerApiService } from './mockCareerApiService'
import { realCareerApiService } from './realCareerApiService'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

export const careerApiService: CareerApiService = useMockApi
  ? mockCareerApiService
  : realCareerApiService

export * from './apiService'
export * from './contracts'
export * from './queryKeys'

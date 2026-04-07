import type { ApiResponse } from '../types'

const DEFAULT_DELAY_MS = 650

export async function withDelay<T>(data: T, delayMs = DEFAULT_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delayMs)
  })
}

export function createApiResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    data,
    message,
    meta: {
      requestId: `req-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
    },
  }
}

export function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (!total) {
    return 0
  }

  return Math.round((completed / total) * 100)
}

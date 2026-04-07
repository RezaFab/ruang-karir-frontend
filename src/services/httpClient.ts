import type { ApiResponse } from '../types'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as ApiResponse<T>
  return json
}

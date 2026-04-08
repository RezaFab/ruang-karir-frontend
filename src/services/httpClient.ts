import type { ApiResponse } from '../types'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiRequestError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.details = details
  }
}

let unauthorizedHandler: (() => void) | null = null
let tokenRefreshHandler: (() => Promise<string | null>) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export function setTokenRefreshHandler(handler: (() => Promise<string | null>) | null): void {
  tokenRefreshHandler = handler
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function resolveUrl(url: string): string {
  if (isAbsoluteUrl(url) || !API_BASE_URL) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

function isAuthEndpoint(url: string): boolean {
  const resolved = resolveUrl(url)
  return /\/api\/auth\/(login|google-login|register|forgot-password|refresh|logout)$/i.test(resolved)
}

function extractErrorMessage(
  body: unknown,
  fallbackMessage: string,
): string {
  if (typeof body === 'string' && body.trim()) {
    return body
  }

  if (body && typeof body === 'object') {
    const objectBody = body as { message?: unknown; error?: unknown }
    const message = objectBody.message

    if (typeof message === 'string' && message.trim()) {
      return message
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.map((item) => String(item)).join(', ')
    }

    if (typeof objectBody.error === 'string' && objectBody.error.trim()) {
      return objectBody.error
    }
  }

  return fallbackMessage
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text.trim()) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function mergeHeaders(headersInit?: HeadersInit): Headers {
  const headers = new Headers(DEFAULT_HEADERS)
  const additionalHeaders = new Headers(headersInit)
  additionalHeaders.forEach((value, key) => {
    headers.set(key, value)
  })
  return headers
}

async function sendRequest(
  url: string,
  init: RequestInit,
): Promise<{ response: Response; body: unknown }> {
  const response = await fetch(resolveUrl(url), {
    ...init,
    credentials: init.credentials ?? 'include',
    headers: mergeHeaders(init.headers),
  })

  const body = await parseResponseBody(response)

  return { response, body }
}

async function requestRawJsonInternal<T>(
  url: string,
  init: RequestInit = {},
  allowTokenRefresh = true,
): Promise<{ data: T; headers: Headers }> {
  const { response, body } = await sendRequest(url, init)

  if (!response.ok) {
    const fallbackMessage = `Request failed: ${response.status} ${response.statusText}`

    if (
      response.status === 401 &&
      allowTokenRefresh &&
      tokenRefreshHandler &&
      !isAuthEndpoint(url)
    ) {
      const refreshedAccessToken = await tokenRefreshHandler()

      if (refreshedAccessToken) {
        const retryHeaders = new Headers(init.headers)
        retryHeaders.set('Authorization', `Bearer ${refreshedAccessToken}`)

        return requestRawJsonInternal<T>(
          url,
          {
            ...init,
            headers: retryHeaders,
          },
          false,
        )
      }
    }

    if (response.status === 401 && unauthorizedHandler && !isAuthEndpoint(url)) {
      unauthorizedHandler()
    }

    throw new ApiRequestError(extractErrorMessage(body, fallbackMessage), response.status, body)
  }

  return {
    data: body as T,
    headers: response.headers,
  }
}

export async function requestRawJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await requestRawJsonInternal<T>(url, init)
  return data
}

export async function requestRawJsonWithHeaders<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ data: T; headers: Headers }> {
  return requestRawJsonInternal<T>(url, init)
}

export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  return requestRawJson<ApiResponse<T>>(url, init)
}

export async function requestJsonWithHeaders<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ response: ApiResponse<T>; headers: Headers }> {
  const { data, headers } = await requestRawJsonWithHeaders<ApiResponse<T>>(url, init)
  return {
    response: data,
    headers,
  }
}

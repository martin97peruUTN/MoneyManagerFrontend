import { API_URL } from '#/lib/auth-client'

/**
 * Authed API layer.
 *
 * Requests go to the API with `credentials: 'include'`. In production the
 * browser uses same-origin `/api/*` (proxied to the backend); in dev it talks
 * directly to `VITE_API_URL`.
 */

export interface ApiRequestInput {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined | null>
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Registered by the app shell so 401/403 responses can sign the user out. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

function messageFrom(data: unknown, status: number): string {
  if (typeof data === 'string' && data) return data
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return `Request failed (${status})`
}

export async function api<T>(input: ApiRequestInput): Promise<T> {
  const url = API_URL
    ? new URL(`${API_URL}${input.path}`)
    : new URL(
        input.path,
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000',
      )
  if (input.query) {
    for (const [key, value] of Object.entries(input.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: input.method ?? 'GET',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: input.body !== undefined ? JSON.stringify(input.body) : undefined,
    })
  } catch {
    throw new ApiError(502, 'Cannot reach the server')
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      unauthorizedHandler?.()
    }
    throw new ApiError(res.status, messageFrom(data, res.status))
  }

  return data as T
}

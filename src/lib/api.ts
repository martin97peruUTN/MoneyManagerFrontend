import { createServerFn } from '@tanstack/react-start'
import { getBackendToken } from '#/lib/auth.server'

/**
 * Authed API layer.
 *
 * `apiRequestFn` is a TanStack Start server function: it reads the backend JWT
 * from the sealed session cookie (server-only) and proxies the request to the
 * Express API with an `Authorization: Bearer` header. Because the backend
 * scopes every resource to the JWT's user, this generic proxy is equivalent to
 * the user calling the backend directly — the JWT just never touches the
 * browser. The client `api()` helper unwraps the result and triggers the
 * unauthorized handler on 401/403.
 */

export interface ApiRequestInput {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined | null>
}

interface ApiResult {
  ok: boolean
  status: number
  /** Raw response body text (parsed on the client) so the result stays serializable. */
  body: string | null
}

function backendBaseUrl(): string {
  return (
    process.env.API_BASE_URL ??
    process.env.VITE_API_URL ??
    'http://localhost:1234'
  )
}

export const apiRequestFn = createServerFn({ method: 'POST' })
  .inputValidator((input: ApiRequestInput) => input)
  .handler(async ({ data }): Promise<ApiResult> => {
    const token = await getBackendToken()
    if (!token) {
      return {
        ok: false,
        status: 401,
        body: JSON.stringify({ message: 'Not authenticated' }),
      }
    }

    const url = new URL(`${backendBaseUrl()}${data.path}`)
    if (data.query) {
      for (const [key, value] of Object.entries(data.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      }
    }

    const method = data.method ?? 'GET'
    let res: Response
    try {
      res = await fetch(url, {
        method,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: data.body !== undefined ? JSON.stringify(data.body) : undefined,
      })
    } catch {
      return {
        ok: false,
        status: 502,
        body: JSON.stringify({ message: 'Cannot reach the server' }),
      }
    }

    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text || null }
  })

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

function parseBody(body: string | null): unknown {
  if (!body) return null
  try {
    return JSON.parse(body)
  } catch {
    return body
  }
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
  const result = await apiRequestFn({ data: input })
  const data = parseBody(result.body)
  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      unauthorizedHandler?.()
    }
    throw new ApiError(result.status, messageFrom(data, result.status))
  }
  return data as T
}

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { Role, SessionUser } from '#/types'

const API_URL =
  process.env.API_BASE_URL ??
  process.env.VITE_API_URL ??
  'http://localhost:1234'

interface BackendSession {
  user?: {
    id: string
    email: string
    name: string
    lastname?: string | null
    image?: string | null
    role?: Role
  }
}

/**
 * Reads the Better Auth session for route guards. Runs on the TanStack Start
 * server and forwards the incoming request's Cookie header to the backend's
 * `/api/auth/get-session`, so the httpOnly session cookie never needs to be
 * read by client JS.
 */
export const fetchUserFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ user: SessionUser | null }> => {
    const request = getRequest()
    const cookie = request?.headers.get('cookie') ?? ''
    if (!cookie) return { user: null }

    try {
      const res = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { cookie },
      })
      if (!res.ok) return { user: null }
      const data = (await res.json()) as BackendSession | null
      const user = data?.user
      if (!user) return { user: null }
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastname: user.lastname ?? null,
          image: user.image ?? null,
          role: user.role ?? 'user',
        },
      }
    } catch {
      return { user: null }
    }
  },
)

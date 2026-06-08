import { createAuthClient } from 'better-auth/react'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { Role, SessionUser } from '#/types'

/** Backend origin for `/api/*`. Empty = same origin (production proxy mode). */
const configured = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)
export const API_URL =
  configured ?? (import.meta.env.DEV ? 'http://localhost:1234' : '')

export const authClient = createAuthClient({
  baseURL: API_URL || undefined,
  fetchOptions: { credentials: 'include' },
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        lastname: { type: 'string', required: false },
      },
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient

function toSessionUser(user: Record<string, unknown> | undefined): SessionUser | null {
  if (!user) return null
  return {
    id: String(user.id),
    email: String(user.email ?? ''),
    name: String(user.name ?? ''),
    lastname: (user.lastname as string | null | undefined) ?? null,
    image: (user.image as string | null | undefined) ?? null,
    role: (user.role as Role | undefined) ?? 'user',
  }
}

/**
 * Convenience wrapper over `authClient.useSession()` returning the mapped
 * session user plus role helpers. Sign-in/up flows are called directly on
 * `authClient` from the auth pages.
 */
export function useAuth() {
  const { data, isPending } = useSession()
  const user = toSessionUser(data?.user as Record<string, unknown> | undefined)
  return {
    user,
    isAdmin: user?.role === 'admin',
    isPending,
    signOut: () => authClient.signOut(),
  }
}

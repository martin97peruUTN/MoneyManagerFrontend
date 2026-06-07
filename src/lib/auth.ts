import { createServerFn } from '@tanstack/react-start'
import type { SessionUser } from '#/types'
import {
  clearSession,
  fetchSessionUser,
  loginAndStore,
  registerUser,
} from '#/lib/auth.server'

/**
 * Authentication server functions for Money Manager.
 *
 * The Express backend owns the user store. These TanStack Start server
 * functions proxy `POST /login` and `POST /user`, then persist the returned
 * JWT (plus the public user fields) in a sealed, httpOnly session cookie. The
 * server-only logic lives in `auth.server.ts`; it is referenced only inside
 * these handlers so it never reaches the client bundle.
 */

export const fetchSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ user: SessionUser | null }> => {
    return { user: await fetchSessionUser() }
  },
)

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    return loginAndStore(data.username, data.password)
  })

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      username: string
      password: string
      name: string
      lastname: string
    }) => data,
  )
  .handler(async ({ data }) => {
    return registerUser(data)
  })

export const signOutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await clearSession()
  return { ok: true }
})

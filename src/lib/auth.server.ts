import { useSession } from '@tanstack/react-start/server'
import type { SessionUser } from '#/types'

/**
 * Server-only authentication helpers. This module imports
 * `@tanstack/react-start/server` and must never be imported into client code
 * directly — only referenced inside `createServerFn().handler()` bodies (see
 * `src/lib/auth.ts` and `src/lib/api.ts`), which are stripped from the client
 * bundle.
 */

const DEV_FALLBACK_SECRET = 'money-manager-dev-secret-change-me-please-0123456789'

export function backendBaseUrl(): string {
  return (
    process.env.API_BASE_URL ??
    process.env.VITE_API_URL ??
    'http://localhost:1234'
  )
}

function sessionSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? process.env.SESSION_SECRET
  if (!secret) return DEV_FALLBACK_SECRET
  // Start's session seal requires a >= 32 character password.
  return secret.length >= 32 ? secret : (secret + DEV_FALLBACK_SECRET).slice(0, 64)
}

interface SessionData {
  token: string
  user: SessionUser
}

function getMmSession() {
  return useSession<SessionData>({
    password: sessionSecret(),
    name: 'mm_session',
    maxAge: 60 * 60 * 6, // 6h, matching the backend JWT expiry
  })
}

interface BackendLoginResponse {
  token: string
  user: SessionUser
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return fallback
    try {
      const json = JSON.parse(text) as { message?: string }
      return json.message ?? text
    } catch {
      return text
    }
  } catch {
    return fallback
  }
}

export async function loginAndStore(
  username: string,
  password: string,
): Promise<{ user: SessionUser } | { error: string }> {
  let res: Response
  try {
    res = await fetch(`${backendBaseUrl()}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    return { error: 'Cannot reach the server. Please try again later.' }
  }
  if (!res.ok) {
    return { error: await extractError(res, 'Invalid username or password') }
  }
  const data = (await res.json()) as BackendLoginResponse
  const session = await getMmSession()
  await session.update({ token: data.token, user: data.user })
  return { user: data.user }
}

export async function registerUser(input: {
  username: string
  password: string
  name: string
  lastname: string
}): Promise<{ user: SessionUser } | { error: string }> {
  let res: Response
  try {
    res = await fetch(`${backendBaseUrl()}/user`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    return { error: 'Cannot reach the server. Please try again later.' }
  }
  if (!res.ok) {
    return { error: await extractError(res, 'Could not create the account') }
  }
  return loginAndStore(input.username, input.password)
}

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const session = await getMmSession()
  return session.data.user ?? null
}

export async function clearSession(): Promise<void> {
  const session = await getMmSession()
  await session.clear()
}

/** Reads the backend JWT from the sealed session cookie. */
export async function getBackendToken(): Promise<string | null> {
  const session = await getMmSession()
  return session.data.token ?? null
}

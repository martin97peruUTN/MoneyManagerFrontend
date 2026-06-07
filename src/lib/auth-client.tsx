import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { signInFn, signOutFn, signUpFn } from '#/lib/auth'
import { setUnauthorizedHandler } from '#/lib/api'
import type { SessionUser } from '#/types'

interface AuthActionResult {
  error?: string
}

interface AuthContextValue {
  user: SessionUser | null
  isAdmin: boolean
  signIn: (username: string, password: string) => Promise<AuthActionResult>
  signUp: (input: {
    username: string
    password: string
    name: string
    lastname: string
  }) => Promise<AuthActionResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | null
  children: ReactNode
}) {
  const router = useRouter()

  const signIn = useCallback(
    async (username: string, password: string): Promise<AuthActionResult> => {
      const result = await signInFn({ data: { username, password } })
      if ('error' in result) return { error: result.error }
      await router.invalidate()
      return {}
    },
    [router],
  )

  const signUp = useCallback(
    async (input: {
      username: string
      password: string
      name: string
      lastname: string
    }): Promise<AuthActionResult> => {
      const result = await signUpFn({ data: input })
      if ('error' in result) return { error: result.error }
      await router.invalidate()
      return {}
    },
    [router],
  )

  const signOut = useCallback(async () => {
    await signOutFn()
    await router.invalidate()
    await router.navigate({ to: '/login' })
  }, [router])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut()
    })
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === 'Admin',
      signIn,
      signUp,
      signOut,
    }),
    [user, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

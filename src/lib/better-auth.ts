import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

/**
 * Better Auth instance, mounted at `/api/auth/*` via `src/routes/api/auth/$.ts`.
 *
 * The Money Manager credential flow does NOT use Better Auth's built-in
 * email/password store (the Express backend is the source of truth for users).
 * Authentication is proxied to the backend through the TanStack Start server
 * functions in `src/lib/auth.ts`, which persist the backend JWT in a sealed,
 * httpOnly session cookie. Better Auth remains wired here as the required
 * partner integration and keeps the `/api/auth/*` handler available.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})

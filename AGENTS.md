<!-- intent-skills:start -->
# Skill mappings - load `use` with `pnpm dlx @tanstack/intent@latest load <use>`.
skills:
  - when: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
    use: "@tanstack/devtools#devtools-app-setup"
  - when: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
    use: "@tanstack/devtools#devtools-marketplace"
  - when: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
    use: "@tanstack/devtools#devtools-plugin-panel"
  - when: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
    use: "@tanstack/devtools#devtools-production"
  - when: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
    use: "@tanstack/devtools-event-client#devtools-bidirectional"
  - when: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
    use: "@tanstack/devtools-event-client#devtools-event-client"
  - when: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
    use: "@tanstack/devtools-event-client#devtools-instrumentation"
  - when: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
    use: "@tanstack/devtools-vite#devtools-vite-plugin"
  - when: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
    use: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
  - when: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
    use: "@tanstack/react-start#react-start"
  - when: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
    use: "@tanstack/react-start#react-start/server-components"
  - when: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
    use: "@tanstack/router-core#router-core"
  - when: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
    use: "@tanstack/router-core#router-core/auth-and-guards"
  - when: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
    use: "@tanstack/router-core#router-core/code-splitting"
  - when: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
    use: "@tanstack/router-core#router-core/data-loading"
  - when: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
    use: "@tanstack/router-core#router-core/navigation"
  - when: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
    use: "@tanstack/router-core#router-core/not-found-and-errors"
  - when: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
    use: "@tanstack/router-core#router-core/path-params"
  - when: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
    use: "@tanstack/router-core#router-core/search-params"
  - when: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
    use: "@tanstack/router-core#router-core/ssr"
  - when: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
    use: "@tanstack/router-core#router-core/type-safety"
  - when: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
    use: "@tanstack/router-plugin#router-plugin"
  - when: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
    use: "@tanstack/virtual-file-routes#virtual-file-routes"
<!-- intent-skills:end -->

# Money Manager Frontend

TanStack Start SPA for the **MoneyManagerBackend** Express + PostgreSQL REST API.
Personal finance app: accounts, currencies, transactions, transfers, categories,
users. No mock data — every screen is wired to the real backend.

## Scaffold commands (run with pnpm)

```bash
# Project scaffold (folder name must be lowercase, then moved into MoneyManagerFrontend)
pnpm dlx @tanstack/cli@latest create mm-frontend --agent --deployment railway \
  --add-ons form,shadcn,table,tanstack-query,better-auth

# TanStack Intent (skills already installed by the scaffold)
pnpm dlx @tanstack/intent@latest install
pnpm dlx @tanstack/intent@latest list
pnpm dlx @tanstack/intent@latest load "@tanstack/react-start#react-start"
pnpm dlx @tanstack/intent@latest load "@tanstack/router-core#router-core/auth-and-guards"

# shadcn/ui components
pnpm dlx shadcn@latest add card table badge dialog alert-dialog tabs popover \
  skeleton dropdown-menu sidebar avatar separator tooltip sheet breadcrumb

# extra runtime deps
pnpm add sonner @tanstack/react-store @tanstack/store
```

## Stack & integrations

- TanStack **Start** (SSR) + **Router** (file routes, guards) + **Query** + **Table** + **Form** + **Store**
- TanStack **CLI** + **Intent** (scaffolding + skills)
- **better-auth** via its **React client** (`better-auth/react`) talking to the
  backend's `/api/auth/*` (auth lives on the Express backend, not here);
  **shadcn/ui** (New York, zinc) + Tailwind v4
- Deployment: **Render** (`render.yaml`, Node 22, pnpm) or Railway (`nixpacks.toml`)

## Local dev

```bash
pnpm install
pnpm dev      # http://localhost:3000 (Vite/Start)
pnpm build    # production build
pnpm start    # node .output/server/index.mjs
```

The backend must be running (default `http://localhost:1234`, `pnpm run dev` in
MoneyManagerBackend).

## Environment variables

| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL read **in the browser**; Better Auth client + data calls hit it directly with `credentials: 'include'`. Defaults to `http://localhost:1234`. |
| `API_BASE_URL` | Same backend URL read **on the Start server** for the SSR session lookup. Keep in sync with `VITE_API_URL`. |

There are no `BETTER_AUTH_*` vars on the frontend anymore — auth (and its
secret) live entirely on the backend. See `.env.example`; local values live in
`.env.local` (gitignored).

## Architecture / key decisions

- **Auth lives on the backend.** Better Auth runs on the Express API at
  `/api/auth/*` (email/password + Google + GitHub, cookie sessions, admin
  plugin). The frontend uses the Better Auth **React client**
  (`src/lib/auth-client.ts`, `createAuthClient` + `adminClient` +
  `inferAdditionalFields` for `lastname`) pointed at `VITE_API_URL`.
  `useAuth()` wraps `authClient.useSession()` and exposes `{ user, isAdmin }`.
- **Sign-in/up/out** are called directly on `authClient` from the auth pages
  (`signIn.email`, `signIn.social({ provider })`, `signUp.email`, `signOut`);
  profile changes use `authClient.updateUser / changePassword / deleteUser`.
- **SSR session for guards**: `src/lib/session.ts` exposes `fetchUserFn`, a Start
  server function that forwards the incoming `Cookie` header to the backend's
  `/api/auth/get-session`. The root `beforeLoad` puts the result on router
  context (`context.user`); the cookie is never read by client JS.
- **API access**: `src/lib/api.ts` `api()` is a direct `fetch` to `VITE_API_URL`
  with `credentials: 'include'`; 401/403 triggers `authClient.signOut()` +
  redirect to `/login`.
- **Route guards**: `_authenticated.tsx` redirects anonymous users to `/login`;
  `_authenticated/_admin.tsx` requires `role === 'admin'` (roles are lowercase).
- **TanStack Store** (`src/lib/store.ts`) holds the shared date-range filter and
  theme mode.
- **Query keys** centralized in `src/lib/query-keys.ts`; mutations invalidate
  accounts + the affected resource (balances change on the backend).

## Gotchas

- TanStack `create` rejects uppercase project names — scaffold lowercase then move.
- Moving `node_modules` across folders breaks pnpm's virtual store; run a clean
  `pnpm install` after relocating.
- Date inputs are `YYYY-MM-DD`; POST/PATCH bodies send ISO datetimes.
- **Cookies**: in local dev the backend's host-only `localhost` session cookie is
  shared across ports, so SSR cookie-forwarding works. In production with
  different domains, set the backend cookie to `SameSite=None; Secure`, serve
  both over HTTPS, and set the backend `FRONTEND_ORIGIN` to the exact origin.
- `user.id` is a **string** (Better Auth), and `role` is `'admin' | 'user'`.

## Render deploy

1. Push this repo to GitHub.
2. Render → **New** → **Web Service** (or **Blueprint** if using `render.yaml`).
3. **Build command**: `pnpm install --frozen-lockfile && pnpm run build`
4. **Start command**: `pnpm start`
5. **Environment** (both required; use your Render **backend** URL):

   | Variable | Example |
   |----------|---------|
   | `VITE_API_URL` | `https://money-manager-backend.onrender.com` |
   | `API_BASE_URL` | same as above |

   `VITE_API_URL` is baked into the client bundle at **build time** — set it before the first deploy (or redeploy after changing it).

6. On the **backend** Render service, set `FRONTEND_ORIGIN` to this frontend URL (exact origin, no trailing slash).

Both apps on Render free tier spin down when idle (~30s cold start). HTTPS is automatic.

## Next steps

- Add pagination/server-side filtering for large transaction lists.
- Configure real Google/GitHub OAuth credentials in the backend env.
- Consider email verification for the email/password flow.


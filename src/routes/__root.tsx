import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { fetchSessionFn } from '#/lib/auth'
import { AuthProvider } from '#/lib/auth-client'
import { TooltipProvider } from '#/components/ui/tooltip'
import { initThemeFromStorage, useTheme } from '#/lib/store'
import type { SessionUser } from '#/types'

import appCss from '../styles.css?url'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Money Manager' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async (): Promise<{ user: SessionUser | null }> => {
    const { user } = await fetchSessionFn()
    return { user }
  },
  component: RootComponent,
})

function RootComponent() {
  const { user } = Route.useRouteContext()
  return (
    <RootDocument>
      <AuthProvider user={user}>
        <TooltipProvider delayDuration={200}>
          <Outlet />
        </TooltipProvider>
      </AuthProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const theme = useTheme()

  useEffect(() => {
    initThemeFromStorage()
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster
          richColors
          closeButton
          position="top-right"
          theme={theme === 'auto' ? 'system' : theme}
        />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

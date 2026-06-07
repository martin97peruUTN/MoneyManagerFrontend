import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Keep better-auth (and its kysely SQLite adapters) out of the SSR bundle.
  // We never configure a database, so better-auth uses its in-memory adapter at
  // runtime; the unused SQLite dialects statically import constants kysely no
  // longer exports, which only breaks static bundling — not runtime.
  ssr: {
    external: ['better-auth', '@better-auth/kysely-adapter', 'kysely'],
  },
  plugins: [
    devtools(),
    // Externalize better-auth (and its kysely SQLite adapters) from the server
    // bundle: we don't configure a database, so better-auth uses its in-memory
    // adapter at runtime and the unused SQLite dialects (which statically import
    // constants kysely no longer exports) never get bundled or executed.
    nitro({
      rollupConfig: {
        external: [/^@sentry\//, /^better-auth/, /^@better-auth\//, 'kysely'],
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

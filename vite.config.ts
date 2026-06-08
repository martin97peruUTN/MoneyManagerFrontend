import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

/** When set, Nitro proxies `/api/**` to this backend (production same-origin auth). */
const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '')

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro(
      backendUrl
        ? {
            routeRules: {
              '/api/**': { proxy: `${backendUrl}/api/**` },
            },
          }
        : {},
    ),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

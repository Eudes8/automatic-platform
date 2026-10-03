import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Variables requises par src/lib/auth-server.ts au chargement (tests only)
    env: {
      NEON_AUTH_BASE_URL: 'https://test-auth.example.com/neondb/auth',
      NEON_AUTH_COOKIE_SECRET: 'test-cookie-secret-0123456789abcdef0123456789abcdef',
    },
    // @neondatabase/auth importe "next/headers" sans extension (ESM strict
    // Node) : on inline le package pour que Vite le transforme et résolve
    // ses imports via la exports map de Next.
    server: {
      deps: {
        inline: [/@neondatabase\/auth/],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

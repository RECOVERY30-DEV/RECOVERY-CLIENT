import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react(), svgr({ include: '**/*.svg' })],
  test: {
    environment: 'jsdom',
    include: ['src/test/svgr.integration.tsx'],
    setupFiles: ['./src/test/setup.ts'],
  },
})

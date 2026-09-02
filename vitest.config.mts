import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, '.agents/**', '.codex/**'],
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})

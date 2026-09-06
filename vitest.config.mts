import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react(), svgr({ include: '**/*.svg' })],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, '**/{__fixtures__,fixtures}/**'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})

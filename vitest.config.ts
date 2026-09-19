import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // scratch/ holds reference checkouts (scandihaven, fitness-studio-new) —
    // never picked up by this project's test run
    exclude: ['node_modules/**', 'scratch/**', '.next/**'],
  },
})

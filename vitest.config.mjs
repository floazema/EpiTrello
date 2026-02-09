import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { resolve } from 'path'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [resolve(root, 'setupTests.mjs')],
    globals: true,
    include: ['unitTest/**/*.{test,spec}.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(root, '.'),
    },
  },
})
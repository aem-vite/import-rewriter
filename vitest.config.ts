import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: '../coverage',
      reporter: ['html'],
    },

    root: './src',
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: '../coverage',
      reporter: process.env.GITHUB_ACTIONS ? ['github-actions'] : ['html'],
    },

    root: './src',
  },
})

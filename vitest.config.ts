import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'json', 'json-summary', 'text'],
      reportsDirectory: '../coverage',
      reportOnFailure: true,
    },

    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
    root: './src',
  },
})

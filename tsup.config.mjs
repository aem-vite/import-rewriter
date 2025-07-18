import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'lib',
  sourcemap: false,
  splitting: true,
  target: ['node20', 'node22', 'node24'],
})

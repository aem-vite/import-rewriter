import path from 'path'

import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: {
    index: path.resolve(__dirname, 'src/index.ts'),
  },

  output: {
    dir: path.resolve(__dirname, 'lib'),
    exports: 'named',
    sourcemap: true,
  },

  external: [
    'fsevents',
    ...Object.keys(require('./package.json').dependencies),
  ],

  plugins: [
    nodeResolve({ preferBuiltins: true }),

    typescript({
      target: 'es2018',
      include: ['src/**/*.ts'],
      esModuleInterop: true,
    }),

    commonjs({ extensions: ['.js'] }),
  ],

  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
}

export default config
import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import {
  debug,
  getAemClientLibPath,
  getEntryPaths,
  getReplacementPath,
  relativePathPattern,
  setEntryPath,
} from './helpers'

import type { ImportSpecifier } from 'es-module-lexer'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { InputOptions } from 'rollup'
import type { PluginOption } from 'vite'

import type { BundlesImportRewriterOptions } from './types'

/**
 * Identifies all ES imports and converts them into AEM ClientLib compliant paths.
 *
 * @param options import rewriter options
 */
export function bundlesImportRewriter(options: BundlesImportRewriterOptions): PluginOption {
  const entryAliases: NonNullable<InputOptions['input']> = {}

  return {
    apply: 'build',
    enforce: 'post',
    name: 'aem-vite:import-rewriter',

    configResolved(config) {
      const inputs = config.build.rollupOptions.input

      if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
        throw new Error(
          'Missing valid input aliases which are required to map to an AEM ClientLib path, see https://www.aemvite.dev/guide/front-end/vite/#source-structure for more information.',
        )
      }

      for (const [key, value] of Object.entries(inputs)) {
        if (/(ts|js)x?$/.test(value)) {
          entryAliases[key] = value
        }
      }

      if (Object.keys(entryAliases).length > 1) {
        throw new Error(
          'Invalid number of JavaScript inputs provided. Only a single input is currently supported which is a limitation of AEM ClientLibs. It is recommended to create a second ClientLib and Vite config if you need to meet this need.',
        )
      }
    },

    async renderChunk(source, chunk, rollupOptions) {
      if (rollupOptions.format !== 'es') {
        return null
      }

      if (!options?.publicPath.length) {
        this.error(
          `'publicPath' doesn't appear to be defined, see https://aemvite.dev/guide/faqs/#vite-errors for more information.`,
        )
      }

      if (chunk.isEntry && chunk.facadeModuleId && /(ts|js)x?$/.test(chunk.facadeModuleId)) {
        debug('setting new entry path: %s\n', chunk.fileName)

        setEntryPath(chunk.fileName)
      }

      await init

      let imports: ReadonlyArray<ImportSpecifier> = []
      try {
        imports = parseImports(source)[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        this.error({ ...e })
      }

      if (!imports.length) {
        return null
      }

      let s!: MagicString
      const str = () => s || (s = new MagicString(source))

      for (const element of imports) {
        const { e: end, d: dynamicIndex, n: importPath, s: start } = element

        if (dynamicIndex === -1 && importPath && relativePathPattern.test(importPath)) {
          const replacementPath = getReplacementPath(chunk.fileName, importPath, options, entryAliases)

          debug('(render chunk)')
          debug('chunk file name:       %s', chunk.fileName)
          debug('import path:           %s', importPath)
          debug('updated import path:   %s\n', replacementPath)

          str().overwrite(start, end, replacementPath)
        }
      }

      if (s) {
        return {
          code: s.toString(),
          map: rollupOptions.sourcemap !== false ? s.generateMap({ hires: true }) : null,
        }
      }

      return null
    },

    async writeBundle(rollupOptions, bundle) {
      const aemClientLibPath = getAemClientLibPath(options)

      debug('(generate bundle)')
      debug('aem clientlib path: %s', aemClientLibPath)

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.imports) {
          continue
        }

        debug('(generate bundle)')
        debug('bundle name:           %s', fileName)

        const source = chunk.code

        await init

        let imports: ReadonlyArray<ImportSpecifier> = []
        try {
          imports = parseImports(source)[0]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          this.error({ ...e })
        }

        if (!imports.length) {
          continue
        }

        let s!: MagicString
        const str = () => s || (s = new MagicString(source))

        for (const element of imports) {
          const { e: end, d: dynamicIndex, n: importPath, s: start } = element

          // Native imports
          if (dynamicIndex === -1 && importPath && relativePathPattern.test(importPath)) {
            const replacementPath = getReplacementPath(chunk.fileName, importPath, options, entryAliases)

            debug('chunk file name:       %s', chunk.fileName)
            debug('import type:           native')
            debug('import path:           %s\n', importPath)

            str().overwrite(start, end, replacementPath)
          }

          // Dynamic imports
          if (dynamicIndex > -1 && importPath) {
            debug('chunk file name:       %s', chunk.fileName)
            debug('import type:           dynamic')
            debug('import path:           %s', importPath)

            const dynamicEnd = source.indexOf(')', end) + 1
            const original = source.slice(dynamicIndex + 8, dynamicEnd - 2)

            debug('updated import path:   %s\n', getReplacementPath(chunk.fileName, importPath, options, entryAliases))

            if (!original.startsWith('/')) {
              str().overwrite(start + 1, end - 1, getReplacementPath(chunk.fileName, importPath, options, entryAliases))
            }
          }
        }

        let aemImportPath = aemClientLibPath
        let newSource = s?.toString() ?? source

        if (options.caching && options.caching.enabled) {
          aemImportPath = getAemClientLibPath(options, false, true, rollupOptions)
        }

        // Ensure all entry file imports are replaced with the correct AEM ClientLib path
        newSource = newSource.replace(new RegExp(aemClientLibPath, 'g'), aemImportPath)

        // Replace any entry paths
        const relativeClientLibPath = aemImportPath.substring(aemImportPath.lastIndexOf('/') + 1)

        getEntryPaths().forEach((path) => {
          newSource = newSource.replace(new RegExp(path, 'g'), relativeClientLibPath)
        })

        chunk.code = newSource
        chunk.map = rollupOptions.sourcemap !== false ? s.generateMap({ hires: true }) : null

        debug('generate entry chunk:  %s', chunk.fileName)

        await writeFile(join(rollupOptions.dir as string, fileName), newSource)
      }
    },
  }
}

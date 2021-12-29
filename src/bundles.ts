import { writeFileSync } from 'fs'
import { join } from 'path'

import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import {
  getAEMImportFilePath,
  getMainEntryPath,
  getReplacementPath,
  hasMainEntryPath,
  isOutputChunk,
  relativePathPattern,
  setMainEntryPath,
} from './helpers'

import type { ImportSpecifier } from 'es-module-lexer'
import type { NormalizedOutputOptions } from 'rollup'
import type { Plugin } from 'vite'

import type { BundlesImportRewriterOptions } from './types'

/**
 * Identifies all ES imports and converts them into AEM ClientLib compliant paths.
 *
 * @param options import rewriter options
 */
export function bundlesImportRewriter(options: BundlesImportRewriterOptions): Plugin {
  return {
    apply: 'build',
    enforce: 'post',
    name: 'aem-vite:import-rewriter',

    async renderChunk(source, chunk, rollupOptions) {
      if (rollupOptions.format !== 'es') {
        return null
      }

      if (!options.publicPath || !options.publicPath.length) {
        this.error(
          `'publicPath' doesn't appear to be defined, see https://aemvite.dev/guide/faqs/#vite-errors for more information.`,
        )
      }

      if (
        options.mainEntryPath ||
        (chunk.isEntry && chunk.facadeModuleId && /(ts|js)x?$/.test(chunk.facadeModuleId) && !hasMainEntryPath())
      ) {
        setMainEntryPath(options.mainEntryPath || chunk.fileName)
      }

      await init

      let imports: ReadonlyArray<ImportSpecifier> = []
      try {
        imports = parseImports(source)[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        this.error(e, e.idx)
      }

      if (!imports.length) {
        return null
      }

      let s!: MagicString
      const str = () => s || (s = new MagicString(source))

      for (let index = 0; index < imports.length; index++) {
        const { e: end, d: dynamicIndex, n: importPath, s: start } = imports[index]

        if (dynamicIndex === -1 && importPath && relativePathPattern.test(importPath)) {
          str().overwrite(start, end, getReplacementPath(importPath, options, chunk.imports))
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

    async writeBundle(rollupOptions, bundles) {
      const mainEntryPath = getMainEntryPath()

      for (const [fileName, chunk] of Object.entries(bundles)) {
        if (!isOutputChunk(chunk) || !chunk.code) {
          continue
        }

        const source = chunk.code

        if (mainEntryPath === fileName && options.caching && options.caching.enabled) {
          const mainEntryAEMPath = getAEMImportFilePath(mainEntryPath, options)

          const mainEntryAEMPathWithHash = getAEMImportFilePath(
            mainEntryPath,
            options,
            true,
            rollupOptions as NormalizedOutputOptions,
          )

          writeFileSync(
            join(rollupOptions.dir as string, fileName),
            source.replace(mainEntryAEMPath, mainEntryAEMPathWithHash),
          )
        } else {
          await init

          let imports: ReadonlyArray<ImportSpecifier> = []
          try {
            imports = parseImports(source)[0]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            this.error(e, e.idx)
          }

          if (!imports.length) {
            continue
          }

          let s!: MagicString
          const str = () => s || (s = new MagicString(source))

          for (let index = 0; index < imports.length; index++) {
            const { e: end, d: dynamicIndex } = imports[index]

            if (dynamicIndex > -1) {
              const dynamicEnd = source.indexOf(')', end) + 1
              const original = source.slice(dynamicIndex + 8, dynamicEnd - 2)

              if (!original.startsWith('/')) {
                str().overwrite(
                  dynamicIndex + 8,
                  dynamicEnd - 2,
                  getReplacementPath(original, options, chunk.dynamicImports),
                )
              }
            }
          }

          writeFileSync(join(rollupOptions.dir as string, fileName), (s && s.toString()) || source)
        }
      }
    },
  }
}

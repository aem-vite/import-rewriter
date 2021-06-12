import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import type { ImportSpecifier } from 'es-module-lexer'
import type { OutputPlugin } from 'rollup'
import type { ConfigEnv } from 'vite/dist/node/index'

export interface ImportRewriterOptions {
  /**
   * The current Vite command been used.
   */
  command: ConfigEnv['command']

  /**
   * The public path in AEM where your ClientLibs are stored.
   */
  publicPath: string
}

const relativePathPattern = /([.]{1,2}\/)+/

let mainEntryPath: string | null = null

/**
 * Determines whether to use the native AEM ClientLib path or the provided `path`.
 *
 * @param path the import path
 * @returns the real AEM ClientLib path or the original `path`
 */
function getAEMImportFilePath(path: string): string {
  if (mainEntryPath && mainEntryPath === path) {
    return `${path.substr(0, path.indexOf('/'))}.js`
  }

  return path
}

/**
 * Converts the standard import path into an AEM compliant ClientLib path.
 *
 * @param path the import path
 * @param options import rewriter options
 * @param imports a list of available imports
 * @returns an AEM compliant ClientLib path
 */
function getReplacementPath(path: string, options: ImportRewriterOptions, imports: string[]): string {
  if (options.command === 'serve') {
    return '/'
  }

  const matchedImport = imports.find((imp) => imp.endsWith(path.replace(relativePathPattern, '')))

  return matchedImport
    ? path.replace(
        new RegExp(`${relativePathPattern.source}${path.replace(relativePathPattern, '')}`),
        options.publicPath + getAEMImportFilePath(matchedImport),
      )
    : path
}

/**
 * Identifies all ES imports and converts them into AEM ClientLib compliant paths.
 *
 * @param options import rewriter options
 */
export default function aemViteImportRewriter(options: ImportRewriterOptions): OutputPlugin {
  return {
    name: 'aem-vite:import-rewrite',

    async renderChunk(source, chunk, rollupOptions) {
      if (!options.command || !options.publicPath || !options.publicPath.length) {
        this.error(
          `Either 'command' or 'publicPath' haven't been defined, see https://aemvite.dev/guide/faqs/#vite-errors for more information.`,
        )
      }

      if (chunk.isEntry && chunk.facadeModuleId && /(ts|js)$/.test(chunk.facadeModuleId) && !mainEntryPath) {
        mainEntryPath = chunk.fileName
      }

      await init

      let imports: ReadonlyArray<ImportSpecifier> = []
      try {
        imports = parseImports(source)[0]
      } catch (e) {
        this.error(e, e.idx)
      }

      if (!imports.length) {
        return null
      }

      let s!: MagicString
      const str = () => s || (s = new MagicString(source))

      for (let index = 0; index < imports.length; index++) {
        const { e: end, d: dynamicIndex, n: importPath, s: start } = imports[index]

        // Purely just dynamic imports
        if (dynamicIndex > -1) {
          const dynamicEnd = source.indexOf(')', end) + 1
          const original = source.slice(dynamicIndex + 8, dynamicEnd - 2)

          str().overwrite(dynamicIndex + 8, dynamicEnd - 2, getReplacementPath(original, options, chunk.dynamicImports))
        }

        // Handle native imports too
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
  }
}

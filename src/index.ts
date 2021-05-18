import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import type { ImportSpecifier } from 'es-module-lexer'
import type { OutputPlugin, RenderedChunk } from 'rollup'
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

function getReplacementPath(
  path: string,
  options: ImportRewriterOptions,
  chunk: RenderedChunk,
  isDynamicImport = false,
): string {
  const imports = isDynamicImport ? chunk.dynamicImports : chunk.imports

  const matchedImport = imports.find((imp) => imp.endsWith(path.replace(relativePathPattern, '')))

  return matchedImport
    ? options.command === 'serve'
      ? '/'
      : path.replace(
          new RegExp(`${relativePathPattern.source}${path.replace(relativePathPattern, '')}`),
          options.publicPath + matchedImport,
        )
    : path
}

export default function aemViteImportRewriter(options: ImportRewriterOptions): OutputPlugin {
  return {
    name: 'aem-vite:import-rewrite',

    async renderChunk(source, chunk, rollupOptions) {
      if (!options.command || !options.publicPath || !options.publicPath.length) {
        this.error(
          `Either 'command' or 'publicPath' haven't been defined, see https://aemvite.dev/guide/faqs/#vite-errors for more information.`,
        )
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

          str().overwrite(dynamicIndex + 8, dynamicEnd - 2, getReplacementPath(original, options, chunk, true))
        }

        // Handle native imports too
        if (dynamicIndex === -1 && importPath && relativePathPattern.test(importPath)) {
          str().overwrite(start, end, getReplacementPath(importPath, options, chunk))
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

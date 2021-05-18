import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import type { ImportSpecifier } from 'es-module-lexer'
import type { OutputPlugin } from 'rollup'
import type { ConfigEnv } from 'vite/dist/node/index'

export interface ImportRewriterOptions {
  /**
   * The current Vite command been used.
   * @type {String}
   */
  command: ConfigEnv['command']

  /**
   * The public path in AEM where your ClientLibs are stored.
   * @type {String}
   */
  publicPath: string
}

const pattern = /([.]+\/)+/

function getReplacementPath(path: string, options: ImportRewriterOptions): string {
  // Whenever Vite has been started with the DevServer, change the 'publicPath' to '/' as that is the root dir
  return path.replace(pattern, options.command === 'serve' ? '/' : options.publicPath)
}

export default function aemViteImportRewriter(options: ImportRewriterOptions): OutputPlugin {
  return {
    name: 'aem-vite:import-rewrite',

    async renderChunk(source, _, rollupOptions) {
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
          const original = source.slice(dynamicIndex, dynamicEnd)

          str().overwrite(dynamicIndex, dynamicEnd, getReplacementPath(original, options))
        }

        // Handle native imports too
        if (dynamicIndex === -1 && importPath && pattern.test(importPath)) {
          str().overwrite(start, end, getReplacementPath(importPath, options))
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

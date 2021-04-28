import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import type { ImportSpecifier } from 'es-module-lexer'
import type { OutputPlugin } from 'rollup'
import type { ConfigEnv } from 'vite/dist/node/index'

export interface ImportRewriterOptions {
  command: ConfigEnv['command']
  publicPath: string
}

export default function aemViteImportRewriter(options: ImportRewriterOptions): OutputPlugin {
  const pattern = /([.]+\/)+/

  return {
    name: 'aem-vite:imports-rewrite',

    async renderChunk(source, _, rollupOptions) {
      if (!options.command || !options.publicPath || !options.publicPath.length) {
        this.error(
          `Either 'command' or 'publicPath' haven't been defined, see https://aem-vite.dev/guide/faq/#vite-errors for more information.`,
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
        const { e: end, d: dynamicIndex } = imports[index]

        if (dynamicIndex > -1) {
          const dynamicEnd = source.indexOf(')', end) + 1
          const original = source.slice(dynamicIndex, dynamicEnd)

          // Whenever Vite has been started with the DevServer, change the 'publicPath' to '/' as that is the root dir
          const replacement = original.replace(pattern, options.command === 'serve' ? '/' : options.publicPath)

          str().overwrite(dynamicIndex, dynamicEnd, replacement)
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

import { createFilter } from 'rollup-pluginutils'

import type { Plugin } from 'vite'

import type { CssImportRewriterOptions } from './types'

/**
 * Identifies all static asset paths and converts them into AEM ClientLib compliant paths.
 *
 * @param options import rewriter options
 */
export function cssImportRewriter(options: CssImportRewriterOptions): Plugin {
  const filter = createFilter(/\.(scss|sass|less|styl|stylus|css)$/i, [])

  return {
    enforce: 'post',
    name: 'aem-vite:import-rewriter:css',

    transform(code, id) {
      if (filter(id)) {
        code = code.replace(new RegExp(options.assetsBasePath, 'g'), options.publicPath)

        return {
          code,
          id,
          // TODO: Inherited from Vite's TODO to implement source maps
          map: { mappings: '' },
        }
      }
    },
  }
}

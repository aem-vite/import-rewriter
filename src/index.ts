import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { init, parse as parseImports } from 'es-module-lexer'
import MagicString from 'magic-string'

import type { ImportSpecifier } from 'es-module-lexer'
import type { NormalizedOutputOptions, OutputAsset, OutputChunk, OutputPlugin } from 'rollup'
import type { ConfigEnv } from 'vite/dist/node/index'

export interface AEMLongCacheConfiguration {
  /**
   * Set to `true` to have an MD5 checksum automatically generated for the JavaScript entries paths.
   *
   * @example
   * ```ts
   * caching: {
   *   enabled: command === 'build' && mode === 'development'
   * }
   * ```
   */
  enabled: boolean

  /**
   * Define the long cache key format that will be injected into the entry paths.
   *
   * Ensure you set this correctly for your particular AEM configuration as it will change
   * when using the AEM SDK (AEMaaCS) vs using ACS Commons Versioned ClientLibs. When using
   * ACS Commons Versioned ClientLibs you will need to set this to `false` as it only uses
   * an MD5 checksum.
   *
   * @default lc-%s-lc
   */
  keyFormat?: string | false

  /**
   * Define whether your HTML Library Manager configuration has the `minify` option enabled.
   * This will replace `.js` with `.min.js` to match AEM.
   *
   * @default false
   */
  minification?: boolean
}

export interface ImportRewriterOptions {
  /**
   * Define how and when caching should be implemented when building bundles.
   */
  caching?: AEMLongCacheConfiguration

  /**
   * The current Vite command been used.
   */
  command: ConfigEnv['command']

  /**
   * Define the main entry path used for your Vite builds.
   *
   * The AEM Vite import rewriter plugin will automatically assume the first entry defined is
   * the correct file but you can override this for each Vite configuration.
   *
   * Any path you do define needs to be relative to your configured output directory.
   *
   * @example
   * ```ts
   * {
   *   mainEntryPath: 'core.footer/resources/js/main.js',
   * }
   * ```
   */
  mainEntryPath?: string

  /**
   * The public path in AEM where your ClientLibs are stored.
   */
  publicPath: string
}

const relativePathPattern = /([.]{1,2}\/)+/

let mainEntryPath: string | null = null

/**
 * Determine if the provided `assetOrChunk` object is a chunk instance.
 *
 * @param assetOrChunk an instance of either `OutputAsset` or `OutputChunk`
 * @returns `true` when `OutputChunk`, otherwise `false`
 */
function isOutputChunk(assetOrChunk: OutputAsset | OutputChunk): assetOrChunk is OutputChunk {
  return typeof (assetOrChunk as OutputChunk).imports !== undefined
}

/**
 * Generate an MD5 checksum for the provided `source` input.
 *
 * @param source raw input
 * @returns an MD5 checksum of the `source` input
 */
function generateChecksum(source: string) {
  return createHash('md5').update(source, 'utf8').digest('hex')
}

/**
 * Generates a unique cache key for the provided `path` that importing modules will use to
 * load the correct entry file.
 *
 * @param path the import path
 * @param keyFormat HTML Library Manager long cache format
 * @returns a unqiue cache key for the provided `path`
 */
function getCacheKey(path: string, keyFormat: AEMLongCacheConfiguration['keyFormat']) {
  const keyFormatString = keyFormat === undefined ? 'lc-%s-lc' : typeof keyFormat === 'string' ? keyFormat : '%s'

  return keyFormatString.replace('%s', existsSync(path) ? generateChecksum(readFileSync(path).toString()) : 'unknown')
}

/**
 * Determines whether to use the native AEM ClientLib path or the provided `path`.
 *
 * @param path the import path
 * @param options import rewriter options
 * @param withCacheChecksum should the checksum be added to the path?
 * @param rollupOptions rollup options object
 * @returns the real AEM ClientLib path or the original `path`
 */
function getAEMImportFilePath(
  path: string,
  options: ImportRewriterOptions,
  withCacheChecksum = false,
  rollupOptions?: NormalizedOutputOptions,
): string {
  if (mainEntryPath && mainEntryPath === path) {
    path = `${path.substr(0, path.indexOf('/'))}.js`

    if (withCacheChecksum && options.caching && options.caching.enabled && rollupOptions) {
      const entryPath = join(rollupOptions.dir as string, mainEntryPath)

      // Remove '.js'
      path = path.substr(0, path.length - 3)

      // Append the md5 checksum to the path
      path = `${path}.${getCacheKey(entryPath, options.caching.keyFormat)}`

      // Append the extension to the path
      path = `${path}.${options.caching.minification === true ? 'min.js' : 'js'}`
    }
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
        options.publicPath + getAEMImportFilePath(matchedImport, options),
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

      if (
        options.mainEntryPath ||
        (chunk.isEntry && chunk.facadeModuleId && /(ts|js)$/.test(chunk.facadeModuleId) && !mainEntryPath)
      ) {
        mainEntryPath = options.mainEntryPath || chunk.fileName
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

    writeBundle(rollupOptions, bundles) {
      for (const [fileName, chunkOrAsset] of Object.entries(bundles)) {
        if (
          !options.caching ||
          !options.caching.enabled ||
          !mainEntryPath ||
          mainEntryPath === fileName ||
          !isOutputChunk(chunkOrAsset) ||
          !chunkOrAsset.code
        ) {
          continue
        }

        const mainEntryAEMPath = getAEMImportFilePath(mainEntryPath, options)
        const mainEntryAEMPathWithHash = getAEMImportFilePath(mainEntryPath, options, true, rollupOptions)

        writeFileSync(
          join(rollupOptions.dir as string, fileName),
          chunkOrAsset.code.replace(mainEntryAEMPath, mainEntryAEMPathWithHash),
        )
      }
    },
  }
}

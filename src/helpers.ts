import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import type { NormalizedOutputOptions, OutputAsset, OutputChunk } from 'rollup'

import type { AEMLongCacheConfiguration, BundlesImportRewriterOptions } from './types'

let mainEntryPath!: string

export const relativePathPattern = /([.]{1,2}\/)+/

/**
 * Check if the main entry file path has been set.
 */
export function hasMainEntryPath(): boolean {
  return (mainEntryPath && mainEntryPath.length > 0) || false
}

/**
 * Retrieve the main entry file path.
 *
 * @returns the main entry path
 */
export function getMainEntryPath(): string {
  return mainEntryPath
}

/**
 * Set the entry file path.
 *
 * @param path the path to the main entry file
 */
export function setMainEntryPath(path: string): void {
  mainEntryPath = path
}

/**
 * Determine if the provided `assetOrChunk` object is a chunk instance.
 *
 * @param assetOrChunk an instance of either `OutputAsset` or `OutputChunk`
 * @returns `true` when `OutputChunk`, otherwise `false`
 */
export function isOutputChunk(assetOrChunk: OutputAsset | OutputChunk): assetOrChunk is OutputChunk {
  return typeof (assetOrChunk as OutputChunk).imports !== undefined
}

/**
 * Generate an MD5 checksum for the provided `source` input.
 *
 * @param source raw input
 * @returns an MD5 checksum of the `source` input
 */
export function generateChecksum(source: string): string {
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
export function getCacheKey(path: string, keyFormat: AEMLongCacheConfiguration['keyFormat']): string {
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
export function getAEMImportFilePath(
  path: string,
  options: BundlesImportRewriterOptions,
  withCacheChecksum = false,
  rollupOptions?: NormalizedOutputOptions,
): string {
  if (mainEntryPath && mainEntryPath === path) {
    path = `${path.substring(0, path.indexOf('/'))}.js`

    if (withCacheChecksum && options.caching && options.caching.enabled && rollupOptions) {
      const entryPath = join(rollupOptions.dir as string, mainEntryPath)

      // Remove '.js'
      path = path.substring(0, path.length - 3)

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
export function getReplacementPath(path: string, options: BundlesImportRewriterOptions, imports: string[]): string {
  const matchedImport = imports.find((imp) => imp.endsWith(path.replace(relativePathPattern, '')))

  return matchedImport
    ? path.replace(
        new RegExp(`${relativePathPattern.source}${path.replace(relativePathPattern, '')}`),
        options.publicPath + getAEMImportFilePath(matchedImport, options),
      )
    : path
}

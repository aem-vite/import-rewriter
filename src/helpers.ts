import { createHash } from 'crypto'
import _debug from 'debug'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import type { InputOptions, NormalizedOutputOptions, OutputAsset, OutputChunk } from 'rollup'

import type { AEMLongCacheConfiguration, BundlesImportRewriterOptions } from './types'

const entryPaths = new Set<string>()

export const debug = _debug('aem-vite-import-rewriter')
export const relativePathPattern = /([.]{1,2}\/)+/

/**
 * Retrieve the entry file paths.
 *
 * @returns entry paths
 */
export function getEntryPaths() {
  return entryPaths
}

/**
 * Add the provided `path` to the available entry paths.
 *
 * @param path the path to the entry file
 */
export function setEntryPath(path: string): void {
  entryPaths.add(path)
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
 * @param entryPath the base ClientLib path
 * @param keyFormat HTML Library Manager long cache format
 * @returns a unqiue cache key for the provided `path`
 */
export function getCacheKey(entryPath: string, keyFormat: AEMLongCacheConfiguration['keyFormat']): string {
  let keyFormatString = ''

  switch (keyFormat) {
    case 'cloud':
      keyFormatString = 'lc-%s-lc.%m'
      break
    case 'acs-classic':
      keyFormatString = '%s.%m'
      break
    case 'acs-modern':
      keyFormatString = '%m.ACSHASH%s'
      break
  }

  const combinedContents = [...entryPaths].map((entry) => {
    const path = join(entryPath, entry)

    return existsSync(path) ? readFileSync(path).toString() : ''
  })

  return keyFormatString.replace('%s', generateChecksum(combinedContents.join('')))
}

/**
 * Constructs an AEM ClientLib path for the current configuration.
 *
 * @param options import rewriter options
 * @param forImport is the ClientLib path for an import?
 * @param withChecksum should a checksum be generated?
 * @param rollupOptions rollup options object
 * @returns the real AEM ClientLib path
 */
export function getAemClientLibPath(
  options: BundlesImportRewriterOptions,
  forImport = false,
  withChecksum = false,
  rollupOptions?: NormalizedOutputOptions,
): string {
  let path = options.publicPath

  if (forImport) {
    return `${path}/${options.resourcesPath}/`
  }

  if (withChecksum && options.caching && options.caching.enabled && rollupOptions !== undefined) {
    const entryPath = rollupOptions.dir as string

    // Append the MD5 checksum and minified extension to the path
    path = `${path}.${getCacheKey(entryPath, options.caching.keyFormat)}`
    path = path.replace('.%m', options.minify === true ? '.min' : '')
  }

  return `${path}.js`
}

/**
 * Converts the standard import path into an AEM compliant ClientLib path.
 *
 * @param parentPath path of the parent (chunk)
 * @param path the import path
 * @param options import rewriter options
 * @param entryAliases rollup entry aliases
 * @returns an AEM compliant ClientLib path
 */
export function getReplacementPath(
  parentPath: string,
  path: string,
  options: BundlesImportRewriterOptions,
  entryAliases: NonNullable<InputOptions['input']>,
): string {
  const isEntryPath = entryPaths.has(parentPath)

  if (isEntryPath) {
    return path.replace(new RegExp(`^${relativePathPattern.source}`), getAemClientLibPath(options, true))
  }

  return isInputAnEntryAlias(path, entryAliases)
    ? path.replace(
        new RegExp(`${relativePathPattern.source}${path.replace(relativePathPattern, '')}`),
        getAemClientLibPath(options),
      )
    : path
}

/**
 * Determines if the provided `input` is an entry alias or not.
 *
 * @param input the string to check against
 * @param entryAliases rollup entry aliases
 * @returns `true` when `input` is an alias, otherwise `false`
 */
export function isInputAnEntryAlias(input: string, entryAliases: NonNullable<InputOptions['input']>) {
  const entryAliasesExpr = new RegExp(`^[./]+(${Object.keys(entryAliases).join('|')})\\.js$`)

  return input.match(entryAliasesExpr)?.[0] ? true : false
}

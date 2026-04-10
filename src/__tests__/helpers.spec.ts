import { beforeEach, afterEach, expect, test, vi } from 'vitest'

import {
  clearEntryPaths,
  generateChecksum,
  getAemClientLibPath,
  getCacheKey,
  getEntryPaths,
  getReplacementPath,
  isInputAnEntryAlias,
  setEntryPath,
} from '../helpers'

import type { NormalizedOutputOptions } from 'rollup'

import type { BundlesImportRewriterOptions } from '../types'

const PUBLIC_PATH = '/etc.clientlibs/aem-vite/clientlibs/clientlib-site'

const checksum = generateChecksum('test')

const defaultPluginOptions: BundlesImportRewriterOptions = {
  publicPath: PUBLIC_PATH,
  resourcesPath: 'resources/js',
}

const rollupOptions = {
  dir: '/testing/aem-vite',
} as NormalizedOutputOptions

beforeEach(() => {
  clearEntryPaths()

  vi.mock('node:fs', async () => {
    return {
      ...(await vi.importActual<typeof import('node:fs')>('node:fs')),
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue('test'),
    }
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

test('entry path should be set', () => {
  setEntryPath('importer')

  expect(getEntryPaths()).toStrictEqual(new Set(['importer']))
})

test('entry paths should be reset', () => {
  setEntryPath('importer')
  clearEntryPaths()

  expect(getEntryPaths()).toStrictEqual(new Set())
})

test('checksum should match', () => {
  expect(checksum).toEqual('098f6bcd4621d373cade4e832627b4f6')
  expect(checksum).toMatchSnapshot()
})

test('cache key should match', () => {
  setEntryPath('importer')

  const checksum = generateChecksum('test')
  const cacheKey = getCacheKey('test', 'cloud')
  const classicAcsCacheKey = getCacheKey('test', 'acs-classic')
  const modernAcsCacheKey = getCacheKey('test', 'acs-modern')

  expect(cacheKey).toEqual(`lc-${checksum}-lc.%m`)
  expect(classicAcsCacheKey).toEqual(`${checksum}.%m`)
  expect(modernAcsCacheKey).toEqual(`%m.ACSHASH${checksum}`)

  expect([cacheKey, classicAcsCacheKey, modernAcsCacheKey, checksum]).toMatchSnapshot()
})

test("invalid cache key should default to 'cloud'", () => {
  setEntryPath('importer')

  expect(getCacheKey('test', undefined)).toStrictEqual('lc-098f6bcd4621d373cade4e832627b4f6-lc.%m')
})

test('clientlib path is correct', () => {
  const path = getAemClientLibPath({ ...defaultPluginOptions }, false, false)

  expect(path).toEqual(`${PUBLIC_PATH}.js`)
})

test('clientlib path should contain hash', async () => {
  setEntryPath('importer')

  const options: BundlesImportRewriterOptions = {
    ...defaultPluginOptions,

    caching: {
      enabled: true,
      keyFormat: 'cloud',
    },
  }

  const { existsSync, readFileSync } = await import('node:fs')

  const path = getAemClientLibPath(options, false, true, rollupOptions)
  const minifyPath = getAemClientLibPath({ ...options, minify: true }, false, true, rollupOptions)

  expect(path).toEqual(`${PUBLIC_PATH}.lc-${checksum}-lc.js`)
  expect(minifyPath).toEqual(`${PUBLIC_PATH}.lc-${checksum}-lc.min.js`)

  expect(existsSync).toHaveBeenCalledTimes(2)
  expect(readFileSync).toHaveBeenCalledTimes(2)
})

test('clientlib path should contain invalid hash', async () => {
  const options: BundlesImportRewriterOptions = {
    ...defaultPluginOptions,

    caching: {
      enabled: true,
      keyFormat: 'acs-modern',
    },
  }

  vi.resetAllMocks()
  vi.doMock('node:fs', async () => {
    return {
      ...(await vi.importActual<typeof import('node:fs')>('node:fs')),
      existsSync: vi.fn().mockReturnValue(false),
    }
  })

  const checksum = generateChecksum('')
  const path = getAemClientLibPath(options, false, true, rollupOptions)

  expect(path).toEqual(`${PUBLIC_PATH}.ACSHASH${checksum}.js`)
  expect(path).toMatchSnapshot()
})

test('clientlib resource path should match', async () => {
  const options: BundlesImportRewriterOptions = {
    ...defaultPluginOptions,

    caching: {
      enabled: true,
      keyFormat: 'cloud',
    },
  }

  const path = getAemClientLibPath(options, true, false, rollupOptions)

  expect(path).toEqual(`${PUBLIC_PATH}/${options.resourcesPath}/`)
})

test('entry alias matching should escape regex characters', () => {
  const entryAliases = {
    'main.entry': '/src/main.entry.ts',
  }

  expect(isInputAnEntryAlias('./main.entry.js', entryAliases)).toBe(true)
  expect(isInputAnEntryAlias('./mainXentry.js', entryAliases)).toBe(false)
})

test('replacement path should match aliases literally', () => {
  const entryAliases = {
    'main.entry': '/src/main.entry.ts',
  }
  const path = getReplacementPath('chunk.js', '../main.entry.js', defaultPluginOptions, entryAliases)

  expect(path).toEqual(`${PUBLIC_PATH}.js`)
})

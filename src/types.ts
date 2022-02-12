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
}

export interface BaseImportRewriterOptions {
  /**
   * The public path in AEM where your ClientLibs are stored.
   *
   * @example
   * /etc.clienlibs/<project>/clientlibs/<clientlib>
   */
  publicPath: string
  /**
   * The path to where bundles and chunks are stored. This should be the same for both.
   *
   * @example
   * resources/js
   */
  resourcesPath: string
}

export interface BundlesImportRewriterOptions extends BaseImportRewriterOptions {
  /**
   * Define how and when caching should be implemented when building bundles.
   */
  caching?: AEMLongCacheConfiguration
  /**
   * Define whether your HTML Library Manager configuration has the `minify` option enabled.
   * This will replace `.js` with `.min.js` to match AEM.
   *
   * @default false
   */
  minify?: boolean
}

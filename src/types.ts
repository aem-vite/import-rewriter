interface AEMCustomKeyFormat {
  format: string
  type: 'custom'
}

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
   * Ensure you choose the correct format for your AEM version and ACS Commons. Newer versions
   * of ACS Commons use a different format so it is vital to ensure you are using the correct
   * one. Choose 'acs-modern' for ACS Commons when ACSHASH is present in ClientLib URLs, otherwise
   * choose 'acs-classic'.
   *
   * Set to `false` to disable this functionality completely.
   *
   * A `custom` format object can also be provided, which allows you to define your own format string.
   *
   * Two placeholders are available:
   * - `%s` - the ClientLib MD5 checksum
   * - `%m` - `.min` when available, otherwise empty
   *
   * @example
   * ```ts
   * keyFormat: {
   *   format: 'foo-%s%m',
   *   type: 'custom',
   * }
   * ```
   *
   * @default cloud
   */
  keyFormat?: AEMCustomKeyFormat | 'cloud' | 'acs-modern' | 'acs-classic' | false
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

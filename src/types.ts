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

export interface BaseImportRewriterOptions {
  /**
   * The public path in AEM where your ClientLibs are stored.
   *
   * @example
   * /etc.clienlibs/<project>/clientlibs/<clientlib>
   */
  publicPath: string
}

export interface BundlesImportRewriterOptions extends BaseImportRewriterOptions {
  /**
   * Define how and when caching should be implemented when building bundles.
   */
  caching?: AEMLongCacheConfiguration

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
}

export interface CssImportRewriterOptions extends BaseImportRewriterOptions {
  /**
   * Base path for static assets. This only needs to be partial so the static path in your CSS
   * can be replaced by your `assetsDir` path.
   *
   * @example
   * /src/assets
   */
  assetsBasePath: string
}

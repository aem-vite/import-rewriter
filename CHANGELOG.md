## [9.1.1](https://github.com/aem-vite/import-rewriter/compare/v9.1.0...v9.1.1) (2025-08-30)


### Bug Fixes

* ensure cache key format defaults to `cloud` ([3ae4a41](https://github.com/aem-vite/import-rewriter/commit/3ae4a41264497a0774e7c26a17f3a46e8da57772))
* regression fix for entry bundle hashsum ([35eb464](https://github.com/aem-vite/import-rewriter/commit/35eb46418eff4f07ce73a6c669d22439bd2542c8))

# [9.1.0](https://github.com/aem-vite/import-rewriter/compare/v9.0.0...v9.1.0) (2025-07-18)


### Bug Fixes

* ensure invalid cache key triggers error ([e4d4b42](https://github.com/aem-vite/import-rewriter/commit/e4d4b425c00398031e999dc4accc73536c8c44ca))


### Features

* add support for custom cache key format [#3](https://github.com/aem-vite/import-rewriter/issues/3) ([4a233e4](https://github.com/aem-vite/import-rewriter/commit/4a233e468639c0abf645ba7b36f92bc2a89abba8))

# [9.0.0](https://github.com/aem-vite/import-rewriter/compare/v8.0.0...v9.0.0) (2023-11-20)


### Build System

* drop native CJS support ([5b7f4fc](https://github.com/aem-vite/import-rewriter/commit/5b7f4fcec81faf5d2aa45b35387cb82490c997d9))
* increase minimum node and vite versions ([d3b0294](https://github.com/aem-vite/import-rewriter/commit/d3b0294d851ba91447ecc8baa6ceecbbc5c05eac))


### BREAKING CHANGES

* no longer support CJS

Vite 5 deprecates CJS support and as such support has been dropped here
* bump min node and vite versions

Node v18/20 and Vite v5+ are required moving forward.

# [8.0.0](https://github.com/aem-vite/import-rewriter/compare/v7.0.0...v8.0.0) (2023-07-14)


### Build System

* increase minimum node and vite versions ([2d71162](https://github.com/aem-vite/import-rewriter/commit/2d71162bc7976de94ad3aac23d55804e7dab6e07))


### BREAKING CHANGES

* bump min node and vite versions

Node v16 and Vite v3.0.0 are required moving forward.

# [7.0.0](https://github.com/aem-vite/import-rewriter/compare/v6.0.1...v7.0.0) (2022-11-30)


### Features

* support multiple key formats for acs commons ([4fe9015](https://github.com/aem-vite/import-rewriter/commit/4fe9015b8445a8ec54c84f8e7a57fc22c03378f6))


### BREAKING CHANGES

* Change default `keyFormat` handling

ACS Commons ships with two different ClientLib path formats. This change introduces support for both. Use `acs-modern` for instances where your ClientLibs contain `ACSHASH` and `acs-classic` when only the MD5 hash exists. For AEMaaCS please ensure you use `cloud`.

## [6.0.1](https://github.com/aem-vite/import-rewriter/compare/v6.0.0...v6.0.1) (2022-07-29)


### Bug Fixes

* resolve incorect dynamic import paths ([7fc8f92](https://github.com/aem-vite/import-rewriter/commit/7fc8f92d9ca69a041445bf0a38137185f7e79752))

# [6.0.0](https://github.com/aem-vite/import-rewriter/compare/v5.0.1...v6.0.0) (2022-07-02)


### Build System

* increase minimum node version ([572b261](https://github.com/aem-vite/import-rewriter/commit/572b26117d75d27a74563bcd5b5643b45400fd7c))


### BREAKING CHANGES

* Increment minimum required node version to v14

As Node v12 is no longer supported we are bringing our minimum supported version of node to v14. Please ensure your project is up to date.

## [5.0.1](https://github.com/aem-vite/import-rewriter/compare/v5.0.0...v5.0.1) (2022-05-26)


### Bug Fixes

* resolve incorrect plugin instance type ([9ebc985](https://github.com/aem-vite/import-rewriter/commit/9ebc98528b4cd4628f13cd4f79bcefa3ab591fbd))

# [5.0.0](https://github.com/aem-vite/import-rewriter/compare/v4.1.3...v5.0.0) (2022-02-12)


### Code Refactoring

* remove css rewriter ([3c5c49e](https://github.com/aem-vite/import-rewriter/commit/3c5c49e93f29309b5c04f0391602b158d7401d9e))


### Features

* redesign imports handler ([7b1ac3b](https://github.com/aem-vite/import-rewriter/commit/7b1ac3b8438178a67a323f67a618cbcd99809303))


### BREAKING CHANGES

* Complete redesign of the dynamic/native imports handler

The previous implementation was kind of clunky and didn't behave correct in most situations. A new `resourcesPath` configuration exists in the bundles rewriter which enforces a strict contract between the handler and your configuration, removing all assumptions.

Please refer to the below for how you should optimally setup your Vite configuration.

```js
{
  base: command === 'build' ? '/etc.clientlibs/<project>/clientlibs/<clientlib>/' : '/',

  build: {
    rollupOptions: {
      output: {
        chunkFileNames: '<clientlib>/resources/js/chunks/[name].js',
        entryFileNames: '<clientlib>/resources/js/[name].js',
      },
    },
  },

  plugins: [
    bundlesImportRewriter({
      publicPath: '/etc.clientlibs/<project>/clientlibs/<clientlib>',
      resourcesPath: 'resources/js',
    }),
  ],
}
```
* Vite 2.6.x and greater is now required

To keep up with internal fixes and feature additions Vite 2.6.x or greater is required to support `server.origin` which removes the need for the CSS Rewriter.

## [4.1.3](https://github.com/aem-vite/import-rewriter/compare/v4.1.2...v4.1.3) (2022-01-20)


### Bug Fixes

* resolve AEM import path ([bca085c](https://github.com/aem-vite/import-rewriter/commit/bca085cc511cc3707a30d1f1a8800b08cfb3bab0))

## [4.1.2](https://github.com/aem-vite/import-rewriter/compare/v4.1.1...v4.1.2) (2022-01-19)


### Bug Fixes

* resolve entry file import dependency paths ([dda6521](https://github.com/aem-vite/import-rewriter/commit/dda652126c91ad9451411c9c492333a801eeb4b9))

## [4.1.1](https://github.com/aem-vite/import-rewriter/compare/v4.1.0...v4.1.1) (2022-01-19)


### Bug Fixes

* resolve import paths with caching enabled ([f5c2a35](https://github.com/aem-vite/import-rewriter/commit/f5c2a357b9f7c0f4d748969caa47eb49f0287944))

# [4.1.0](https://github.com/aem-vite/import-rewriter/compare/v4.0.0...v4.1.0) (2021-12-29)


### Bug Fixes

* ensure css bundles aren't omitted ([3a5fc78](https://github.com/aem-vite/import-rewriter/commit/3a5fc78d4f6544a5fc5cdfe7414e0b4cf33b276e))


### Features

* restore dynamic import support ([b1490d5](https://github.com/aem-vite/import-rewriter/commit/b1490d5b00bfe05fe84b7b27993e49315ebfdd7a))


### BREAKING CHANGES

* The default export has been replaced with a named export
* The `aemViteCSSImportRewriter` export has been renamed to `cssImportRewriter`

To better align with community standards, the default export has been changed to a named export called `bundlesImportRewriter`.

# [4.0.0](https://github.com/aem-vite/import-rewriter/compare/v3.0.1...v4.0.0) (2021-12-28)


### Bug Fixes

* resolve import transformation ([05df22b](https://github.com/aem-vite/import-rewriter/commit/05df22b51bc6e51d63d26fd8fd14e05eefc032fe))
* resolve sourcemap warning during builds ([9a7e0c1](https://github.com/aem-vite/import-rewriter/commit/9a7e0c1143cab265e8f67e3069dcdb61897a36fd))


### BREAKING CHANGES

* Dynamic imports are no longer rewritten

Please ensure that the `base` path in your Vite configuration matches your ClientLib proxy path as Vite will automatically prefix imports using it.

## [3.0.1](https://github.com/aem-vite/import-rewriter/compare/v3.0.0...v3.0.1) (2021-09-21)


### Bug Fixes

* ensure JSX extensions are captured ([19ebb6c](https://github.com/aem-vite/import-rewriter/commit/19ebb6c9b98e0164af9ea9b0c1b6f16d37f14bdc))

# [3.0.0](https://github.com/aem-vite/import-rewriter/compare/v2.0.0...v3.0.0) (2021-07-14)


### Code Refactoring

* removed `command` option ([e5085f8](https://github.com/aem-vite/import-rewriter/commit/e5085f8dfb81524699ca8e15b760eb1e06506495))


### Features

* added static asset rewriter for css ([9068bcc](https://github.com/aem-vite/import-rewriter/commit/9068bccd07b69daa9cc8f064ae6ab0d65baf4279))


### BREAKING CHANGES

* Removed `command` option in favour of plugin enforcement

To reduce any future complexity, you can define when the ES import rewriter will be executed. This can be done as shown in the below example by setting the `apply` option to either `build` or `serve`.

Ensure that `enforce` is always set to `pre` as it will prevent Vite from transforming things first.

```js
plugins: [
  {
    ...aemViteImportRewriter({ /* ... */ }),

    apply: 'build',
    enforce: 'pre',
  },
]
```

# [2.0.0](https://github.com/aem-vite/import-rewriter/compare/v1.2.1...v2.0.0) (2021-06-13)


### Features

* automatic path rewiting with cache support ([4054ff3](https://github.com/aem-vite/import-rewriter/commit/4054ff31142ac058c2e36ca1d875f8b728493061))
* resolve import entry path for AEM ([8d51559](https://github.com/aem-vite/import-rewriter/commit/8d51559ecbe1ec06e679b803da2af18be63bac3a))


### BREAKING CHANGES

* Main entry points are now rewritten

All instances of the main entry point that need to refer back to the AEM ClientLib are automatically rewritten

## [1.2.1](https://github.com/aem-vite/import-rewriter/compare/v1.2.0...v1.2.1) (2021-05-18)


### Bug Fixes

* ensure chunk paths are mapped correctly ([7daf43b](https://github.com/aem-vite/import-rewriter/commit/7daf43b98d288a2d0a559ce342b90f0e5fdc66d7))
* **dev:** corrected plugin name ([a30cd79](https://github.com/aem-vite/import-rewriter/commit/a30cd795ab422eaaa7f597b292741e3a070bbbc9))

# [1.2.0](https://github.com/aem-vite/import-rewriter/compare/v1.1.2...v1.2.0) (2021-05-17)


### Bug Fixes

* corrected faqs link ([d20e2e9](https://github.com/aem-vite/import-rewriter/commit/d20e2e97182c748aacafb9bdfcd95053177d95b0))


### Features

* added support for native imports ([65a0e1b](https://github.com/aem-vite/import-rewriter/commit/65a0e1b0eb88656343d5a93e48db78f7c881c0e9))

## [1.1.2](https://github.com/aem-vite/import-rewriter/compare/v1.1.1...v1.1.2) (2021-05-04)


### Bug Fixes

* fixed lib output not using commonjs ([e42428e](https://github.com/aem-vite/import-rewriter/commit/e42428e6dd00a9b423ade1aff8950c29623eca68))

## [1.1.1](https://github.com/aem-vite/import-rewriter/compare/v1.1.0...v1.1.1) (2021-05-01)


### Bug Fixes

* resolved missing files in npm package ([378e9fc](https://github.com/aem-vite/import-rewriter/commit/378e9fc3feebd38824b70b5380e601f7c641e59e))

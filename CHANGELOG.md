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

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

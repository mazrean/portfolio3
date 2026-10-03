/**
 * TypeScript 7 (the native compiler) no longer ships the JavaScript compiler
 * API that typescript-eslint and `astro check` (Volar) are built on. `tsc`
 * for this project runs on TypeScript 7, while the packages below get a
 * private TypeScript 6 install so they keep working until they support 7.
 * See https://github.com/typescript-eslint/typescript-eslint/issues/10940 and
 * https://github.com/withastro/roadmap/discussions/1321.
 */
const TYPESCRIPT_6 = '^6.0.3'

const needsTypeScript6Api = new Set([
  '@astrojs/check',
  '@astrojs/language-server',
  '@volar/kit',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  '@typescript-eslint/project-service',
  '@typescript-eslint/tsconfig-utils',
  '@typescript-eslint/type-utils',
  '@typescript-eslint/typescript-estree',
  '@typescript-eslint/utils',
  'ts-api-utils',
  'tsconfck',
  'typescript-eslint',
  'zod-to-ts'
])

function readPackage(pkg) {
  if (!needsTypeScript6Api.has(pkg.name)) return pkg

  if (pkg.peerDependencies) delete pkg.peerDependencies.typescript
  if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript
  pkg.dependencies = { ...pkg.dependencies, typescript: TYPESCRIPT_6 }

  return pkg
}

module.exports = { hooks: { readPackage } }

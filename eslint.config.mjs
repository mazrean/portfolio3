import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import astroPlugin from 'eslint-plugin-astro'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  globalIgnores([
    '**/*.astro/*',
    '*.astro/*',
    'dist/**',
    '.astro/**',
    'node_modules/**'
  ]),
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020
      }
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn'
    }
  },
  tseslint.configs.recommended,
  astroPlugin.configs.recommended,
  prettierRecommended,
  {
    // CLI scripts report progress on stdout/stderr by design.
    files: ['scripts/**'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.astro
      }
    },
    rules: {
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error'
    }
  }
])

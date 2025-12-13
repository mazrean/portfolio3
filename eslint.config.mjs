import globals from 'globals'
import prettierEslintPlugin from 'eslint-plugin-prettier'
import astroEslintParser from 'astro-eslint-parser'
import astroPlugin from 'eslint-plugin-astro'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: [
      '**/*.astro/*',
      '*.astro/*',
      'dist/**',
      '.astro/**',
      'node_modules/**'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020
      }
    },
    plugins: {
      prettier: prettierEslintPlugin,
      astro: astroPlugin,
      '@typescript-eslint': tsEslintPlugin
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      ...astroPlugin.configs.recommended.rules,
      ...tsEslintPlugin.configs.recommended.rules,
      ...prettierEslintPlugin.configs.recommended.rules
    }
  },

  {
    files: ['*.astro'],
    languageOptions: {
      parser: astroEslintParser,
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
]

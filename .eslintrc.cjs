// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  },
  overrides: [
    {
      files: ['*.astro'],
      plugins: ['astro'],
      env: {
        node: true,
        'astro/astro': true,
        es2020: true
      },
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
        sourceType: 'module'
      },
      rules: {
        'astro/no-conflict-set-directives': 'error',
        'astro/no-unused-define-vars-in-style': 'error'
      }
    },
    {
      files: ['**/*.astro/*.js', '*.astro/*.js'],
      env: {
        browser: true,
        es2020: true
      },
      parserOptions: {
        sourceType: 'module'
      },
      rules: {
        'prettier/prettier': 'off'
      }
    },
    {
      files: ['**/*.astro/*.ts', '*.astro/*.ts'],
      env: {
        browser: true,
        es2020: true
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        project: null
      },
      rules: {
        'prettier/prettier': 'off'
      }
    }
  ]
}

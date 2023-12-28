/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'avoid',
  rangeStart: 0,
  filepath: 'none',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
}

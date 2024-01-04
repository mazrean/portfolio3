import { defineConfig } from 'astro/config'
import yaml from '@rollup/plugin-yaml'
import alpinejs from '@astrojs/alpinejs'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  vite: {
    plugins: [yaml()]
  },
  integrations: [alpinejs()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
})

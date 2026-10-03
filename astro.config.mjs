import { defineConfig } from 'astro/config'
import alpinejs from '@astrojs/alpinejs'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  integrations: [alpinejs()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
})

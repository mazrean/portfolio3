import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    isTest: z.union([z.boolean(), z.undefined()]),
    isPublish: z.boolean(),
    publishDate: z.date(),
    tags: z.array(z.string())
  })
})

const portfolio = defineCollection({
  type: 'content'
})

export const collections = {
  blog,
  portfolio
}

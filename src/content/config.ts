import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

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

const about = defineCollection({
  loader: glob({ pattern: 'about.yaml', base: './src/yaml' }),
  schema: z.object({
    name: z.string(),
    ruby: z.string(),
    realName: z.string(),
    links: z.object({
      github: z.string(),
      twitter: z.string(),
      zenn: z.string()
    }),
    affiliation: z.string(),
    jobCategory: z.string()
  })
})

const skill = defineCollection({
  loader: glob({ pattern: 'skill.yaml', base: './src/yaml' }),
  schema: z.object({
    description: z.string(),
    list: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        icon: z.string(),
        level: z.number()
      })
    )
  })
})

const career = defineCollection({
  loader: file('src/yaml/career.yaml'),
  schema: z.object({
    org: z.string(),
    type: z.string().optional(),
    period: z.object({
      month: z.string().optional(),
      start: z.string().optional(),
      end: z.string().optional()
    }),
    description: z.string()
  })
})

const works = defineCollection({
  loader: file('src/yaml/works.yaml'),
  schema: z.object({
    name: z.string(),
    ref: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()),
    image: z.string()
  })
})

const article = defineCollection({
  loader: file('src/yaml/article.yaml'),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    ref: z.string(),
    date: z.string(),
    image: z.string(),
    ignore: z.boolean()
  })
})

const presentation = defineCollection({
  loader: file('src/yaml/presentation.yaml'),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    ref: z.string(),
    date: z.string(),
    embed: z.string().optional(),
    image: z.string().optional()
  })
})

export const collections = {
  blog,
  portfolio,
  about,
  skill,
  career,
  works,
  article,
  presentation
}

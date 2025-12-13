import { getCollection, getEntry } from 'astro:content'

export const blogList = (await getCollection('blog')).filter(
  entry =>
    process.env.NODE_ENV === 'development' ||
    (!entry.data.isTest && entry.data.isPublish)
)

export const getBlogBySlug = async (slug: string) => {
  const blog = await getEntry('blog', slug)
  if (
    !blog ||
    (process.env.NODE_ENV !== 'development' &&
      (!blog.data.isPublish || blog.data.isTest))
  )
    return undefined

  return blog
}

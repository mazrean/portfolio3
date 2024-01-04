declare module '@yaml/article' {
  export type Article = {
    title: string
    tags: string[]
    ref: string
    date: string
    image: string
    ignore: boolean
  }

  const value: Article[]
  export default value
}

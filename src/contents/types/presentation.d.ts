declare module '@contents/presentation.yaml' {
  export type Presentation = {
    title: string
    tags: string[]
    ref: string
    date: string
    embed?: string
    image?: string
  }

  const value: Presentation[]
  export default value
}

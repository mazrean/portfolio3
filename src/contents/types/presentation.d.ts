export type Presentation = {
  title: string
  tags: string[]
  ref: string
  date?: string
  embed?: string
  image?: string
}

declare module '@contents/presentation.yaml' {
  const value: Presentation[]
  export default value
}

export interface Presentation {
  title: string
  tags: string[]
  ref: string
  embed?: string
  image?: string
}

declare module '@contents/presentation.yaml' {
  const value: Presentation[]
  export default value
}

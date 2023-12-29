declare module '@contents/career.yaml' {
  const value: {
    org: string
    type?: string
    period: {
      month?: string
      start?: string
      end?: string
    }
    description: string
  }[]
  export default value
}

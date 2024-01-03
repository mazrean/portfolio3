declare module '@yaml/career' {
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

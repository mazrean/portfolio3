declare module "@contents/skill.yaml" {
  const value: {
    description: string;
    list: {
      name: string;
      type: string;
      icon: string;
      level: number;
    }[];
  };
  export default value;
}

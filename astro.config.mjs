import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";

import alpinejs from "@astrojs/alpinejs";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [yaml()]
  },
  integrations: [alpinejs()]
});
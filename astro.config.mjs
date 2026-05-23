import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

const site = process.env.SITE_URL || "http://localhost:4321";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  adapter: cloudflare()
});
import { defineConfig } from "astro/config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  output: "static",
  site: isGitHubPages ? "https://holynova.github.io" : "http://localhost:4321",
  base: isGitHubPages ? "/brand-etymology" : undefined,
  outDir: isGitHubPages ? "./docs" : "./dist",
  build: {
    format: "directory",
  },
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
});

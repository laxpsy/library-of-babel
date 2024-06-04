/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "dark-base-background": "#1d1d1d",
        "dark-base-text": "#ededed",
        "base-text": "#222222",
        "base-background": "#efefef",
        "base-highlight": colors.green[400],
        "base-card": "#e6e6e6",
        "dark-base-card": "#2f2f2f",
        "directory-prefix": "#545454"
      },
      fontFamily: {
        jetbrains: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss"],
};

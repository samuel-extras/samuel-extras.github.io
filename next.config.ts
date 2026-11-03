import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // plain HTML, CSS and JS in out/, served by GitHub Pages
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

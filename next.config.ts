import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runtime credentials belong in the host environment, never in function bundles.
  outputFileTracingExcludes: { "/*": ["./.env", "./.env.*"] },
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

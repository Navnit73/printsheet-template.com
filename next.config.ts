import type { NextConfig } from "next";

/**
 * Static export for Cloudflare Pages: `npm run build` writes a plain HTML/CSS/JS
 * site to ./out. There is no Node server, so:
 * - security & cache headers live in public/_headers (Cloudflare reads it)
 * - trailing-slash redirects are handled by Cloudflare Pages automatically
 * - images are served as-is (no on-demand optimisation server)
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dipzpwbbk/**",
        search: "",
      },
    ],
  },
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

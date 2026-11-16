import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/data/site-meta";

// Required for `output: "export"` (Cloudflare Pages static hosting).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Print Sheet",
    description:
      "Free online print sheet maker for photo sheets, passport photos, business cards, labels, and stickers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4d7c0f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // The Cloudflare Workers demo build has no image optimizer; photos are
    // already web-optimized WebP, so serving them as-is is acceptable there.
    unoptimized: process.env.CF_BUILD === "1",
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
  },
};

export default nextConfig;

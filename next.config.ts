import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image Domains ────────────────────────────────────────
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
  },

  // ─── Compression ─────────────────────────────────────────
  compress: true,

  // ─── Headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static assets
        source: "/icons/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Rewrites for API ────────────────────────────────────
  async rewrites() {
    return [];
  },
};

export default nextConfig;

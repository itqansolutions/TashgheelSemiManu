import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Output Mode for Docker / Railway ─────────────────────
  output: "standalone",

  // ─── Remote Patterns for Images ───────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
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
    ];
  },
};

export default nextConfig;

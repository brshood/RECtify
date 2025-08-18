import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure service worker is served from root
  experimental: {
    // keep defaults; no special PWA flag needed
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for now to support dynamic routes
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

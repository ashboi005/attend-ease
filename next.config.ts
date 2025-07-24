import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Add basePath if your app is not served from the root
  // basePath: '/your-base-path',
};

export default nextConfig;


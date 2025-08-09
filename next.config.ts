import type { NextConfig } from "next";

// Disable ESLint during builds
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

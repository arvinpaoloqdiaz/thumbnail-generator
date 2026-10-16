import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker: bundles a minimal Node.js server into .next/standalone
  output: 'standalone',
};

export default nextConfig;

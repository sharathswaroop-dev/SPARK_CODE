import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Suppress the Turbopack/webpack mismatch warning and explicitly opt in
  turbopack: {},
};

export default nextConfig;

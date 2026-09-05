import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev experience
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: [
    '@campuspulse/shared',
    '@campuspulse/types',
    '@campuspulse/validation',
    '@campuspulse/config',
  ],

  // Image optimization domains (add as needed)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

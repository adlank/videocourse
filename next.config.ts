import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized for Hostinger/Plesk deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization for shared hosting
  images: {
    unoptimized: true,
  },
  
  // Disable server-side features that might not work on shared hosting
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;

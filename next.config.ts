import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['127.0.0.1', 'localhost', '0.0.0.0']
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/sotsuronn-inshi-app',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add any image hosts you’re pulling from
    domains: ["avatars.githubusercontent.com"],
  },
};

export default nextConfig;

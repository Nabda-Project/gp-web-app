import type { NextConfig } from "next";

const backendApiUrl =
  process.env.BACKEND_API_URL ?? "http://smart-medical-api-env.eba-jxdmccmi.us-east-1.elasticbeanstalk.com/api";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;

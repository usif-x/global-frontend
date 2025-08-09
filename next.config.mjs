/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "0.0.0.0",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "globaldivers.duckdns.org",
        pathname: "/storage/**",
      },
    ],
  },
  trailingSlash: true,
  output: "standalone",
};

export default nextConfig;

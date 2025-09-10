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
        hostname: "0.0.0.0:8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "timeforkids.com",
        pathname: "/wp-content/**",
      },
    ],
  },
  trailingSlash: true,
  output: "standalone",
};

export default nextConfig;

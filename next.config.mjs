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
    ],
  },
  trailingSlash: true,
  output: "standalone",
};

export default nextConfig;

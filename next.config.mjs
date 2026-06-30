/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  media-src 'self' blob: https:;
  connect-src 'self'
    https://api.hurghada-trips.online
    https://api.weatherapi.com
    https://api.exchangerate-api.com
    https://api.iconify.design
    https://api.unisvg.com
    https://api.simplesvg.com
    https://www.google.com
    https://www.gstatic.com;
  font-src 'self' data:;
`;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "0.0.0.0",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.hurghada-trips.online",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.hurghada-trips.online",
        pathname: "/**",
      },
    ],
  },
  trailingSlash: true,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

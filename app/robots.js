export default function robots() {
  const siteBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://hurghada-trips.online";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/login",
        "/register",
        "/logout",
        "/profile",
        "/invoices",
        "/pay",
      ],
    },
    sitemap: `${siteBaseUrl}/sitemap.xml`,
    host: siteBaseUrl,
  };
}

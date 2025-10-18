export async function GET() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL; // backend API
  const siteBaseUrl = process.env.NEXT_PUBLIC_APP_URL; // public site

  try {
    // Fetch all data concurrently with timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

    const [tripsResponse, packagesResponse, coursesResponse] =
      await Promise.all([
        fetch(`${apiBaseUrl}/trips`, { signal: controller.signal }),
        fetch(`${apiBaseUrl}/packages`, { signal: controller.signal }),
        fetch(`${apiBaseUrl}/courses`, { signal: controller.signal }),
      ]);

    clearTimeout(timeoutId);

    if (!tripsResponse.ok || !packagesResponse.ok || !coursesResponse.ok) {
      throw new Error("Failed to fetch data from API");
    }

    const [trips, packages, courses] = await Promise.all([
      tripsResponse.json(),
      packagesResponse.json(),
      coursesResponse.json(),
    ]);

    if (
      !Array.isArray(trips) ||
      !Array.isArray(packages) ||
      !Array.isArray(courses)
    ) {
      throw new Error("Invalid data structure received from API");
    }

    // Generate URLs for sitemap
    const urls = [
      { url: `${siteBaseUrl}/trips`, priority: "0.9", changefreq: "daily" },
      { url: `${siteBaseUrl}/packages`, priority: "0.9", changefreq: "daily" },
      { url: `${siteBaseUrl}/courses`, priority: "0.9", changefreq: "daily" },
      {
        url: `${siteBaseUrl}/dive-sites`,
        priority: "0.8",
        changefreq: "weekly",
      },
      {
        url: `${siteBaseUrl}/destinations`,
        priority: "0.8",
        changefreq: "weekly",
      },
      {
        url: `${siteBaseUrl}/bestsellers`,
        priority: "0.7",
        changefreq: "daily",
      },
      {
        url: `${siteBaseUrl}/center-location`,
        priority: "0.6",
        changefreq: "monthly",
      },
      { url: `${siteBaseUrl}/profile`, priority: "0.5", changefreq: "monthly" },
      { url: `${siteBaseUrl}/login`, priority: "0.4", changefreq: "yearly" },
      { url: `${siteBaseUrl}/register`, priority: "0.4", changefreq: "yearly" },

      ...trips
        .filter((t) => t.id != null)
        .map((t) => ({
          url: `${siteBaseUrl}/trips/${t.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),
      ...packages
        .filter((p) => p.id != null)
        .map((p) => ({
          url: `${siteBaseUrl}/packages/${p.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),
      ...courses
        .filter((c) => c.id != null)
        .map((c) => ({
          url: `${siteBaseUrl}/courses/${c.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),
    ];

    // Build XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    const fallbackUrls = [
      { url: `${siteBaseUrl}/trips`, priority: "0.9", changefreq: "daily" },
      { url: `${siteBaseUrl}/packages`, priority: "0.9", changefreq: "daily" },
      { url: `${siteBaseUrl}/courses`, priority: "0.9", changefreq: "daily" },
      {
        url: `${siteBaseUrl}/bestsellers`,
        priority: "0.7",
        changefreq: "daily",
      },
      { url: `${siteBaseUrl}/profile`, priority: "0.5", changefreq: "monthly" },
      { url: `${siteBaseUrl}/login`, priority: "0.4", changefreq: "yearly" },
      { url: `${siteBaseUrl}/register`, priority: "0.4", changefreq: "yearly" },
    ];

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrls
  .map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}

export async function GET() {
  const baseUrl = "https://globaldivers.duckdns.org";

  try {
    // Fetch all data concurrently with timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const [tripsResponse, packagesResponse, coursesResponse] =
      await Promise.all([
        fetch(`${baseUrl}/trips`, { signal: controller.signal }),
        fetch(`${baseUrl}/packages`, { signal: controller.signal }),
        fetch(`${baseUrl}/courses`, { signal: controller.signal }),
      ]);

    clearTimeout(timeoutId);

    // Check if all requests were successful
    if (!tripsResponse.ok || !packagesResponse.ok || !coursesResponse.ok) {
      throw new Error("Failed to fetch data from API");
    }

    // Parse JSON responses with validation
    const [trips, packages, courses] = await Promise.all([
      tripsResponse.json(),
      packagesResponse.json(),
      coursesResponse.json(),
    ]);

    // Validate data structure
    if (
      !Array.isArray(trips) ||
      !Array.isArray(packages) ||
      !Array.isArray(courses)
    ) {
      throw new Error("Invalid data structure received from API");
    }

    // Generate URLs
    const urls = [
      // Main listing pages (dynamic content)
      {
        url: `${baseUrl.replace(/\/$/, "")}/trips`,
        priority: "0.9",
        changefreq: "daily",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/packages`,
        priority: "0.9",
        changefreq: "daily",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/courses`,
        priority: "0.9",
        changefreq: "daily",
      },

      // Additional static/semi-static pages
      {
        url: `${baseUrl.replace(/\/$/, "")}/dive-sites`,
        priority: "0.8",
        changefreq: "weekly",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/destinations`,
        priority: "0.8",
        changefreq: "weekly",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/bestsellers`,
        priority: "0.7",
        changefreq: "daily",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/center-location`,
        priority: "0.6",
        changefreq: "monthly",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/profile`,
        priority: "0.5",
        changefreq: "monthly",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/login`,
        priority: "0.4",
        changefreq: "yearly",
      },
      {
        url: `${baseUrl.replace(/\/$/, "")}/register`,
        priority: "0.4",
        changefreq: "yearly",
      },

      // Individual trip pages
      ...trips
        .filter((trip) => trip.id != null)
        .map((trip) => ({
          url: `${baseUrl.replace(/\/$/, "")}/trips/${trip.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),

      // Individual package pages
      ...packages
        .filter((pkg) => pkg.id != null)
        .map((pkg) => ({
          url: `${baseUrl.replace(/\/$/, "")}/packages/${pkg.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),

      // Individual course pages
      ...courses
        .filter((course) => course.id != null)
        .map((course) => ({
          url: `${baseUrl.replace(/\/$/, "")}/courses/${course.id}`,
          priority: "0.8",
          changefreq: "weekly",
        })),
    ];

    // Generate sitemap XML
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
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", // Cache for 1 hour, serve stale for 24h
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Log to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // Add your monitoring service here (e.g., Sentry, LogRocket, etc.)
      // Sentry.captureException(error);
    }

    // Return a minimal sitemap with main pages only if API fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/trips</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/packages</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/courses</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/dive-sites</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/destinations</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/bestsellers</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/center-location</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/profile</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/login</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl.replace(/\/$/, "")}/register</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300", // Shorter cache for fallback
      },
    });
  }
}

import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";

export const metadata = {
  title: "Dive Site Directory",
  description: "A comprehensive list of our curated diving locations",
  keywords: "diving, sites, destinations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Dive Site Directory ",
    description: "A comprehensive list of our curated diving locations",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dive Site Directory ",
    description: "A comprehensive list of our curated diving locations",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://https://global-frontend-lac.vercel.app/dive-sites",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// --- Data Fetching Function ---
async function getDiveSites() {
  try {
    const response = await getData("/divesites/");

    if (!response?.success || !Array.isArray(response.data)) {
      return { sites: [], error: "Invalid response from API" };
    }

    return { sites: response.data, error: null };
  } catch (err) {
    console.error("Error fetching dive sites:", err);
    return { sites: [], error: err.message || "Something went wrong" };
  }
}

// --- Page Component ---
export default async function DiveSitesPage() {
  const { sites, error } = await getDiveSites();

  return (
    <main className="bg-sky-50 min-h-screen">
      {/* === Hero Section === */}
      <section className="bg-white py-24 text-center border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-cyan-100 p-5 rounded-full shadow-sm">
              <Icon icon="ph:waves-bold" className="h-12 w-12 text-cyan-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-blue-900">
            Dive Site Directory
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-700/80">
            A comprehensive list of our curated diving locations. Find details
            and plan your next underwater adventure.
          </p>
        </div>
      </section>

      {/* === Dive Sites Grid Section === */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- Error State UI --- */}
          {error && (
            <div className="flex flex-col items-center text-center p-10 bg-red-50/50 border-2 border-red-200 rounded-2xl max-w-2xl mx-auto">
              <Icon
                icon="ph:warning-circle-bold"
                className="h-16 w-16 text-red-500"
              />
              <h3 className="mt-6 text-2xl font-semibold text-red-800">
                Oops! Something went wrong.
              </h3>
              <p className="mt-2 text-red-700">
                We couldn't load the dive sites. Please try again later.
              </p>
              <p className="mt-4 text-sm text-red-600/70">Error: {error}</p>
            </div>
          )}

          {/* --- Empty State UI --- */}
          {!error && sites.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <Icon
                icon="ph:binoculars-bold"
                className="mx-auto h-16 w-16 text-sky-400"
              />
              <h3 className="mt-4 text-2xl font-semibold text-blue-800">
                No Dive Sites Found
              </h3>
              <p className="mt-2">
                It looks like we're still charting these waters. Please check
                back soon!
              </p>
            </div>
          )}

          {/* --- Success State UI --- */}
          {!error && sites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="p-6 pb-4 flex-grow">
                    <h3 className="text-2xl font-bold text-blue-900 leading-tight">
                      {site.name}
                    </h3>

                    <div className="mt-4 space-y-3 text-cyan-800">
                      <div className="flex items-start">
                        <Icon
                          icon="mdi:map-marker-outline"
                          className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-cyan-500"
                        />
                        <span className="font-medium">{site.region}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          icon="ion:water-outline"
                          className="h-5 w-5 mr-3 flex-shrink-0 text-cyan-500"
                        />
                        <span className="font-medium">{site.ocean}</span>
                      </div>
                    </div>

                    <p className="mt-5 text-slate-600 text-base leading-relaxed border-t border-slate-200 pt-5">
                      {site.description ||
                        "A pristine location with vibrant marine life awaiting exploration. Contact us for more details."}
                    </p>
                  </div>

                  <div className="px-6 py-4 bg-sky-50/70 mt-auto">
                    <a
                      href={`https://www.google.com/search?q=${site.name}+dive+site`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors group"
                    >
                      View on Google search
                      <Icon
                        icon="mdi:arrow-right"
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

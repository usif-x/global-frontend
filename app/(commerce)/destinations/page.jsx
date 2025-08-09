import { Icon } from "@iconify/react";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Site Destinations | Your Dive Company",
  description: "Explore our complete, curated list of premier dive sites",
  keywords: "diving, sites, destinations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Site Destinations ",
    description: "Explore our complete, curated list of premier dive sites",
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Destinations | Your Dive Company",
    description: "Explore our complete, curated list of premier dive sites",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app/destinations",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// ✅ Server Component
export default async function DestinationsPage() {
  return (
    <>
      <section className="bg-white py-24 text-center border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-cyan-100 p-5 rounded-full shadow-sm">
              <Icon icon="gis:earth" className="h-12 w-12 text-cyan-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-blue-900">
            Our Interactive Dive Map
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-700/80">
            Pan, zoom, and click on the pins to see details about our active
            dive sites across the globe.
          </p>
        </div>
      </section>

      <main className="bg-sky-50">
        <section className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-16">
              <div className="w-full h-[600px] rounded-2xl shadow-xl border-4 border-white overflow-hidden bg-blue-200">
                <div
                  id="divenumber-map"
                  style={{ width: "100%", height: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-16 text-center">
              <Link
                href="/dive-sites"
                className="inline-flex items-center text-lg font-semibold text-cyan-600 hover:text-cyan-800 transition-colors group"
              >
                Explore all dive sites on the map
                <Icon
                  icon="mdi:chevron-right"
                  className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Script
        src="https://center.divenumber.com/public/map.js"
        strategy="afterInteractive"
        data-api-key="d0efb4249acf9d653b6ba4fa48b05d84"
        data-map-style="esri_world_imagery"
        data-site-pin-color="red"
        data-target-id="divenumber-map"
      />
    </>
  );
}

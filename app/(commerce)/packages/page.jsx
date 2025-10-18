// app/(commerce)/packages/page.jsx

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
// ✅ Correct Import: Use the server-safe axios helper for server components
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData } from "@/lib/server-axios";

export const metadata = {
  title: "Packages ",
  description: "Explore our complete, curated list of premier dive packages",
  keywords: "diving, packages, tours",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Packages ",
    description: "Explore our complete, curated list of premier dive packages",
  },
  twitter: {
    card: "summary_large_image",
    title: "Packages ",
    description: "Explore our complete, curated list of premier dive packages",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://topdivers.online/packages",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Helper function to get trip count for package
const getPackageTripCount = (packages, packageId) => {
  const pkg = packages.find((p) => p.id === packageId);
  return pkg?.trip_count || 0;
};

const PackagesPage = async () => {
  let packages = []; // Default to an empty array
  let trips = []; // To calculate trip counts per package

  try {
    // Fetch both packages and trips to get accurate trip counts
    const [packagesData, tripsData] = await Promise.all([
      getData("/packages/"),
      getData("/trips/"),
    ]);

    if (Array.isArray(packagesData)) {
      packages = packagesData;
    } else {
      console.error(
        "API did not return an array for /packages. Received:",
        packagesData
      );
    }

    if (Array.isArray(tripsData)) {
      trips = tripsData;
    }
  } catch (err) {
    console.error("Failed to fetch packages:", err.message);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="mdi:alert-circle-outline"
              className="w-10 h-10 text-red-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Packages
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't retrieve our packages at the moment. Please try again
            later.
          </p>
          <Link
            href="/"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate trip counts for each package
  const packagesWithTripCounts = packages.map((pkg) => {
    const tripCount = trips.filter((trip) => trip.package_id === pkg.id).length;
    const packageTrips = trips.filter((trip) => trip.package_id === pkg.id);

    // Calculate price range for the package
    let priceRange = null;
    if (packageTrips.length > 0) {
      const prices = packageTrips.map((trip) => {
        // Apply discount if always available
        const basePrice = trip.adult_price;
        if (trip.has_discount && trip.discount_always_available) {
          return basePrice * (1 - trip.discount_percentage / 100);
        }
        return basePrice;
      });
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      priceRange = { min: minPrice, max: maxPrice };
    }

    return {
      ...pkg,
      tripCount,
      priceRange,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/image/hero-pattern.png')] opacity-10"></div>
        <div className="absolute inset-0 opacity-10">
          <Icon
            icon="mdi:waves"
            className="w-96 h-96 text-white/20 absolute top-10 -right-20 rotate-12"
          />
          <Icon
            icon="mdi:anchor"
            className="w-32 h-32 text-white/10 absolute bottom-20 left-10 -rotate-12"
          />
          <Icon
            icon="mdi:compass-outline"
            className="w-24 h-24 text-white/10 absolute top-32 left-1/4 rotate-45"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6 mt-6">
            <Icon icon="mdi:package-variant" className="w-4 h-4 inline mr-2" />
            Travel Packages
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Packages
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Explore our curated collection of diving and adventure packages
            designed for every type of traveler.
          </p>
          <div className="flex items-center justify-center mt-8 text-white/90">
            <Icon icon="mdi:map-marker" className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {packages.length} Packages Available
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="mdi:package-variant-remove"
              className="w-16 h-16 text-orange-400 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Packages Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're currently updating our offerings. Please check back soon!
            </p>
            <Link
              href="/"
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Adventure Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from {packages.length} packages tailored for your next
                unforgettable experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packagesWithTripCounts.map((pkg) => (
                <Link
                  href={`/packages/${pkg.id}`}
                  key={pkg.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    {pkg.images?.[0] ? (
                      <Image
                        src={pkg.images[0]}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                        <Icon
                          icon="mdi:package-variant"
                          className="w-16 h-16 text-white/50"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Trip Count Badge */}
                    {pkg.tripCount > 0 && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-sky-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Icon
                          icon="mdi:map-marker-multiple"
                          className="w-4 h-4"
                        />
                        {pkg.tripCount} Trip{pkg.tripCount !== 1 ? "s" : ""}
                      </div>
                    )}

                    {/* Image Gallery Indicator */}
                    {pkg.images && pkg.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                        <Icon icon="lucide:camera" className="w-4 h-4" />
                        {pkg.images.length}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-semibold">
                        Package
                      </span>
                      {pkg.tripCount > 0 && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <Icon
                            icon="mdi:compass-outline"
                            className="w-4 h-4 mr-1"
                          />
                          {pkg.tripCount} adventures
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
                      {pkg.name}
                    </h3>

                    <div className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      <MarkdownRenderer content={pkg.description} />
                    </div>

                    {/* Price Range Display */}
                    {pkg.priceRange && (
                      <div className="mb-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-700 font-medium">
                            Starting from
                          </span>
                          <div className="text-right">
                            {pkg.priceRange.min === pkg.priceRange.max ? (
                              <span className="text-lg font-bold text-sky-600">
                                EGP {pkg.priceRange.min.toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-lg font-bold text-sky-600">
                                EGP {pkg.priceRange.min.toFixed(0)} -{" "}
                                {pkg.priceRange.max.toFixed(0)}
                              </span>
                            )}
                            <div className="text-xs text-sky-600">
                              per person
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Trips Available State */}
                    {pkg.tripCount === 0 && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center text-orange-700 text-sm">
                          <Icon
                            icon="mdi:clock-outline"
                            className="w-4 h-4 mr-2"
                          />
                          <span>New trips coming soon!</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="text-sky-600 group-hover:text-sky-700 font-semibold text-sm flex items-center gap-1 transition-colors">
                          View Details
                          <Icon
                            icon="mdi:arrow-right"
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          />
                        </div>
                        {pkg.tripCount > 0 && (
                          <div className="bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-medium group-hover:bg-sky-600 transition-colors duration-200">
                            Explore
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;

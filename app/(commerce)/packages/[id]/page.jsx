// app/packages/[id]/page.js

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
// ✅ Use the server-safe axios helper
import { getData } from "@/lib/server-axios";

// --- Helper Functions ---
const formatPrice = (price, hasDiscount, discountPercentage) => {
  if (price == null) return { original: "0", discounted: null, discount: null };
  if (hasDiscount && discountPercentage) {
    const originalPrice = price / (1 - discountPercentage / 100);
    return {
      original: Math.round(originalPrice).toString(),
      discounted: Math.round(price).toString(),
      discount: discountPercentage,
    };
  }
  return {
    original: Math.round(price).toString(),
    discounted: null,
    discount: null,
  };
};

const formatDuration = (duration) => {
  if (!duration) return "Duration TBD";
  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${duration} minute${duration !== 1 ? "s" : ""}`;
};

// --- Main Server Component ---
const PackagePage = async ({ params }) => {
  const { id } = params;

  // STEP 1: Fetch all necessary data on the server in parallel
  let packageData, trips;

  try {
    const [packageResult, tripsResult] = await Promise.allSettled([
      getData(`/packages/${id}`),
      getData(`/packages/${id}/trips`),
    ]);

    // Check if the critical package data was fetched successfully
    if (packageResult.status === "rejected") {
      throw packageResult.reason; // If package fails, we can't render the page
    }
    packageData = packageResult.value;

    // Trips are also important, but we can potentially render a page with no trips
    if (tripsResult.status === "rejected") {
      console.warn(
        `Could not fetch trips for package ${id}:`,
        tripsResult.reason.message
      );
      trips = []; // Default to an empty array on failure
    } else {
      trips = tripsResult.value || [];
    }
  } catch (error) {
    console.error(`Failed to fetch data for package ${id}:`, error.message);
    notFound(); // Renders the not-found.js page if critical data fails
  }

  // STEP 2: Render the page with the fetched data
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Hero Section --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        {packageData.images?.[0] && (
          <div className="absolute inset-0">
            <Image
              src={packageData.images[0]}
              alt={packageData.name}
              fill
              className="object-cover opacity-30 blur-sm"
              priority
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center mb-6">
            <Link
              href="/packages"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 mr-4"
            >
              <Icon icon="lucide:arrow-left" className="w-5 h-5 mr-2" />
              Back to Packages
            </Link>
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
              Package
            </div>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
            style={{ textShadow: "1px 1px 5px rgba(0,0,0,0.4)" }}
          >
            {packageData.name}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
            {packageData.description}
          </p>
          <div className="flex items-center mt-8 text-white/90">
            <Icon icon="lucide:calendar-check" className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {trips.length} Trip{trips.length !== 1 ? "s" : ""} Included
            </span>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="lucide:package"
                className="w-10 h-10 text-orange-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Trips Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              This package doesn't have any trips available right now. Please
              check back soon or explore our other packages.
            </p>
            <Link
              href="/packages"
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors duration-200"
            >
              View All Packages
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Available Trips
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from {trips.length} exciting trip/s in the "
                {packageData.name}" package.
              </p>
            </div>

            {/* --- Trips Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => {
                const pricing = formatPrice(
                  trip.adult_price,
                  trip.has_discount,
                  trip.discount_percentage
                );
                return (
                  // ✅ CHANGE: The entire card is now a link to the trip's page. No more onClick or modal.
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      {trip.has_discount && (
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <Icon icon="lucide:gift" className="w-4 h-4" />
                          {trip.discount_percentage}% OFF
                        </div>
                      )}
                      <div className="relative h-48 overflow-hidden">
                        {trip.images?.[0] ? (
                          <Image
                            src={trip.images[0]}
                            alt={trip.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                            <Icon
                              icon="lucide:waves"
                              className="w-12 h-12 text-white/50"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Icon icon="lucide:clock" className="w-4 h-4 mr-1" />
                          {formatDuration(trip.duration)}
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Icon
                            icon="lucide:star"
                            className="w-4 h-4 fill-current"
                          />
                          <span className="ml-1 text-gray-600">4.8</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
                        {trip.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {trip.description}
                      </p>
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <Icon icon="lucide:users" className="w-4 h-4 mr-2" />
                        Max {trip.maxim_person} people
                      </div>
                      <div className="border-t pt-4 mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {pricing.discounted ? (
                                <>
                                  <span className="text-gray-400 line-through text-sm">
                                    €{pricing.original}
                                  </span>
                                  <span className="text-2xl font-bold text-sky-600">
                                    €{pricing.discounted}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-sky-600">
                                  €{pricing.original}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Child: €{trip.child_price?.toFixed(0) || "N/A"}
                            </div>
                          </div>
                          <div className="bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm group-hover:bg-cyan-600 transition-colors duration-200">
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PackagePage;

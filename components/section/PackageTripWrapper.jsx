"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import MarkdownRenderer from "../ui/MarkdownRender";

// --- [NEW] Helper functions copied and adapted from the TripsPage ---

const formatPrice = (
  price,
  hasDiscount,
  discountPercentage,
  discountAlwaysAvailable
) => {
  // Only apply discount if it's always available.
  // The card doesn't know the number of people, so we can't check for min_people here.
  if (hasDiscount && discountPercentage && discountAlwaysAvailable) {
    const discountedPrice = price * (1 - discountPercentage / 100);
    return {
      original: price.toFixed(0),
      discounted: discountedPrice.toFixed(0),
      discount: discountPercentage,
    };
  }
  return { original: price.toFixed(0), discounted: null, discount: null };
};

const formatDuration = (duration) => {
  if (!duration) return "Duration TBD";
  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
  }
  return `${duration} minutes`;
};

const getDiscountBadgeText = (trip) => {
  if (!trip.has_discount) return null;

  if (trip.discount_always_available) {
    return `${trip.discount_percentage}% OFF`;
  } else if (trip.discount_requires_min_people) {
    // Provide a more general message on the card
    return `Up to ${trip.discount_percentage}% OFF`;
  }

  return `${trip.discount_percentage}% OFF`;
};

// --- [NEW & REWRITTEN] TripCard component using the TripsPage design ---
const TripCard = ({ trip, packages }) => {
  const pricing = formatPrice(
    trip.adult_price,
    trip.has_discount,
    trip.discount_percentage,
    trip.discount_always_available // Pass the new flag
  );
  const packageInfo = packages.find((p) => p.id === trip.package_id);
  const discountBadgeText = getDiscountBadgeText(trip);

  return (
    <Link key={trip.id} href={`/trips/${trip.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col relative">
        {/* Discount Badge */}
        {discountBadgeText && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Icon icon="lucide:gift" className="w-4 h-4" />
            {discountBadgeText}
          </div>
        )}

        {/* Child Not Allowed Badge */}
        {!trip.child_allowed && (
          <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Icon icon="lucide:user-x" className="w-4 h-4" />
            Adults Only
          </div>
        )}

        <div className="relative h-48 overflow-hidden">
          {trip.images && trip.images.length > 0 ? (
            <Image
              src={trip.images[0]}
              alt={trip.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
              <Icon icon="lucide:waves" className="w-12 h-12 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="flex items-center text-gray-600">
              <Icon icon="lucide:clock" className="w-4 h-4 mr-1" />
              {formatDuration(trip.duration)}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
            {trip.name}
          </h3>
          {packageInfo && (
            <div className="flex items-center text-sm text-cyan-600 mb-3">
              <Icon icon="lucide:package" className="w-4 h-4 mr-1" />
              {packageInfo.name}
            </div>
          )}
          <div className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            <MarkdownRenderer content={trip.description} />
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <Icon icon="lucide:users" className="w-4 h-4 mr-2" />
            Max {trip.maxim_person} people
          </div>

          {/* Discount Requirements Info */}
          {trip.has_discount &&
            trip.discount_requires_min_people &&
            !trip.discount_always_available && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                <div className="flex items-center text-xs text-blue-700">
                  <Icon icon="lucide:users" className="w-3 h-3 mr-1" />
                  <span>Group discount available</span>
                </div>
              </div>
            )}

          <div className="border-t pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {pricing.discounted ? (
                    <>
                      <span className="text-gray-400 line-through text-sm">
                        EGP {pricing.original}
                      </span>
                      <span className="text-2xl font-bold text-sky-600">
                        EGP {pricing.discounted}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-sky-600">
                      EGP {pricing.original}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {trip.child_allowed ? (
                    `Child: EGP ${trip.child_price?.toFixed(0) || "0"}`
                  ) : (
                    <span className="text-orange-600 font-medium">
                      Adults only
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm group-hover:bg-cyan-600 transition-colors duration-200">
                View Details
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- PackageCard component remains the same ---
const PackageCard = ({ pkg, trips }) => {
  const tripCount = trips.filter((trip) => trip.package_id === pkg.id).length;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <Link href={`/packages/${pkg.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          {pkg.images && pkg.images.length > 0 ? (
            <Image
              src={pkg.images[0]}
              alt={pkg.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
              <Icon
                icon="mdi:package-variant"
                className="w-12 h-12 text-white/50"
              />
            </div>
          )}
          <div className="absolute top-4 left-4 bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Package
          </div>
          {pkg.is_image_list && pkg.images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
              <Icon icon="mdi:camera-outline" className="w-4 h-4" />
              {pkg.images.length}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
              {pkg.name}
            </h3>
          </div>
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          <MarkdownRenderer content={pkg.description} />
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="text-sm text-gray-500">
            {tripCount} Trips available
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="group font-bold text-cyan-500 hover:text-cyan-600 transition-colors duration-200 flex items-center gap-1"
          >
            View Trips
            <Icon
              icon="mdi:arrow-right"
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

const PackageTripClientWrapper = ({ initialPackages, initialTrips }) => {
  const packages = initialPackages || [];
  const trips = initialTrips || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* TRIPS SECTION */}
      {trips.length > 0 && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-sky-600">
            Our Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} packages={packages} />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href={"/trips"}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1"
            >
              View All Trips
            </Link>
          </div>
        </div>
      )}

      {/* PACKAGES SECTION */}
      {packages.length > 0 && (
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-sky-600">
            Our Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} trips={trips} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              href={"/packages"}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1"
            >
              View All Packages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageTripClientWrapper;

// app/trips/page.js

import Input from "@/components/ui/Input";
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData } from "@/lib/server-axios";
import { formatDuration } from "@/utils/formatDurations";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 86400;

export const metadata = {
  title: "Trips ",
  description: "Explore our complete, curated list of premier dive trips",
  keywords: "diving, trips, destinations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Trips ",
    description: "Explore our complete, curated list of premier dive trips",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trips ",
    description: "Explore our complete, curated list of premier dive trips",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/trips",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const formatPrice = (
  price,
  hasDiscount,
  discountPercentage,
  discountAlwaysAvailable,
) => {
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

const getDiscountBadgeText = (trip) => {
  if (!trip.has_discount) return null;

  if (trip.discount_always_available) {
    return `${trip.discount_percentage}% OFF`;
  } else if (trip.discount_requires_min_people) {
    return `${trip.discount_percentage}% OFF (Min ${trip.discount_min_people} people)`;
  }

  return `${trip.discount_percentage}% OFF`;
};

const TripsPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;

  const searchTerm = resolvedSearchParams.search || "";
  const selectedPackage = resolvedSearchParams.package || "all";
  const priceRange = resolvedSearchParams.price || "all";
  const sortBy = resolvedSearchParams.sort || "name";

  let trips = [];
  let packages = [];
  let fetchError = null;

  try {
    const [tripsData, packagesData] = await Promise.all([
      getData("/trips/"),
      getData("/packages/"),
    ]);
    trips = tripsData || [];
    packages = packagesData || [];
  } catch (err) {
    console.error("Error fetching data on server:", err);
    fetchError =
      "We're having trouble loading our trips. Please check your connection and try again.";
  }

  const filteredAndSortedTrips = (() => {
    if (fetchError) return [];

    let filtered = trips.filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPackage =
        selectedPackage === "all" ||
        trip.package_id?.toString() === selectedPackage;

      const priceDetails = formatPrice(
        trip.adult_price,
        trip.has_discount,
        trip.discount_percentage,
        trip.discount_always_available,
      );
      const price = priceDetails.discounted || priceDetails.original;

      let matchesPrice = true;
      let prices = trips
        .map((trip) => {
          const priceDetails = formatPrice(
            trip.adult_price,
            trip.has_discount,
            trip.discount_percentage,
            trip.discount_always_available,
          );
          return parseFloat(priceDetails.discounted || priceDetails.original);
        })
        .filter((p) => !isNaN(p));
      prices.sort((a, b) => a - b);
      const min = prices[0] || 0;
      const max = prices[prices.length - 1] || 0;
      const q1 = prices[Math.floor(prices.length / 3)] || min;
      const q2 = prices[Math.floor((2 * prices.length) / 3)] || max;

      switch (priceRange) {
        case `min-${q1}`:
          matchesPrice = price >= min && price <= q1;
          break;
        case `q1-${q2}`:
          matchesPrice = price > q1 && price <= q2;
          break;
        case `q2-max`:
          matchesPrice = price > q2 && price <= max;
          break;
        case "all":
        default:
          matchesPrice = true;
      }
      return matchesSearch && matchesPackage && matchesPrice;
    });

    filtered.sort((a, b) => {
      const priceA = parseFloat(
        formatPrice(
          a.adult_price,
          a.has_discount,
          a.discount_percentage,
          a.discount_always_available,
        ).discounted ||
          formatPrice(
            a.adult_price,
            a.has_discount,
            a.discount_percentage,
            a.discount_always_available,
          ).original,
      );
      const priceB = parseFloat(
        formatPrice(
          b.adult_price,
          b.has_discount,
          b.discount_percentage,
          b.discount_always_available,
        ).discounted ||
          formatPrice(
            b.adult_price,
            b.has_discount,
            b.discount_percentage,
            b.discount_always_available,
          ).original,
      );

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "duration":
          return (b.duration || 0) - (a.duration || 0);
        case "capacity":
          return (b.maxim_person || 0) - (a.maxim_person || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  })();

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="lucide:alert-circle"
              className="w-10 h-10 text-red-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Unable to Load Trips
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{fetchError}</p>
          <Link
            href="/trips"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    searchTerm ||
    selectedPackage !== "all" ||
    priceRange !== "all" ||
    sortBy !== "name";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/image/hero-pattern.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 mt-6 tracking-tight">
              All Trips
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your next adventure starts here — browse trips for beginners and
              thrill-seekers alike.
            </p>
            <div className="flex items-center justify-center mt-8 text-white/90">
              <Icon icon="lucide:waves" className="w-6 h-6 mr-3" />
              <span className="text-lg">
                {trips.length} Amazing Trip{trips.length !== 1 ? "s" : ""}{" "}
                Available
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50/40 to-transparent" />
      </div>

      {/* Filters & Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          method="GET"
          action="/trips"
          className="bg-white rounded-2xl shadow-md ring-1 ring-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 w-full max-w-md">
              <Input
                name="search"
                icon={"wpf:search"}
                dir="ltr"
                type="text"
                placeholder="Search trips..."
                defaultValue={searchTerm}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium text-sm">
                {filteredAndSortedTrips.length} trip
                {filteredAndSortedTrips.length !== 1 ? "s" : ""} found
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-200 transition-colors duration-200 font-medium text-sm"
              >
                <Icon icon="lucide:filter" className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package
              </label>
              <select
                name="package"
                defaultValue={selectedPackage}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
              >
                <option value="all">All Packages</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id.toString()}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              {(() => {
                let prices = trips
                  .map((trip) => {
                    const priceDetails = formatPrice(
                      trip.adult_price,
                      trip.has_discount,
                      trip.discount_percentage,
                      trip.discount_always_available,
                    );
                    return parseFloat(
                      priceDetails.discounted || priceDetails.original,
                    );
                  })
                  .filter((p) => !isNaN(p));
                prices.sort((a, b) => a - b);
                const min = prices[0] || 0;
                const max = prices[prices.length - 1] || 0;
                const q1 = prices[Math.floor(prices.length / 3)] || min;
                const q2 = prices[Math.floor((2 * prices.length) / 3)] || max;
                return (
                  <select
                    name="price"
                    defaultValue={priceRange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Prices</option>
                    <option
                      value={`min-${q1}`}
                    >{`EGP ${min} - EGP ${q1}`}</option>
                    <option value={`q1-${q2}`}>{`EGP ${
                      q1 + 1
                    } - EGP ${q2}`}</option>
                    <option value={`q2-max`}>{`EGP ${
                      q2 + 1
                    } - EGP ${max}`}</option>
                  </select>
                );
              })()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                name="sort"
                defaultValue={sortBy}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="duration">Duration (Longest First)</option>
                <option value="capacity">Capacity (Largest First)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Link
                href="/trips"
                className="w-full text-center bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Clear All
              </Link>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
              <Icon icon="lucide:info" className="w-3.5 h-3.5" />
              Filters are active — results below reflect your selection.
            </div>
          )}
        </form>

        {/* Trips Grid */}
        {filteredAndSortedTrips.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="lucide:search-x"
                className="w-10 h-10 text-orange-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Trips Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              No trips match your current filter criteria. Try adjusting your
              filters or search terms.
            </p>
            <Link
              href="/trips"
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors duration-200"
            >
              Show All Trips
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedTrips.map((trip) => {
              const pricing = formatPrice(
                trip.adult_price,
                trip.has_discount,
                trip.discount_percentage,
                trip.discount_always_available,
              );
              const packageInfo = packages.find(
                (p) => p.id === trip.package_id,
              );
              const discountBadgeText = getDiscountBadgeText(trip);

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-sky-200/60 ring-1 ring-gray-100 transition-all duration-300 overflow-hidden h-full flex flex-col relative hover:-translate-y-1.5">
                    {discountBadgeText && (
                      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Icon icon="lucide:gift" className="w-3.5 h-3.5" />
                        {discountBadgeText}
                      </div>
                    )}

                    {!trip.child_allowed && (
                      <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Icon icon="lucide:user-x" className="w-3.5 h-3.5" />
                        Adults Only
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {trip.images && trip.images.length > 0 ? (
                        <Image
                          src={trip.images[0]}
                          alt={trip.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                          <Icon
                            icon="lucide:waves"
                            className="w-12 h-12 text-white/50"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {trip.is_image_list &&
                        trip.images &&
                        trip.images.length > 1 && (
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                            <Icon
                              icon="lucide:camera"
                              className="w-3.5 h-3.5"
                            />
                            {trip.images.length}
                          </div>
                        )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center text-gray-500 font-medium">
                          <Icon icon="lucide:clock" className="w-4 h-4 mr-1" />
                          {formatDuration(trip.duration, trip.duration_unit)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
                        {trip.name}
                      </h3>
                      {packageInfo && (
                        <div className="flex items-center text-sm text-cyan-600 mb-3 font-medium">
                          <Icon
                            icon="lucide:package"
                            className="w-4 h-4 mr-1"
                          />
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

                      {trip.has_discount &&
                        trip.discount_requires_min_people &&
                        !trip.discount_always_available && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                            <div className="flex items-center text-xs text-blue-700">
                              <Icon
                                icon="lucide:users"
                                className="w-3 h-3 mr-1"
                              />
                              <span>
                                Group discount: Min {trip.discount_min_people}{" "}
                                people
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
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
                                <>
                                  Child: EGP{" "}
                                  {trip.child_price?.toFixed(0) || "0"}
                                </>
                              ) : (
                                <span className="text-orange-600 font-medium">
                                  Adults only
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm group-hover:bg-cyan-600 transition-colors duration-200 whitespace-nowrap">
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;

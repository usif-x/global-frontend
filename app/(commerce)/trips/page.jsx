import Input from "@/components/ui/Input";
import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

// Helper functions can be defined at the top level as they are pure.
const formatPrice = (price, hasDiscount, discountPercentage) => {
  if (hasDiscount && discountPercentage) {
    const originalPrice = price / (1 - discountPercentage / 100);
    return {
      original: originalPrice.toFixed(0),
      discounted: price.toFixed(0),
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

// ✅ This is an async Server Component that accepts searchParams
const TripsPage = async ({ searchParams }) => {
  // 1. Get filter state from URL query parameters, with defaults
  const searchTerm = searchParams.search || "";
  const selectedPackage = searchParams.package || "all";
  const priceRange = searchParams.price || "all";
  const sortBy = searchParams.sort || "name";

  // 2. Fetch all necessary data on the server
  let trips = [];
  let packages = [];
  let fetchError = null;

  try {
    const [tripsData, packagesData] = await Promise.all([
      getData("/trips"),
      getData("/packages"),
    ]);
    trips = tripsData || [];
    packages = packagesData || [];
  } catch (err) {
    console.error("Error fetching data on server:", err);
    fetchError =
      "We're having trouble loading our trips. Please check your connection and try again.";
  }

  // 3. Filter and sort data on the server based on searchParams
  const filteredAndSortedTrips = (() => {
    if (fetchError) return []; // Don't process if data fetching failed

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
        trip.discount_percentage
      );
      const price = priceDetails.discounted || priceDetails.original;

      let matchesPrice = true;
      switch (priceRange) {
        case "under-25":
          matchesPrice = parseFloat(price) < 25;
          break;
        case "25-50":
          matchesPrice = parseFloat(price) >= 25 && parseFloat(price) <= 50;
          break;
        case "50-100":
          matchesPrice = parseFloat(price) > 50 && parseFloat(price) <= 100;
          break;
        case "over-100":
          matchesPrice = parseFloat(price) > 100;
          break;
        default:
          matchesPrice = true;
      }
      return matchesSearch && matchesPackage && matchesPrice;
    });

    filtered.sort((a, b) => {
      const priceA = parseFloat(
        formatPrice(a.adult_price, a.has_discount, a.discount_percentage)
          .discounted ||
          formatPrice(a.adult_price, a.has_discount, a.discount_percentage)
            .original
      );
      const priceB = parseFloat(
        formatPrice(b.adult_price, b.has_discount, b.discount_percentage)
          .discounted ||
          formatPrice(b.adult_price, b.has_discount, b.discount_percentage)
            .original
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

  // Server-side error state rendering
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">All Trips</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your next adventure starts here — browse trips for beginners and
              thrill-seekers alike.
            </p>
            <div className="flex items-center justify-center mt-8 text-white/90">
              <Icon icon="lucide:waves" className="w-6 h-6 mr-3" />
              <span className="text-lg">
                {trips.length} Amazing Trips Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The form submits via GET, changing the URL search params and triggering a server re-render */}
        <form
          method="GET"
          action="/trips"
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Input
                name="search" // Name is used for form submission
                icon={"wpf:search"}
                dir="ltr"
                type="text"
                placeholder="Search trips..."
                defaultValue={searchTerm} // Use defaultValue for uncontrolled inputs
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {filteredAndSortedTrips.length} trip
                {filteredAndSortedTrips.length !== 1 ? "s" : ""} found
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-200 transition-colors duration-200"
              >
                <Icon icon="lucide:filter" className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package
              </label>
              <select
                name="package"
                defaultValue={selectedPackage}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
              <select
                name="price"
                defaultValue={priceRange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under-25">Under €25</option>
                <option value="25-50">€25 - €50</option>
                <option value="50-100">€50 - €100</option>
                <option value="over-100">Over €100</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                name="sort"
                defaultValue={sortBy}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
        </form>

        {/* Trips Grid: Renders the results of the server-side filtering */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedTrips.map((trip) => {
              const pricing = formatPrice(
                trip.adult_price,
                trip.has_discount,
                trip.discount_percentage
              );
              const packageInfo = packages.find(
                (p) => p.id === trip.package_id
              );

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                    {trip.has_discount && (
                      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Icon icon="lucide:gift" className="w-4 h-4" />
                        {trip.discount_percentage}% OFF
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
                          <Icon
                            icon="lucide:waves"
                            className="w-12 h-12 text-white/50"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {trip.is_image_list &&
                        trip.images &&
                        trip.images.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                            <Icon icon="lucide:camera" className="w-4 h-4" />
                            {trip.images.length}
                          </div>
                        )}
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
                      {packageInfo && (
                        <div className="flex items-center text-sm text-cyan-600 mb-3">
                          <Icon
                            icon="lucide:package"
                            className="w-4 h-4 mr-1"
                          />
                          {packageInfo.name}
                        </div>
                      )}
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
                                    € {pricing.original}
                                  </span>
                                  <span className="text-2xl font-bold text-sky-600">
                                    € {pricing.discounted}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-sky-600">
                                  € {pricing.original}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Child: € {trip.child_price?.toFixed(0) || "N/A"}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;

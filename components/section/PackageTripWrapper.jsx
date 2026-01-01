"use client";
import { formatDuration } from "@/utils/formatDurations";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import MarkdownRenderer from "../ui/MarkdownRender";

// --- Helper functions ---
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

// --- TripCard component ---
const TripCard = ({ trip, packages }) => {
  const pricing = formatPrice(
    trip.adult_price,
    trip.has_discount,
    trip.discount_percentage,
    trip.discount_always_available
  );
  const packageInfo = packages.find((p) => p.id === trip.package_id);
  const discountBadgeText = getDiscountBadgeText(trip);

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-200 group">
        {/* Image Section */}
        <div className="h-64 relative overflow-hidden">
          {trip.images && trip.images.length > 0 ? (
            <Image
              src={trip.images[0]}
              alt={trip.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Icon icon="lucide:waves" className="w-16 h-16 text-white/50" />
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Discount Badge */}
          {discountBadgeText && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                <Icon icon="lucide:gift" className="w-4 h-4" />
                {discountBadgeText}
              </span>
            </div>
          )}

          {/* Child Not Allowed Badge */}
          {!trip.child_allowed && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                <Icon icon="lucide:user-x" className="w-4 h-4" />
                Adults Only
              </span>
            </div>
          )}

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg group-hover:text-cyan-300 transition-colors duration-200">
              {trip.name}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          {/* Description */}
          <div className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
            <MarkdownRenderer content={trip.description} />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {packageInfo && (
              <div className="flex items-center gap-1">
                <Icon icon="lucide:package" className="w-4 h-4 text-cyan-500" />
                <span>{packageInfo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Icon icon="lucide:clock" className="w-4 h-4 text-cyan-500" />
              <span>{formatDuration(trip.duration, trip.duration_unit)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="lucide:users" className="w-4 h-4 text-cyan-500" />
              <span>Max {trip.maxim_person}</span>
            </div>
          </div>

          {/* Discount Requirements Info */}
          {trip.has_discount &&
            trip.discount_requires_min_people &&
            !trip.discount_always_available && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                <div className="flex items-center text-xs text-blue-700">
                  <Icon icon="lucide:info" className="w-3 h-3 mr-1" />
                  <span>Group discount available</span>
                </div>
              </div>
            )}

          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <div>
              {pricing.discounted ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-sm">
                      EGP {pricing.original}
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      EGP {pricing.discounted}
                    </span>
                  </div>
                  {trip.child_allowed && trip.child_price && (
                    <span className="text-sm text-gray-500 block mt-1">
                      Child: EGP {trip.child_price.toFixed(0)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    EGP {pricing.original}
                  </span>
                  {trip.child_allowed && trip.child_price ? (
                    <span className="text-sm text-gray-500 block mt-1">
                      Child: EGP {trip.child_price.toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-sm text-orange-600 font-medium block mt-1">
                      Adults only
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02]">
            <Icon icon="lucide:arrow-right-circle" className="w-5 h-5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- PackageCard component ---
const PackageCard = ({ pkg, trips }) => {
  const tripCount = trips.filter((trip) => trip.package_id === pkg.id).length;

  return (
    <Link href={`/packages/${pkg.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-200 group">
        {/* Image Section */}
        <div className="h-64 relative overflow-hidden">
          {pkg.images && pkg.images.length > 0 ? (
            <Image
              src={pkg.images[0]}
              alt={pkg.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Icon icon="lucide:package" className="w-16 h-16 text-white/50" />
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Package Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-cyan-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
              <Icon icon="lucide:package" className="w-4 h-4" />
              Package
            </span>
          </div>

          {/* Image Count Badge */}
          {pkg.is_image_list && pkg.images.length > 1 && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                <Icon icon="lucide:images" className="w-4 h-4" />
                {pkg.images.length}
              </span>
            </div>
          )}

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg group-hover:text-cyan-300 transition-colors duration-200">
              {pkg.name}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          {/* Description */}
          <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
            <MarkdownRenderer content={pkg.description} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <Icon
                icon="lucide:calendar-check"
                className="w-4 h-4 text-cyan-500"
              />
              <span>
                {tripCount} {tripCount === 1 ? "Trip" : "Trips"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="lucide:gift" className="w-4 h-4 text-cyan-500" />
              <span>Bundled Deal</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02]">
            <Icon icon="lucide:arrow-right-circle" className="w-5 h-5" />
            <span>View Trips</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Enhanced View All Trips Section Component ---
const EnhancedViewAllTrips = ({ tripsCount, displayedCount }) => (
  <div className="mt-16">
    <div className="relative bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 rounded-3xl p-6 sm:p-8 md:p-12 border border-sky-100 shadow-lg overflow-hidden">
      {/* Decorative elements - hidden on mobile, visible on larger screens */}
      <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-sky-200/30 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative text-center">
        {/* Icon and stats */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full mb-4 shadow-lg">
            <Icon
              icon="lucide:compass"
              className="w-7 h-7 sm:w-8 sm:h-8 text-white"
            />
          </div>
          <div className="flex items-center justify-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-600 flex-wrap gap-y-2 px-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:map-pin"
                className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0"
              />
              <span>Multiple Destinations</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:calendar"
                className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0"
              />
              <span>Year-round Adventures</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:users"
                className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0"
              />
              <span>All Experience Levels</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Discover More Adventures
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            You've seen {displayedCount} of our incredible diving trips. Explore
            our complete collection of {tripsCount}+ adventures, from day trips
            to multi-day expeditions across the Red Sea's most spectacular dive
            sites.
          </p>
        </div>

        {/* Enhanced CTA Button */}
        <Link
          href="/trips"
          className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

          {/* Button content */}
          <div className="relative flex items-center space-x-2 sm:space-x-3">
            <Icon
              icon="lucide:waves"
              className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300"
            />
            <span>Explore All Trips</span>
            <div className="flex items-center">
              <Icon
                icon="lucide:arrow-right"
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
              />
            </div>
          </div>
        </Link>

        {/* Additional info */}
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-2">
          <span className="block sm:inline">
            ✨ Best price guarantee • Expert guides • All equipment included
          </span>
        </div>
      </div>
    </div>
  </div>
);

// --- Enhanced View All Packages Section Component ---
const EnhancedViewAllPackages = ({ packagesCount, displayedCount }) => (
  <div className="mt-16">
    <div className="relative bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-6 sm:p-8 md:p-12 border border-purple-100 shadow-lg overflow-hidden">
      {/* Decorative elements - hidden on mobile, visible on larger screens */}
      <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative text-center">
        {/* Icon and stats */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
            <Icon
              icon="lucide:package"
              className="w-7 h-7 sm:w-8 sm:h-8 text-white"
            />
          </div>
          <div className="flex items-center justify-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-600 flex-wrap gap-y-2 px-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:gift"
                className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0"
              />
              <span>Special Offers</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:sparkles"
                className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0"
              />
              <span>Curated Experiences</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Icon
                icon="lucide:check-circle"
                className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0"
              />
              <span>Best Value</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Explore More Packages
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            You've seen {displayedCount} of our {packagesCount} curated
            packages. Discover more bundled adventures designed to give you the
            best diving experience at incredible value.
          </p>
        </div>

        {/* Enhanced CTA Button */}
        <Link
          href="/packages"
          className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

          {/* Button content */}
          <div className="relative flex items-center space-x-2 sm:space-x-3">
            <Icon
              icon="lucide:package"
              className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300"
            />
            <span>View All Packages</span>
            <div className="flex items-center">
              <Icon
                icon="lucide:arrow-right"
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
              />
            </div>
          </div>
        </Link>

        {/* Additional info */}
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-2">
          <span className="block sm:inline">
            🎁 Bundled savings • Complete experiences • Everything included
          </span>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---
const PackageTripClientWrapper = ({ initialPackages, initialTrips }) => {
  const packages = initialPackages || [];
  const trips = initialTrips || [];

  // Show all trips in the carousel
  const displayedTrips = trips.slice(0, 8); // Limit to 8 for performance

  // Get unique package IDs from all trips
  const tripPackageIds = [
    ...new Set(trips.map((trip) => trip.package_id).filter(Boolean)),
  ];

  // Show packages that are associated with trips
  const displayedPackages = packages
    .filter((pkg) => tripPackageIds.includes(pkg.id))
    .slice(0, 6); // Limit to 6 for performance

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* TRIPS SECTION */}
      {trips.length > 0 && (
        <section className="mb-20">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
              <Icon icon="lucide:waves" className="text-cyan-500" width={20} />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Trips
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Explore Our Trips
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover unforgettable adventures across the Red Sea
            </p>
          </div>

          {/* Swiper Carousel */}
          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              loop={displayedTrips.length > 3}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-trips",
              }}
              navigation={{
                nextEl: ".swiper-button-next-trips",
                prevEl: ".swiper-button-prev-trips",
              }}
              className="pb-16"
            >
              {displayedTrips.map((trip) => (
                <SwiperSlide key={trip.id}>
                  <TripCard trip={trip} packages={packages} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-prev-trips absolute top-1/2 -left-4 lg:-left-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="lucide:chevron-left"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>
            <div className="swiper-button-next-trips absolute top-1/2 -right-4 lg:-right-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="lucide:chevron-right"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>

            {/* Custom Pagination */}
            <div className="swiper-pagination-trips flex justify-center gap-2 mt-8"></div>
          </div>

          {/* View All Button */}
          {trips.length > displayedTrips.length && (
            <div className="mt-12 text-center">
              <Link
                href="/trips"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Icon icon="lucide:compass" width={24} />
                <span>View All {trips.length} Trips</span>
                <Icon icon="lucide:arrow-right" width={20} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* PACKAGES SECTION */}
      {displayedPackages.length > 0 && (
        <section className="mb-20">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
              <Icon
                icon="lucide:package"
                className="text-cyan-500"
                width={20}
              />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Trip Packages
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Curated Packages
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Bundle and save with our specially designed packages
            </p>
          </div>

          {/* Swiper Carousel */}
          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              loop={displayedPackages.length > 3}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-packages",
              }}
              navigation={{
                nextEl: ".swiper-button-next-packages",
                prevEl: ".swiper-button-prev-packages",
              }}
              className="pb-16"
            >
              {displayedPackages.map((pkg) => (
                <SwiperSlide key={pkg.id}>
                  <PackageCard pkg={pkg} trips={trips} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-prev-packages absolute top-1/2 -left-4 lg:-left-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="lucide:chevron-left"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>
            <div className="swiper-button-next-packages absolute top-1/2 -right-4 lg:-right-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="lucide:chevron-right"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>

            {/* Custom Pagination */}
            <div className="swiper-pagination-packages flex justify-center gap-2 mt-8"></div>
          </div>

          {/* View All Button */}
          {packages.length > displayedPackages.length && (
            <div className="mt-12 text-center">
              <Link
                href="/packages"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Icon icon="lucide:package" width={24} />
                <span>View All {packages.length} Packages</span>
                <Icon icon="lucide:arrow-right" width={20} />
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default PackageTripClientWrapper;

"use client";

import BestSellingService from "@/services/bestsellingService";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import MarkdownRenderer from "../ui/MarkdownRender";
// --- Reusable Normalization Function ---
const normalizeApiItem = (apiItem) => {
  const isCourse = apiItem.item_type === "course";
  const itemData = isCourse ? apiItem.course : apiItem.trip;
  if (!itemData) return null;

  // Helper function to parse field data (same as trips page)
  const parseFieldData = (fieldData) => {
    let items = [];
    if (Array.isArray(fieldData)) {
      if (fieldData.length > 0 && typeof fieldData[0] === "string") {
        try {
          const parsed = JSON.parse(fieldData[0]);
          items = Array.isArray(parsed)
            ? parsed.filter((item) => item && item.trim())
            : [];
        } catch {
          items = fieldData.filter((item) => item && item.trim());
        }
      } else {
        items = fieldData.filter((item) => item && item.trim());
      }
    } else if (typeof fieldData === "string") {
      try {
        const parsed = JSON.parse(fieldData);
        items = Array.isArray(parsed)
          ? parsed.filter((item) => item && item.trim())
          : [];
      } catch {
        items = fieldData
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      }
    }
    return items;
  };

  // Parse the included items properly
  const includedItems = parseFieldData(itemData.included);

  return {
    id: itemData.id,
    type: apiItem.item_type,
    name: itemData.name,
    description: itemData.description,
    image: itemData.images?.[0],
    price: isCourse ? itemData.price : itemData.adult_price,
    childPrice: !isCourse ? itemData.child_price : null,
    href: isCourse ? `/courses/${itemData.id}` : `/trips/${itemData.id}`,
    rank: apiItem.ranking_position,
    included: includedItems,
    duration: itemData.duration,
    durationUnit: itemData.duration_unit || (isCourse ? "days" : "hour/s"),
    hasDiscount: !isCourse ? itemData.has_discount : false,
    discountPercentage: !isCourse ? itemData.discount_percentage : null,
  };
};

// --- Hero Card Component ---
const BestSellerHeroCard = ({ item, isActive }) => {
  const isCourse = item.type === "course";
  const badge = {
    color: isCourse ? "bg-blue-100 text-blue-800" : "bg-sky-100 text-sky-800",
    label: isCourse ? "Course" : "Trip",
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-80"
      } bg-white`}
    >
      {/* Image */}
      <div className="relative h-64 sm:h-80">
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Rank and Type Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
            Top #{item.rank}
          </span>
          <span
            className={`${badge.color} text-xs font-semibold px-2 py-1 rounded-full`}
          >
            {badge.label}
          </span>
        </div>
        {/* Discount Badge */}
        {item.hasDiscount && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {item.discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
          <MarkdownRenderer content={item.description} />
        </p>

        {/* Price and Duration */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              EGP {parseFloat(item.price).toFixed(2)}
              {item.childPrice && (
                <span className="text-sm text-gray-500">
                  {" "}
                  / EGP {item.childPrice} (child)
                </span>
              )}
            </p>
            {item.duration && (
              <p className="text-sm text-gray-500">
                Duration: {item.duration} {item.durationUnit}
              </p>
            )}
          </div>
        </div>

        {/* Included Items */}
        {item.included.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              What’s Included:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {item.included.slice(0, 3).map((inc, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Icon icon="mdi:check-circle" className="text-sky-500" />
                  {inc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <Link
          href={item.href}
          className="mt-6 inline-block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// --- [NEW] Empty State Component ---
const EmptyState = () => (
  <div className="flex flex-col justify-center items-center h-96 bg-white rounded-2xl border border-dashed p-8">
    <Icon icon="lucide:search-x" className="w-16 h-16 text-sky-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700">No Best Sellers Yet</h3>
    <p className="text-gray-500 mt-2 text-center">
      We're still curating our top experiences. Please check back soon!
    </p>
  </div>
);

// --- Main Hero Section Component ---
const BestSellersHero = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopItems = async () => {
      try {
        setIsLoading(true);
        const response = await BestSellingService.getAll({
          per_page: 6,
          sort_by: "ranking_position",
          sort_order: "asc",
        });
        const normalized = (response.items || [])
          .map(normalizeApiItem)
          .filter(Boolean);
        setItems(normalized);
      } catch (error) {
        console.error("Failed to load hero items:", error);
        // Set items to empty array on error to show the empty state
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopItems();
  }, []);

  return (
    <section className="py-12 bg-sky-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-800">
              Discover Our Best Sellers
            </h2>
            <p className="text-lg text-gray-600">
              Hand-picked by our community, these are the most popular courses
              and trips to help you excel and explore.
            </p>
            <ul className="space-y-4">
              {[
                {
                  icon: "mdi:star-check-outline",
                  text: "Top-rated and expert-recommended",
                },
                {
                  icon: "mdi:clock-fast",
                  text: "Save time with proven choices",
                },
                {
                  icon: "mdi:rocket-launch-outline",
                  text: "Fast-track your skills and adventures",
                },
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Icon
                    icon={feature.icon}
                    className="text-blue-500 text-2xl"
                  />
                  <span className="text-gray-700">{feature.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/trips" // Changed to a more general link
              className="inline-block bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Explore All Trips & Courses
            </Link>
          </div>

          {/* Right Side: Swiper Slider or Empty State */}
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              </div>
            ) : items.length > 0 ? (
              // --- [FIX] This block only renders if there are items ---
              <>
                <Swiper
                  modules={[Autoplay, Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  loop={true}
                  breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 30 },
                  }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  navigation={{
                    nextEl: ".swiper-button-next-custom", // Use custom class
                    prevEl: ".swiper-button-prev-custom", // Use custom class
                  }}
                  pagination={{
                    clickable: true,
                    el: ".swiper-pagination-custom",
                  }} // Use custom class
                  className="pb-12"
                >
                  {items.map((item) => (
                    <SwiperSlide key={item.id}>
                      {({ isActive }) => (
                        <BestSellerHeroCard item={item} isActive={isActive} />
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation */}
                <div className="swiper-button-prev-custom absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-md cursor-pointer z-10 hover:bg-gray-100 transition-colors">
                  <Icon
                    icon="mdi:chevron-left"
                    className="h-6 w-6 text-blue-500"
                  />
                </div>
                <div className="swiper-button-next-custom absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-md cursor-pointer z-10 hover:bg-gray-100 transition-colors">
                  <Icon
                    icon="mdi:chevron-right"
                    className="h-6 w-6 text-blue-500"
                  />
                </div>

                {/* Custom Pagination */}
                <div className="swiper-pagination-custom absolute -bottom-4 left-1/2 -translate-x-1/2 w-full text-center"></div>
              </>
            ) : (
              // --- [FIX] This block renders if loading is done AND there are no items ---
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellersHero;

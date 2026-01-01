"use client";

import BestSellingService from "@/services/bestsellingService";
import { getImageUrl } from "@/utils/imageUtils";
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

  // Helper function to parse field data with multiple levels of JSON encoding
  const parseFieldData = (fieldData) => {
    let items = [];
    let data = fieldData;

    // Keep unwrapping until we get to the actual array
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (attempts < maxAttempts) {
      attempts++;

      // If it's an array with a single string element, try to parse that string
      if (Array.isArray(data)) {
        if (
          data.length === 1 &&
          typeof data[0] === "string" &&
          (data[0].trim().startsWith("[") ||
            data[0].trim().startsWith("{") ||
            data[0].trim().startsWith('"'))
        ) {
          try {
            data = JSON.parse(data[0]);
            continue; // Try again with the parsed result
          } catch {
            // If parsing fails, treat array elements as items
            items = data.filter(
              (item) => item && (typeof item === "string" ? item.trim() : item)
            );
            break;
          }
        } else if (data.length > 0 && Array.isArray(data[0])) {
          // If first element is an array, unwrap it
          data = data[0];
          continue;
        } else {
          // It's an array of strings
          items = data.filter(
            (item) => item && (typeof item === "string" ? item.trim() : item)
          );
          break;
        }
      } else if (typeof data === "string") {
        // Try to parse string
        try {
          data = JSON.parse(data);
          continue; // Try again with the parsed result
        } catch {
          // If parsing fails, treat as single item
          items = [data];
          break;
        }
      } else {
        // Unknown type, stop
        break;
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
    image: getImageUrl(itemData.images?.[0]),
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

// --- Best Seller Card Component ---
const BestSellerCard = ({ item }) => {
  const isCourse = item.type === "course";

  return (
    <Link href={item.href}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-200 group">
        {/* Image Section */}
        <div className="h-64 relative overflow-hidden">
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Rank Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-amber-400 text-black text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Icon icon="mdi:trophy" width={16} />
              Top #{item.rank}
            </span>
          </div>

          {/* Type Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span
              className={`${
                isCourse ? "bg-blue-500" : "bg-cyan-500"
              } text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg`}
            >
              {isCourse ? "Course" : "Trip"}
            </span>
          </div>

          {/* Discount Badge */}
          {item.hasDiscount && (
            <div className="absolute bottom-4 right-4 z-10">
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                -{item.discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          {/* Description */}
          <div className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
            <MarkdownRenderer content={item.description} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {item.duration && (
              <div className="flex items-center gap-1">
                <Icon
                  icon="mdi:clock-outline"
                  className="w-4 h-4 text-cyan-500"
                />
                <span>
                  {item.duration} {item.durationUnit}
                </span>
              </div>
            )}
            {item.included.length > 0 && (
              <div className="flex items-center gap-1">
                <Icon
                  icon="mdi:check-circle"
                  className="w-4 h-4 text-cyan-500"
                />
                <span>{item.included.length} included</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                EGP {parseFloat(item.price).toFixed(0)}
              </span>
              {item.childPrice && (
                <span className="text-sm text-gray-500 block mt-1">
                  EGP {item.childPrice} (child)
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02]">
            <Icon icon="mdi:arrow-right-circle" className="w-5 h-5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Empty State Component ---
const EmptyState = () => (
  <div className="col-span-full flex flex-col justify-center items-center py-20">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
      <Icon icon="mdi:trophy" className="text-white" width={40} />
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-3">
      No Best Sellers Yet
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      We're curating our top experiences. Check back soon for our most popular
      trips and courses!
    </p>
  </div>
);

// --- Main Component ---
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
        console.error("Failed to load best sellers:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopItems();
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Icon icon="mdi:trophy" className="text-amber-500" width={20} />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Best Sellers
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Most Popular Experiences
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Discover our top-rated trips and courses, loved by divers worldwide
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* Swiper Slider */}
            <div className="relative max-w-7xl mx-auto">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                loop={items.length > 3}
                breakpoints={{
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 24 },
                  1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-bestsellers",
                }}
                navigation={{
                  nextEl: ".swiper-button-next-bestsellers",
                  prevEl: ".swiper-button-prev-bestsellers",
                }}
                className="pb-16"
              >
                {items.map((item) => (
                  <SwiperSlide key={`${item.type}-${item.id}`}>
                    <BestSellerCard item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Arrows */}
              <div className="swiper-button-prev-bestsellers absolute top-1/2 -left-4 lg:-left-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
                <Icon
                  icon="mdi:chevron-left"
                  className="h-6 w-6 text-cyan-600 group-hover:text-white"
                />
              </div>
              <div className="swiper-button-next-bestsellers absolute top-1/2 -right-4 lg:-right-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
                <Icon
                  icon="mdi:chevron-right"
                  className="h-6 w-6 text-cyan-600 group-hover:text-white"
                />
              </div>

              {/* Custom Pagination */}
              <div className="swiper-pagination-bestsellers flex justify-center gap-2 mt-8"></div>
            </div>

            {/* View All Button */}
            <div className="mt-16 text-center">
              <Link
                href="/bestsellers"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Icon icon="mdi:trophy-variant" width={24} />
                <span>View All Best Sellers</span>
                <Icon icon="mdi:arrow-right" width={20} />
              </Link>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

export default BestSellersHero;

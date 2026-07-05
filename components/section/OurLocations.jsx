"use client";

import DiveCenterService from "@/services/divecenterService";
import { getImageUrl } from "@/utils/imageUtils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// --- Helpers ---
const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

// Returns today's key ("monday", "tuesday", ...) so we can highlight it
const getTodayKey = () => DAY_ORDER[(new Date().getDay() + 6) % 7];

const formatTime = (time) => {
  if (!time) return "";
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
};

// --- Working Hours Row ---
const WorkingHoursList = ({ workingHours }) => {
  const todayKey = useMemo(() => getTodayKey(), []);

  if (!workingHours) return null;

  return (
    <div className="space-y-1.5">
      {DAY_ORDER.map((day) => {
        const info = workingHours[day];
        const isToday = day === todayKey;
        if (!info) return null;

        return (
          <div
            key={day}
            className={`flex items-center justify-between text-sm px-2 py-1 rounded-lg ${
              isToday
                ? "bg-cyan-50 font-semibold text-cyan-700"
                : "text-gray-600"
            }`}
          >
            <span>{DAY_LABELS[day]}</span>
            <span>
              {info.is_open
                ? `${formatTime(info.start)} - ${formatTime(info.end)}`
                : "Closed"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Open Now Badge ---
const OpenStatusBadge = ({ workingHours }) => {
  const status = useMemo(() => {
    if (!workingHours) return null;
    const todayKey = getTodayKey();
    const today = workingHours[todayKey];
    if (!today || !today.is_open) return "closed";

    const now = new Date();
    const [startH, startM] = today.start.split(":").map(Number);
    const [endH, endM] = today.end.split(":").map(Number);
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const minutesStart = startH * 60 + startM;
    const minutesEnd = endH * 60 + endM;

    return minutesNow >= minutesStart && minutesNow <= minutesEnd
      ? "open"
      : "closed";
  }, [workingHours]);

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
        status === "open"
          ? "bg-emerald-500 text-white"
          : "bg-gray-500 text-white"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status === "open" ? "bg-white animate-pulse" : "bg-white/70"
        }`}
      />
      {status === "open" ? "Open Now" : "Closed Now"}
    </span>
  );
};

// --- Location Card ---
const LocationCard = ({ center }) => {
  const coverImage = center.images?.[0]
    ? getImageUrl(center.images[0])
    : "/placeholder.jpg";

  const todayHours = center.working_hours
    ? center.working_hours[getTodayKey()]
    : null;

  return (
    <Link
      href={`/divingcenter-locations/${center.id}`}
      className="group relative h-full block"
    >
      <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 flex flex-col">
        {/* Image */}
        <div className="h-36 relative overflow-hidden">
          <Image
            src={coverImage}
            alt={center.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Open/Closed badge */}
          <div className="absolute top-3 right-3 z-10">
            <OpenStatusBadge workingHours={center.working_hours} />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-1">
              {center.name}
            </h3>
            {center.hotel_name && (
              <p className="text-white/90 text-xs flex items-center gap-1.5 mt-0.5">
                <Icon icon="mdi:office-building-marker" width={14} />
                {center.hotel_name}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Location */}
          {center.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-2">
              <Icon
                icon="mdi:map-marker"
                className="text-cyan-500 flex-shrink-0"
                width={16}
              />
              <span className="truncate">{center.location}</span>
            </div>
          )}

          {/* Contact */}
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
            {center.phone && (
              <span className="flex items-center gap-1.5">
                <Icon icon="mdi:phone" className="text-cyan-500" width={15} />
                {center.phone}
              </span>
            )}
            {center.email && (
              <span className="flex items-center gap-1.5 truncate">
                <Icon icon="mdi:email" className="text-cyan-500" width={15} />
                <span className="truncate">{center.email}</span>
              </span>
            )}
          </div>

          {/* Today's hours */}
          {todayHours && (
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Icon icon="mdi:clock-outline" width={16} />
                Today
              </span>
              <span className="font-semibold text-gray-700">
                {todayHours.is_open
                  ? `${formatTime(todayHours.start)} - ${formatTime(todayHours.end)}`
                  : "Closed"}
              </span>
            </div>
          )}

          {/* View Details CTA */}
          <button className="w-full mt-auto bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-600 group-hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group-hover:shadow-cyan-500/50 transform group-hover:scale-[1.02] text-sm">
            <Icon icon="mdi:map-marker-radius" className="w-4 h-4" />
            <span>View Location</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Empty State ---
const EmptyState = () => (
  <div className="col-span-full flex flex-col justify-center items-center py-20">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
      <Icon icon="mdi:map-marker-radius" className="text-white" width={40} />
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-3">
      No Locations Yet
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      We're setting up our dive centers. Check back soon to find us on the map!
    </p>
  </div>
);

// --- Main Component ---
const OurLocations = () => {
  const [centers, setCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setIsLoading(true);
        const response = await DiveCenterService.getAll();
        setCenters(Array.isArray(response) ? response : response?.items || []);
      } catch (error) {
        console.error("Failed to load dive centers:", error);
        setCenters([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCenters();
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0"></div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Icon
              icon="mdi:map-marker-radius"
              className="text-cyan-500"
              width={20}
            />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Our Locations
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Find Our Dive Centers
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Visit us at any of our dive centers across Red Sea, conveniently
            located near your hotel for the easiest start to your underwater
            adventure.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : centers.length > 0 ? (
          <div className="relative max-w-7xl mx-auto">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              loop={centers.length > 3}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-locations",
              }}
              navigation={{
                nextEl: ".swiper-button-next-locations",
                prevEl: ".swiper-button-prev-locations",
              }}
              className="pb-16"
            >
              {centers.map((center) => (
                <SwiperSlide key={center.id}>
                  <LocationCard center={center} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-prev-locations absolute top-1/2 -left-4 lg:-left-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="mdi:chevron-left"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>
            <div className="swiper-button-next-locations absolute top-1/2 -right-4 lg:-right-16 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-xl cursor-pointer z-10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all duration-300 group">
              <Icon
                icon="mdi:chevron-right"
                className="h-6 w-6 text-cyan-600 group-hover:text-white"
              />
            </div>

            {/* Custom Pagination */}
            <div className="swiper-pagination-locations flex justify-center gap-2 mt-8"></div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

export default OurLocations;

"use client";

import DiveCenterService from "@/services/divecenterService";
import { getImageUrl } from "@/utils/imageUtils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

  return (
    <div className="group relative h-full">
      <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 flex flex-col">
        {/* Image */}
        <div className="h-56 relative overflow-hidden">
          <Image
            src={coverImage}
            alt={center.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Open/Closed badge */}
          <div className="absolute top-4 right-4 z-10">
            <OpenStatusBadge workingHours={center.working_hours} />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-1">
              {center.name}
            </h3>
            {center.hotel_name && (
              <p className="text-white/90 text-sm flex items-center gap-1.5 mt-1">
                <Icon icon="mdi:office-building-marker" width={16} />
                {center.hotel_name}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {center.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {center.description}
            </p>
          )}

          {/* Location */}
          {center.location && (
            <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
              <Icon
                icon="mdi:map-marker"
                className="text-cyan-500 flex-shrink-0 mt-0.5"
                width={18}
              />
              <span>{center.location}</span>
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-gray-100">
            {center.phone && (
              <a
                href={`tel:${center.phone}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-cyan-600 transition-colors"
              >
                <Icon icon="mdi:phone" className="text-cyan-500" width={18} />
                {center.phone}
              </a>
            )}
            {center.email && (
              <a
                href={`mailto:${center.email}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-cyan-600 transition-colors"
              >
                <Icon icon="mdi:email" className="text-cyan-500" width={18} />
                <span className="truncate">{center.email}</span>
              </a>
            )}
          </div>

          {/* Working hours */}
          {center.working_hours && (
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <Icon icon="mdi:clock-outline" width={16} />
                Working Hours
              </div>
              <WorkingHoursList workingHours={center.working_hours} />
            </div>
          )}
        </div>
      </div>
    </div>
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
            Visit us at any of our dive centers across Hurghada, conveniently
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {centers.map((center) => (
              <LocationCard key={center.id} center={center} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

export default OurLocations;

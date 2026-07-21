// Target path: app/divingcenter-locations/[id]/page.jsx
import VideoGallery from "@/components/ui/VideoGallery";
import DiveCenterService from "@/services/divecenterService";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- helpers ----------

function getOpenStatus(hours) {
  if (!hours) return false;
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const todaysHours = hours[today];
  if (!todaysHours || !todaysHours.is_open) return false;

  const [startHour, startMinute] = todaysHours.start.split(":").map(Number);
  const [endHour, endMinute] = todaysHours.end.split(":").map(Number);
  const now = new Date();
  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  return now >= start && now <= end;
}

function getMapsUrl(coordinates) {
  if (!coordinates) return null;
  const { latitude, longitude } = coordinates;
  if (!latitude && !longitude) return null;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function getMapsEmbedUrl(coordinates) {
  if (!coordinates) return null;
  const { latitude, longitude } = coordinates;
  if (!latitude && !longitude) return null;
  // Free, no-API-key embed.
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;
}

// ---------- presentational pieces ----------

function WorkingHoursDisplay({ hours }) {
  const days = Object.keys(hours);
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const isOpen = getOpenStatus(hours);

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <h4 className="font-semibold text-gray-800 flex items-center text-sm">
        <Icon icon="mdi:clock-outline" className="mr-2 h-4 w-4 text-cyan-600" />
        Working Hours
        <span
          className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
            isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isOpen ? "Open Now" : "Closed"}
        </span>
      </h4>
      <ul className="mt-3 text-sm text-gray-600 space-y-1.5">
        {days.map((day) => (
          <li
            key={day}
            className={`flex justify-between capitalize ${
              day === today ? "font-semibold text-gray-900" : ""
            }`}
          >
            <span>{day}</span>
            <span className={hours[day].is_open ? "" : "text-gray-400"}>
              {hours[day].is_open
                ? `${hours[day].start} - ${hours[day].end}`
                : "Closed"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- page ----------

export default async function DiveCenterPage({ params }) {
  const { id } = params;

  let center = null;
  try {
    center = await DiveCenterService.getById(id);
  } catch (error) {
    console.error("Failed to fetch dive center:", error);
    notFound();
  }

  if (!center) notFound();

  const hasImage = center.images && center.images.length > 0;
  const galleryImages = hasImage ? center.images.slice(1, 5) : [];
  const mapsUrl = getMapsUrl(center.coordinates);
  const mapsEmbedUrl = getMapsEmbedUrl(center.coordinates);

  // Model stores a single video key/URL (`video`), not a `videos` array —
  // adjust if VideoGallery expects a different shape.
  const videos = center.video ? [center.video] : [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 py-32 text-center text-white overflow-hidden">
        {hasImage && (
          <div className="absolute inset-0">
            <Image
              src={center.images[0]}
              alt={`Hero image of ${center.name}`}
              fill
              sizes="100vw"
              className="object-cover opacity-10"
              priority
            />
          </div>
        )}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-10">
            <div className="bg-white/20 p-6 rounded-2xl shadow-xl backdrop-blur-lg">
              <Icon
                icon="mdi:diving-scuba-flag"
                className="h-16 w-16 text-white"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            {center.name}
          </h1>
          {center.description && (
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl opacity-90">
              {center.description}
            </p>
          )}
          <div className="mt-8 flex justify-center flex-wrap gap-4">
            <Link
              href="/divingcenter-locations"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              View All Locations
            </Link>
            <a
              href={`https://wa.me/${center.phone}`}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              WhatsApp Us
            </a>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 border border-white/40 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Icon icon="mdi:map-marker-radius" className="h-5 w-5" />
                Get Directions
              </a>
            )}
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full text-gray-50"
          viewBox="0 0 1440 60"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* Main Content */}
      <main className="bg-gray-50 py-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images Gallery */}
            <div className="space-y-6">
              {hasImage ? (
                <>
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden ring-1 ring-gray-100">
                    <div className="relative h-96 w-full">
                      <Image
                        src={center.images[0]}
                        alt={`Main image of ${center.name}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {galleryImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative h-48 w-full rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-100"
                        >
                          <Image
                            src={image}
                            alt={`Gallery image ${index + 2} of ${center.name}`}
                            fill
                            sizes="25vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-96 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600">
                  <Icon
                    icon="mdi:image-off-outline"
                    className="h-12 w-12 text-white/60"
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Center Details
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Icon
                    icon="mdi:map-marker"
                    className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Location</h3>
                    <p className="text-gray-600">{center.location}</p>
                    {center.hotel_name && (
                      <p className="text-gray-500 text-sm mt-0.5">
                        {center.hotel_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Icon
                    icon="mdi:phone"
                    className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone</h3>
                    <a
                      href={`tel:${center.phone}`}
                      className="text-gray-600 hover:text-cyan-700"
                    >
                      {center.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Icon
                    icon="mdi:email"
                    className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <a
                      href={`mailto:${center.email}`}
                      className="text-gray-600 hover:text-cyan-700"
                    >
                      {center.email}
                    </a>
                  </div>
                </div>

                {mapsUrl && (
                  <div className="flex items-start">
                    <Icon
                      icon="mdi:map-marker-radius"
                      className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Directions
                      </h3>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-700 hover:text-cyan-900 font-medium"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                )}

                {center.services && center.services.length > 0 && (
                  <div className="flex items-start">
                    <Icon
                      icon="mdi:diving-scuba-tank"
                      className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">Services</h3>
                      <ul className="text-gray-600 space-y-1 mt-1">
                        {center.services.map((service, index) => (
                          <li key={index} className="flex items-center">
                            <Icon
                              icon="mdi:check-circle"
                              className="h-4 w-4 text-green-500 mr-2"
                            />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {center.working_hours && (
                  <WorkingHoursDisplay hours={center.working_hours} />
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Ready to Dive?
                </h3>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`tel:${center.phone}`}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <Icon icon="mdi:phone" className="mr-2 h-5 w-5" />
                    Call to Book
                  </a>
                  <a
                    href={`mailto:${center.email}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <Icon icon="mdi:email" className="mr-2 h-5 w-5" />
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          {mapsEmbedUrl && (
            <div className="mt-12 bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
              <div className="p-8 pb-0 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-blue-900">Find Us</h2>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
                >
                  Open in Google Maps
                  <Icon icon="mdi:arrow-top-right" className="h-4 w-4" />
                </a>
              </div>
              <div className="p-8">
                <iframe
                  src={mapsEmbedUrl}
                  className="w-full h-80 rounded-2xl border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map location of ${center.name}`}
                />
              </div>
            </div>
          )}

          {videos.length > 0 && <VideoGallery videos={videos} />}
        </section>
      </main>
    </>
  );
}

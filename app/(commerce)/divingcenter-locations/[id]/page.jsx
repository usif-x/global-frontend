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
  if (!hours) return { isOpen: false, today: null };
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const todaysHours = hours[today];
  if (!todaysHours || !todaysHours.is_open) return { isOpen: false, today };

  const [startHour, startMinute] = todaysHours.start.split(":").map(Number);
  const [endHour, endMinute] = todaysHours.end.split(":").map(Number);
  const now = new Date();
  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  return { isOpen: now >= start && now <= end, today };
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
  // Free, no-API-key embed — output=embed works without a Maps JS key.
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;
}

function formatCoords(coordinates) {
  const { latitude, longitude } = coordinates;
  const latDir = latitude >= 0 ? "N" : "S";
  const lngDir = longitude >= 0 ? "E" : "W";
  return `${Math.abs(latitude).toFixed(4)}°${latDir} ${Math.abs(longitude).toFixed(4)}°${lngDir}`;
}

// ---------- presentational pieces ----------

function Stamp({ open }) {
  const color = open ? "var(--teal)" : "var(--flag-red)";
  const label = open ? "Dive Ready" : "Closed";
  return (
    <div
      className="font-mono text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 border-2 -rotate-[4deg] select-none"
      style={{ color, borderColor: color }}
    >
      {label}
    </div>
  );
}

function ManifestTable({ hours, today }) {
  const days = Object.keys(hours);
  return (
    <table className="w-full text-sm font-mono">
      <tbody>
        {days.map((day) => (
          <tr
            key={day}
            className="border-t"
            style={{
              borderColor: "var(--paper-line)",
              color: day === today ? "var(--ink)" : "var(--ink-soft)",
              fontWeight: day === today ? 600 : 400,
            }}
          >
            <td className="py-2 uppercase tracking-wide">{day}</td>
            <td className="py-2 text-right">
              {hours[day].is_open
                ? `${hours[day].start} – ${hours[day].end}`
                : "Closed"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
  const { isOpen, today } = getOpenStatus(center.working_hours);
  const mapsUrl = getMapsUrl(center.coordinates);
  const mapsEmbedUrl = getMapsEmbedUrl(center.coordinates);

  // Model stores a single video key/URL (`video`), not a `videos` array —
  // adjust this line if VideoGallery expects a different shape.
  const videos = center.video ? [center.video] : [];

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap");

        :root {
          --paper: #edead9;
          --paper-line: #d6cfb4;
          --abyss: #0a1920;
          --teal: #0f6e76;
          --teal-bright: #1fa6a6;
          --flag-red: #b23b2e;
          --ink: #10202a;
          --ink-soft: #4b5a60;
          --white: #f7f5ec;
        }
        .font-display {
          font-family: "Space Grotesk", sans-serif;
        }
        .font-mono {
          font-family: "IBM Plex Mono", monospace;
        }
        .font-body {
          font-family: "Inter", sans-serif;
        }
      `}</style>

      {/* Hero */}
      <section
        className="relative overflow-hidden font-body"
        style={{ background: "var(--abyss)" }}
      >
        {hasImage && (
          <div className="absolute inset-0">
            <Image
              src={center.images[0]}
              alt={`Hero image of ${center.name}`}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-24 sm:py-32">
          <Link
            href="/divingcenter-locations"
            className="font-mono text-xs tracking-widest uppercase inline-flex items-center gap-2 hover:gap-3 transition-all"
            style={{ color: "var(--teal-bright)" }}
          >
            <Icon icon="mdi:arrow-left" className="h-3.5 w-3.5" />
            All Stations
          </Link>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <h1
              className="font-display text-4xl sm:text-6xl font-semibold tracking-tight"
              style={{ color: "var(--white)" }}
            >
              {center.name}
            </h1>
            <Stamp open={isOpen} />
          </div>

          {center.description && (
            <p
              className="mt-6 max-w-2xl text-base sm:text-lg"
              style={{ color: "rgba(247,245,236,0.7)" }}
            >
              {center.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${center.phone}`}
              className="font-mono text-sm font-semibold uppercase tracking-wide px-6 py-3 transition-colors"
              style={{ background: "var(--teal)", color: "var(--white)" }}
            >
              WhatsApp Us
            </a>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm font-semibold uppercase tracking-wide px-6 py-3 border transition-colors"
                style={{
                  borderColor: "var(--teal-bright)",
                  color: "var(--teal-bright)",
                }}
              >
                Plot Course
              </a>
            )}
          </div>
        </div>
      </section>

      <main
        className="py-20 sm:py-28 font-body"
        style={{ background: "var(--paper)" }}
      >
        <section className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              {hasImage && (
                <div
                  className="relative h-96 w-full border"
                  style={{ borderColor: "var(--paper-line)" }}
                >
                  <Image
                    src={center.images[0]}
                    alt={`Main image of ${center.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-40 w-full border"
                      style={{ borderColor: "var(--paper-line)" }}
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
              {!hasImage && (
                <div
                  className="flex h-96 w-full items-center justify-center border"
                  style={{
                    borderColor: "var(--paper-line)",
                    background: "var(--abyss)",
                  }}
                >
                  <Icon
                    icon="mdi:image-off-outline"
                    className="h-10 w-10"
                    style={{ color: "var(--teal-bright)" }}
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div
              className="border p-8"
              style={{
                borderColor: "var(--paper-line)",
                background: "#F7F4E9",
              }}
            >
              <h2
                className="font-display text-2xl font-semibold mb-6"
                style={{ color: "var(--ink)" }}
              >
                Station Details
              </h2>

              <div
                className="space-y-5 text-sm"
                style={{ color: "var(--ink-soft)" }}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    icon="mdi:map-marker"
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--teal)" }}
                  />
                  <div>
                    <p
                      className="font-mono text-xs uppercase tracking-wide"
                      style={{ color: "var(--ink)" }}
                    >
                      Location
                    </p>
                    <p className="mt-1">{center.location}</p>
                    {center.hotel_name && (
                      <p className="mt-0.5">{center.hotel_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon
                    icon="mdi:phone"
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--teal)" }}
                  />
                  <div>
                    <p
                      className="font-mono text-xs uppercase tracking-wide"
                      style={{ color: "var(--ink)" }}
                    >
                      Phone
                    </p>
                    <a
                      href={`tel:${center.phone}`}
                      className="mt-1 block font-mono hover:underline"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {center.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon
                    icon="mdi:email"
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--teal)" }}
                  />
                  <div>
                    <p
                      className="font-mono text-xs uppercase tracking-wide"
                      style={{ color: "var(--ink)" }}
                    >
                      Email
                    </p>
                    <a
                      href={`mailto:${center.email}`}
                      className="mt-1 block hover:underline"
                    >
                      {center.email}
                    </a>
                  </div>
                </div>
              </div>

              {center.working_hours && (
                <div
                  className="mt-8 pt-6 border-t"
                  style={{ borderColor: "var(--paper-line)" }}
                >
                  <p
                    className="font-mono text-xs uppercase tracking-wide mb-2"
                    style={{ color: "var(--ink)" }}
                  >
                    Shift Manifest
                  </p>
                  <ManifestTable hours={center.working_hours} today={today} />
                </div>
              )}
            </div>
          </div>

          {/* Chart / Location panel */}
          <div
            className="border"
            style={{ borderColor: "var(--paper-line)", background: "#F7F4E9" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 px-8 pt-8">
              <div>
                <p
                  className="font-mono text-xs uppercase tracking-wide"
                  style={{ color: "var(--ink)" }}
                >
                  Chart Position
                </p>
                <p
                  className="mt-1 font-mono text-lg"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {mapsUrl
                    ? formatCoords(center.coordinates)
                    : "Coordinates not logged"}
                </p>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold uppercase tracking-wide px-5 py-2.5 flex items-center gap-2"
                  style={{ background: "var(--teal)", color: "var(--white)" }}
                >
                  Open in Google Maps
                  <Icon icon="mdi:arrow-top-right" className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="p-8">
              {mapsEmbedUrl ? (
                <iframe
                  src={mapsEmbedUrl}
                  className="w-full h-80 border-0"
                  style={{ filter: "grayscale(0.15) contrast(1.05)" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map location of ${center.name}`}
                />
              ) : (
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  This station hasn't had its coordinates logged yet.
                </p>
              )}
            </div>
          </div>

          {videos.length > 0 && <VideoGallery videos={videos} />}
        </section>
      </main>
    </>
  );
}

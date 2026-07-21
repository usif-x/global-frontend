// Target path: app/divingcenter-locations/page.jsx
import DiveCenterService from "@/services/divecenterService";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Dive Centers | TopDivers",
  description:
    "Explore our dive centers in Hurghada — logged with coordinates, hours, and the fastest way to reach us for unforgettable Red Sea diving.",
  keywords:
    "diving, Hurghada, dive centers, Red Sea, scuba diving, dive locations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Our Dive Centers | TopDivers",
    description:
      "Explore our dive centers in Hurghada — your gateways to unforgettable Red Sea diving adventures.",
    images: [{ url: "/image/dive-center-hero.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Dive Centers | TopDivers",
    description:
      "Explore our dive centers in Hurghada — your gateways to unforgettable Red Sea diving adventures.",
  },
  icons: { icon: "/favicon.jpg" },
  alternates: { canonical: "https://topdivers.online/divingcenter-locations" },
};

export const viewport = { width: "device-width", initialScale: 1 };

// "Open now" depends on the real clock at request time — keep this route
// dynamic so the stamp never goes stale behind a cached page.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- helpers ----------

function getOpenStatus(hours) {
  if (!hours) return { isOpen: false };
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const todaysHours = hours[today];
  if (!todaysHours || !todaysHours.is_open) return { isOpen: false };

  const [startHour, startMinute] = todaysHours.start.split(":").map(Number);
  const [endHour, endMinute] = todaysHours.end.split(":").map(Number);
  const now = new Date();
  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  return { isOpen: now >= start && now <= end };
}

function getMapsUrl(coordinates) {
  if (!coordinates) return null;
  const { latitude, longitude } = coordinates;
  if (!latitude && !longitude) return null;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
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
      className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border-2 -rotate-[4deg] select-none"
      style={{ color, borderColor: color }}
    >
      {label}
    </div>
  );
}

function DiveCenterCard({ center, index }) {
  const { isOpen } = getOpenStatus(center.working_hours);
  const mapsUrl = getMapsUrl(center.coordinates);
  const hasImage = center.images && center.images.length > 0;

  return (
    <article
      className="relative border font-body transition-transform duration-300 hover:-translate-y-1"
      style={{ background: "#F7F4E9", borderColor: "var(--paper-line)" }}
    >
      <div className="flex items-start justify-between px-6 pt-6">
        <span
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--ink-soft)" }}
        >
          ENTRY — {String(index + 1).padStart(3, "0")}
        </span>
        <Stamp open={isOpen} />
      </div>

      <Link
        href={`/divingcenter-locations/${center.id}`}
        className="group block"
      >
        <div
          className="relative h-56 mt-4 mx-6 border overflow-hidden"
          style={{ borderColor: "var(--paper-line)" }}
        >
          {hasImage ? (
            <Image
              src={center.images[0]}
              alt={`View of the ${center.name} dive center`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "var(--abyss)" }}
            >
              <Icon
                icon="mdi:image-off-outline"
                className="h-8 w-8"
                style={{ color: "var(--teal-bright)" }}
              />
            </div>
          )}
        </div>

        <div className="px-6 pt-6">
          <h2
            className="font-display text-2xl sm:text-3xl font-semibold group-hover:underline"
            style={{ color: "var(--ink)" }}
          >
            {center.name}
          </h2>
          {center.description && (
            <p
              className="mt-3 text-sm leading-relaxed line-clamp-2"
              style={{ color: "var(--ink-soft)" }}
            >
              {center.description}
            </p>
          )}

          <div
            className="mt-5 space-y-2 text-sm"
            style={{ color: "var(--ink-soft)" }}
          >
            <div className="flex items-start gap-2">
              <Icon
                icon="mdi:map-marker"
                className="h-4 w-4 mt-0.5 flex-shrink-0"
                style={{ color: "var(--teal)" }}
              />
              <span>{center.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:phone"
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "var(--teal)" }}
              />
              <span className="font-mono">{center.phone}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <div
          className="mt-6 flex items-center justify-between border-t pt-4"
          style={{ borderColor: "var(--paper-line)" }}
        >
          <span
            className="font-mono text-xs"
            style={{ color: "var(--ink-soft)" }}
          >
            {mapsUrl
              ? formatCoords(center.coordinates)
              : "COORDINATES NOT LOGGED"}
          </span>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: "var(--teal)" }}
            >
              Plot Course
              <Icon icon="mdi:arrow-top-right" className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------- page ----------

export default async function LocationsPage() {
  let diveCenters = [];
  try {
    diveCenters = await DiveCenterService.getAll();
  } catch (error) {
    console.error("Failed to fetch dive centers:", error);
  }

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

      {/* Hero — instrument panel */}
      <section
        className="relative overflow-hidden font-body"
        style={{ background: "var(--abyss)" }}
      >
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.15]"
          preserveAspectRatio="none"
          viewBox="0 0 1200 500"
        >
          <path
            d="M0,80 C300,150 500,20 800,90 C1000,140 1100,60 1200,100"
            stroke="var(--teal-bright)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,180 C300,250 550,120 800,190 C1000,240 1100,160 1200,200"
            stroke="var(--teal-bright)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,280 C300,350 550,220 800,290 C1000,340 1100,260 1200,300"
            stroke="var(--teal-bright)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,380 C300,450 550,320 800,390 C1000,440 1100,360 1200,400"
            stroke="var(--teal-bright)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-28 sm:py-36">
          <p
            className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase"
            style={{ color: "var(--teal-bright)" }}
          >
            Red Sea · Hurghada, Egypt — 27.25°N 33.81°E
          </p>
          <h1
            className="font-display mt-6 text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight"
            style={{ color: "var(--white)" }}
          >
            Dive Center Log
          </h1>
          <p
            className="mt-6 max-w-2xl text-base sm:text-lg"
            style={{ color: "rgba(247,245,236,0.7)" }}
          >
            Every station below is a shore base for the water you're about to
            enter — logged with its coordinates, hours, and the fastest way to
            reach us.
          </p>
        </div>
      </section>

      <main
        className="py-20 sm:py-28 font-body"
        style={{ background: "var(--paper)" }}
      >
        <section className="max-w-6xl mx-auto px-6 sm:px-8">
          {diveCenters && diveCenters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {diveCenters.map((center, index) => (
                <DiveCenterCard key={center.id} center={center} index={index} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-24 border"
              style={{ borderColor: "var(--paper-line)" }}
            >
              <Icon
                icon="mdi:compass-off-outline"
                className="h-10 w-10 mx-auto"
                style={{ color: "var(--ink-soft)" }}
              />
              <h3
                className="font-display mt-5 text-xl font-semibold"
                style={{ color: "var(--ink)" }}
              >
                No Entries Logged
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                We couldn't find any dive centers yet. Check back soon.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

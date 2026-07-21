// Target path: app/divingcenter-locations/page.jsx
import DiveCenterService from "@/services/divecenterService";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Dive Center Locations | TopDivers",
  description:
    "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures with state-of-the-art facilities.",
  keywords:
    "diving, Hurghada, dive centers, Red Sea, scuba diving, dive locations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Our Dive Center Locations | TopDivers",
    description:
      "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures.",
    images: [{ url: "/image/dive-center-hero.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Dive Center Locations | TopDivers",
    description:
      "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures.",
  },
  icons: { icon: "/favicon.jpg" },
  alternates: { canonical: "https://topdivers.online/divingcenter-locations" },
};

export const viewport = { width: "device-width", initialScale: 1 };

// "Open now" depends on the real clock at request time — keep dynamic so
// the status never goes stale behind a cached page.
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

function DiveCenterCard({ center }) {
  const mapsUrl = getMapsUrl(center.coordinates);
  const hasImage = center.images && center.images.length > 0;

  return (
    <div className="group h-full">
      <div className="bg-white rounded-3xl shadow-lg ring-1 ring-gray-100 overflow-hidden transform transition-all duration-300 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1">
        <Link href={`/divingcenter-locations/${center.id}`} className="block">
          <div className="relative h-64 w-full overflow-hidden">
            {hasImage ? (
              <Image
                src={center.images[0]}
                alt={`View of the ${center.name} dive center`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600">
                <Icon
                  icon="mdi:image-off-outline"
                  className="h-10 w-10 text-white/60"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </Link>

        <div className="p-8 flex-grow flex flex-col">
          <Link href={`/divingcenter-locations/${center.id}`}>
            <h2 className="text-3xl font-bold text-blue-900 group-hover:text-cyan-700 transition-colors">
              {center.name}
            </h2>
          </Link>
          {center.description && (
            <p className="mt-3 text-gray-600 flex-grow line-clamp-3">
              {center.description}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <Icon
                icon="mdi:map-marker"
                className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
              />
              <span className="text-gray-700">{center.location}</span>
            </div>
            <div className="flex items-center">
              <Icon icon="mdi:phone" className="h-6 w-6 text-cyan-600 mr-3" />
              <a
                href={`tel:${center.phone}`}
                className="text-gray-700 hover:text-cyan-700"
              >
                {center.phone}
              </a>
            </div>
            <div className="flex items-center">
              <Icon icon="mdi:email" className="h-6 w-6 text-cyan-600 mr-3" />
              <a
                href={`mailto:${center.email}`}
                className="text-gray-700 hover:text-cyan-700"
              >
                {center.email}
              </a>
            </div>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900 transition-colors w-fit"
            >
              <Icon icon="mdi:map-marker-radius" className="h-5 w-5" />
              View on Google Maps
            </a>
          )}

          {center.working_hours && (
            <WorkingHoursDisplay hours={center.working_hours} />
          )}
        </div>
      </div>
    </div>
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
      <section className="relative bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 py-32 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/image/dive-center-hero.webp')] bg-cover bg-center opacity-10" />
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
            Our Dive Centers
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl opacity-90">
            Discover our world-class dive centers in Hurghada, offering
            unparalleled access to the Red Sea's vibrant marine life.
          </p>
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

      <main className="bg-gray-50 py-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {diveCenters && diveCenters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {diveCenters.map((center) => (
                <DiveCenterCard key={center.id} center={center} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon
                icon="mdi:compass-off-outline"
                className="h-16 w-16 mx-auto text-gray-400"
              />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800">
                No Dive Centers Found
              </h3>
              <p className="mt-2 text-gray-500">
                We couldn't find any locations at the moment. Please check back
                later!
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

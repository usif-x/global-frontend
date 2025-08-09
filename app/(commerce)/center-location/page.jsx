import DiveCenterService from "@/services/divecenterService"; // Make sure this path is correct
import { Icon } from "@iconify/react";
import Image from "next/image";

// Updated metadata to be more general
export const metadata = {
  title: "Our Dive Center Locations | Top Divers Hurghada",
  description:
    "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures with state-of-the-art facilities.",
  keywords:
    "diving, Hurghada, dive centers, Red Sea, scuba diving, dive locations",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Our Dive Center Locations | Top Divers Hurghada",
    description:
      "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures.",
    images: [{ url: "/image/dive-center-hero.webp" }], // A general hero image
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Dive Center Locations | Top Divers Hurghada",
    description:
      "Explore our premier dive centers in Hurghada. Your gateways to unforgettable Red Sea diving adventures.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://topdivers.online/locations",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Helper component to display working hours elegantly
const WorkingHoursDisplay = ({ hours }) => {
  const days = Object.keys(hours);
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const todaysHours = hours[today];

  const isOpenNow = () => {
    if (!todaysHours || !todaysHours.is_open) return false;
    const now = new Date();
    const [startHour, startMinute] = todaysHours.start.split(":").map(Number);
    const [endHour, endMinute] = todaysHours.end.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    return now >= startTime && now <= endTime;
  };

  const status = isOpenNow();

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <Icon icon="mdi:clock-outline" className="mr-2 h-5 w-5" />
        Working Hours
        <span
          className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
            status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status ? "Open Now" : "Closed"}
        </span>
      </h4>
      <ul className="mt-3 text-sm text-gray-600 space-y-1">
        {days.map((day) => (
          <li key={day} className="flex justify-between capitalize">
            <span>{day}</span>
            <span
              className={`font-medium ${
                hours[day].is_open ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {hours[day].is_open
                ? `${hours[day].start} - ${hours[day].end}`
                : "Closed"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default async function LocationsPage() {
  let diveCenters = [];
  try {
    // Fetch data from the service on the server
    diveCenters = await DiveCenterService.getAll();
    console.log(diveCenters);
  } catch (error) {
    console.error("Failed to fetch dive centers:", error);
    // You can render an error message component here if you wish
  }

  // Helper to create URL-friendly slugs from names
  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <>
      <section className="relative bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 py-32 text-center text-white">
        <div className="absolute inset-0 bg-[url('/image/dive-center-hero.webp')] bg-cover bg-center opacity-10"></div>
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
            unparalleled access to the Red Sea’s vibrant marine life.
          </p>
        </div>
      </section>

      <main className="bg-gray-50 py-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {diveCenters && diveCenters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {diveCenters.map((center) => (
                <div
                  key={center.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={center.images[0]}
                      alt={`View of the ${center.name} dive center`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h2 className="text-3xl font-bold text-blue-900">
                      {center.name}
                    </h2>
                    <p className="mt-3 text-gray-600 flex-grow">
                      {center.description}
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start">
                        <Icon
                          icon="mdi:map-marker"
                          className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                        />
                        <span className="text-gray-700">{center.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          icon="mdi:phone"
                          className="h-6 w-6 text-cyan-600 mr-3"
                        />
                        <a
                          href={`tel:${center.phone}`}
                          className="text-gray-700 hover:text-cyan-700"
                        >
                          {center.phone}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          icon="mdi:email"
                          className="h-6 w-6 text-cyan-600 mr-3"
                        />
                        <a
                          href={`mailto:${center.email}`}
                          className="text-gray-700 hover:text-cyan-700"
                        >
                          {center.email}
                        </a>
                      </div>
                    </div>

                    {center.working_hours && (
                      <WorkingHoursDisplay hours={center.working_hours} />
                    )}
                  </div>
                </div>
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

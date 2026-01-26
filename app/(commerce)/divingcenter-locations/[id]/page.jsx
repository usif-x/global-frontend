import VideoGallery from "@/components/ui/VideoGallery";
import DiveCenterService from "@/services/divecenterService";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function DiveCenterPage({ params }) {
  const { id } = params;

  let center = null;
  try {
    center = await DiveCenterService.getById(id);
  } catch (error) {
    console.error("Failed to fetch dive center:", error);
    notFound();
  }

  if (!center) {
    notFound();
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 py-32 text-center text-white">
        {center.images && center.images.length > 0 && (
          <div className="absolute inset-0">
            <Image
              src={center.images[0]}
              alt={`Hero image of ${center.name}`}
              layout="fill"
              objectFit="cover"
              className="opacity-10"
            />
          </div>
        )}
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
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl opacity-90">
            {center.description}
          </p>
          <div className="mt-8 flex justify-center space-x-4">
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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-gray-50 py-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images Gallery */}
            <div className="space-y-6">
              {center.images && center.images.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="relative h-96 w-full">
                    <Image
                      src={center.images[0]}
                      alt={`Main image of ${center.name}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              )}
              {center.images && center.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {center.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative h-48 w-full">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 2} of ${center.name}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
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

                {center.services && center.services.length > 0 && (
                  <div className="flex items-start">
                    <Icon
                      icon="mdi:diving-scuba-tank"
                      className="h-6 w-6 text-cyan-600 mr-3 flex-shrink-0 mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">Services</h3>
                      <ul className="text-gray-600 space-y-1">
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

              <div className="mt-8 pt-6 border-t border-gray-200">
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
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <Icon icon="mdi:email" className="mr-2 h-5 w-5" />
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>

          <VideoGallery videos={center.videos} />
        </section>
      </main>
    </>
  );
}

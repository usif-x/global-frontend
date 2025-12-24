import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import WavesArea from "../ui/Wave";
import PackageTripClientWrapper from "./PackageTripWrapper";

// Error State Component
const ErrorState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center p-8 max-w-md">
      <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Icon icon="lucide:waves" className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Unable to Load Content
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        We're having trouble connecting to our servers. Please check your
        internet connection and try again.
      </p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="relative overflow-hidden bg-sky-500 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <WavesArea backgroundColor="#20A7DB">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Trips
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            If diving has always been your dream, then you are in the right
            place! We will help your dreams come true by opening the wonderful
            underwater world!
          </p>
        </div>
      </WavesArea>
      <div
        className="absolute bottom-0 left-0 right-0 h-16 bg-white"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      ></div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <div className="bg-sky-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <Icon icon="lucide:package" className="w-12 h-12 text-sky-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          No Trips or Packages Available
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          We're currently preparing exciting new diving adventures and Trip
          packages for you. Please check back soon for amazing underwater
          experiences!
        </p>
      </div>
    </div>
  </div>
);

// Main Server Component
const PackageTripDisplay = async () => {
  let packages = [];
  let trips = [];
  let error = null;

  try {
    // Fetch both packages and trips using server-axios
    const [packagesData, tripsData] = await Promise.all([
      getData("/packages/"),
      getData("/trips/"),
    ]);

    packages = packagesData || [];
    trips = tripsData || [];
  } catch (err) {
    error = err.message || "Failed to fetch data";
    console.error("Error fetching data:", err);
  }

  // Error State
  if (error) {
    return <ErrorState />;
  }

  // Empty State
  if (packages.length === 0 && trips.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden bg-sky-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <WavesArea backgroundColor="#20A7DB">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Trips & Packages
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Whether it's beneath the waves or above the sea, we've got you
              covered! Dive, ride, or fly—your perfect adventure is waiting.
            </p>
          </div>
        </WavesArea>
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        ></div>
      </div>

      {/* Client-side wrapper for interactive functionality */}
      <PackageTripClientWrapper
        initialPackages={packages}
        initialTrips={trips}
      />
    </div>
  );
};

export default PackageTripDisplay;

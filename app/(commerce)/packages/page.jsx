// app/(commerce)/packages/page.jsx

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
// ✅ Correct Import: Use the server-safe axios helper for server components
import { getData } from "@/lib/server-axios";

const PackagesPage = async () => {
  let packages = []; // Default to an empty array

  try {
    // This now receives the actual array, because we fixed getData to return `res.data`
    const data = await getData("/packages");

    // ✅ Robustness Check: Ensure the received data is an array before using it.
    if (Array.isArray(data)) {
      packages = data;
    } else {
      // This helps you debug if the API ever returns something other than an array
      console.error(
        "API did not return an array for /packages. Received:",
        data
      );
    }
  } catch (err) {
    console.error("Failed to fetch packages:", err.message);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="mdi:alert-circle-outline"
              className="w-10 h-10 text-red-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Packages
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't retrieve our packages at the moment. Please try again
            later.
          </p>
          <Link
            href="/"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-600/30" />
        <div className="absolute inset-0 opacity-10">
          <Icon
            icon="mdi:waves"
            className="w-96 h-96 text-white/20 absolute top-10 -right-20 rotate-12"
          />
          <Icon
            icon="mdi:anchor"
            className="w-32 h-32 text-white/10 absolute bottom-20 left-10 -rotate-12"
          />
          <Icon
            icon="mdi:compass-outline"
            className="w-24 h-24 text-white/10 absolute top-32 left-1/4 rotate-45"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
            <Icon icon="mdi:package-variant" className="w-4 h-4 inline mr-2" />
            Travel Packages
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Packages
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Explore our curated collection of diving and adventure packages.
          </p>
          <div className="flex items-center justify-center mt-8 text-white/90">
            <Icon icon="mdi:map-marker" className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {packages.length} Packages Available
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="mdi:package-variant-remove"
              className="w-16 h-16 text-orange-400 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Packages Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're currently updating our offerings. Please check back soon!
            </p>
            <Link
              href="/"
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Adventure Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from {packages.length} packages tailored for your next
                unforgettable experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <Link
                  href={`/packages/${pkg.id}`}
                  key={pkg.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative h-64">
                    {pkg.images?.[0] ? (
                      <Image
                        src={pkg.images[0]}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                        <Icon
                          icon="mdi:package-variant"
                          className="w-16 h-16 text-white/50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-semibold">
                        Package
                      </span>
                      <span className="flex items-center text-yellow-500">
                        <Icon
                          icon="mdi:star"
                          className="w-4 h-4 fill-current"
                        />
                        <span className="ml-1 text-gray-600 text-sm">4.9</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 flex-grow">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {pkg.description}
                    </p>
                    <div className="mt-auto text-sky-600 group-hover:text-sky-700 font-semibold text-sm flex items-center gap-1 transition-colors">
                      View Details{" "}
                      <Icon
                        icon="mdi:arrow-right"
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;

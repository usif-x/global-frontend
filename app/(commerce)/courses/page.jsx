// app/courses/page.js

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
// ✅ Use the server-safe axios helper for server-side fetching
import { getData } from "@/lib/server-axios";

export const metadata = {
  title: "Diving Courses",
  description: "Diving Courses",
  keywords: ["diving", "courses", "certifications"],
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Global Divers Hurghada - Diving Courses",
    description: "Global Divers Hurghada - Diving Courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Divers Hurghada - Diving Courses",
    description: "Global Divers Hurghada - Diving Courses",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.globaldivershurghada.com/courses",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  category: "education",
};

// --- Helper Functions (Updated for Course Data) ---

// ✅ IMPROVED: Handles a price of 0 gracefully.
const formatPrice = (price) => {
  if (price === 0) return "Inquire for Price";
  if (price == null) return "N/A";
  return `€${Math.round(price)}`;
};

// ✅ IMPROVED: Assumes the duration unit is hours, which is more likely for courses.
const formatDuration = (duration) => {
  if (!duration) return "Duration TBD";
  return `${duration} hour${duration !== 1 ? "s" : ""}`;
};

// --- Main Server Component ---
const CoursesPage = async () => {
  let courses = [];

  try {
    const data = await getData("/courses");
    if (Array.isArray(data)) {
      courses = data;
    } else {
      console.error(
        "API endpoint /courses did not return an array. Received:",
        data
      );
    }
  } catch (err) {
    console.error("Failed to fetch courses:", err.message);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="lucide:alert-circle"
              className="w-10 h-10 text-red-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Courses
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't retrieve our courses at the moment. Please check back
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
      {/* --- Hero Section --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-10">
          <Icon
            icon="lucide:book-open-check"
            className="w-96 h-96 text-white/20 absolute top-10 -right-20 rotate-12"
          />
          <Icon
            icon="lucide:graduation-cap"
            className="w-32 h-32 text-white/10 absolute bottom-20 left-10 -rotate-12"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
            <Icon
              icon="lucide:graduation-cap"
              className="w-4 h-4 inline mr-2"
            />
            Diving Certifications
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Diving Courses
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            From beginner to pro, start your underwater journey with our
            certified courses.
          </p>
          <div className="flex items-center justify-center mt-8 text-white/90">
            <Icon icon="lucide:book-marked" className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {courses.length} Course{courses.length !== 1 ? "s" : ""} Available
            </span>
          </div>
        </div>
      </div>

      {/* --- Courses Grid --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="lucide:search-x"
              className="w-16 h-16 text-orange-400 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Courses Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're currently planning our next schedule. Please check back
              soon!
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
                All Available Courses
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select a course below to see more details and start your
                certification process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  href={`/courses/${course.id}`}
                  key={course.id}
                  className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative h-56">
                    {course.images?.[0] ? (
                      <Image
                        src={course.images[0]}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <Icon
                          icon="lucide:graduation-cap"
                          className="w-16 h-16 text-white/50"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      {/* ✅ CHANGED: Using course_level from your API data */}
                      {course.course_level && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                          {course.course_level}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="lucide:clock"
                          className="w-4 h-4 text-gray-400"
                        />
                        {/* ✅ CHANGED: Using course_duration from your API data */}
                        <span>{formatDuration(course.course_duration)}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)}
                      </div>
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

export default CoursesPage;

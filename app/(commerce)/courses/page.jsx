// app/courses/page.js

import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 86400;

export const metadata = {
  title: "Diving Courses",
  description: "Diving Courses",
  keywords: ["diving", "courses", "certifications"],
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "TopDivers - Diving Courses",
    description: "TopDivers - Diving Courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "TopDivers - Diving Courses",
    description: "TopDivers - Diving Courses",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/courses",
  },
  category: "education",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// --- Helper Functions ---

const formatPrice = (courseData) => {
  if (!courseData.price_available) return "Inquire for Price";
  if (courseData.price === 0) return "Free";
  if (courseData.price == null) return "N/A";

  const basePrice = courseData.price;

  if (courseData.has_discount && courseData.discount_always_available) {
    const discountedPrice =
      basePrice * (1 - courseData.discount_percentage / 100);
    return {
      original: `EGP ${Math.round(basePrice)}`,
      discounted: `EGP ${Math.round(discountedPrice)}`,
      discount: courseData.discount_percentage,
    };
  }

  return `EGP ${Math.round(basePrice)}`;
};

const getCourseTypeIcon = (courseType) => {
  switch (courseType?.toLowerCase()) {
    case "online":
      return "lucide:monitor";
    case "in-person":
    case "offline":
      return "lucide:users";
    case "hybrid":
      return "lucide:globe";
    default:
      return "lucide:book";
  }
};

const getCertificateIcon = (certificateType) => {
  switch (certificateType?.toLowerCase()) {
    case "professional":
      return "lucide:award";
    case "completion":
      return "lucide:check-circle";
    case "accredited":
      return "lucide:shield-check";
    default:
      return "lucide:certificate";
  }
};

// --- Main Server Component ---
const CoursesPage = async () => {
  let courses = [];

  try {
    const data = await getData("/courses/");
    if (Array.isArray(data)) {
      courses = data;
    } else {
      console.error(
        "API endpoint /courses did not return an array. Received:",
        data,
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
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/image/hero-pattern.png')] opacity-10" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
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
          <div className="bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 mb-6 mt-6">
            <Icon icon="lucide:graduation-cap" className="w-4 h-4" />
            Diving Certifications
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Our Diving Courses
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
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

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50/40 to-transparent" />
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
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                All Available Courses
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select a course below to see more details and start your
                certification process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {courses.map((course) => {
                const priceDisplay = formatPrice(course);

                return (
                  <Link
                    href={`/courses/${course.id}`}
                    key={course.id}
                    className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-blue-200/60 ring-1 ring-gray-100 transition-all duration-300 overflow-hidden hover:-translate-y-1.5"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 bg-gray-100">
                      {course.images?.[0] ? (
                        <Image
                          src={course.images[0]}
                          alt={course.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Course Level Badge */}
                      <div className="absolute top-4 left-4">
                        {course.course_level && (
                          <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm">
                            {course.course_level}
                          </span>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {course.has_discount &&
                        course.discount_always_available && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                              -{course.discount_percentage}%
                            </span>
                          </div>
                        )}

                      {/* Course Type Icon */}
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                          <Icon
                            icon={getCourseTypeIcon(course.course_type)}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h3>

                      {/* Provider */}
                      {course.provider && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Icon
                            icon="lucide:building"
                            className="w-4 h-4 mr-2 text-gray-400"
                          />
                          <span>{course.provider}</span>
                        </div>
                      )}

                      {/* Course Description */}
                      <div className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        <MarkdownRenderer content={course.description} />
                      </div>

                      {/* Course Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.has_certificate && (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <Icon
                              icon={getCertificateIcon(course.certificate_type)}
                              className="w-3 h-3 mr-1"
                            />
                            <span>Certificate</span>
                          </div>
                        )}
                        {course.has_online_content && (
                          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            <Icon icon="lucide:wifi" className="w-3 h-3 mr-1" />
                            <span>Online Content</span>
                          </div>
                        )}
                        {course.course_type && (
                          <div className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                            <Icon
                              icon={getCourseTypeIcon(course.course_type)}
                              className="w-3 h-3 mr-1"
                            />
                            <span>{course.course_type}</span>
                          </div>
                        )}
                      </div>

                      {/* Group Discount Info */}
                      {course.has_discount &&
                        course.discount_requires_min_people && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center text-orange-700 text-xs">
                              <Icon
                                icon="lucide:users"
                                className="w-4 h-4 mr-2"
                              />
                              <span className="font-medium">
                                {course.discount_percentage}% off for{" "}
                                {course.discount_min_people}+ people
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Duration and Price */}
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4 mt-auto gap-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Icon
                            icon="lucide:clock"
                            className="w-4 h-4 text-gray-400 shrink-0"
                          />
                          <span>
                            {course.course_duration}{" "}
                            {course.course_duration_unit}
                          </span>
                        </div>

                        <div className="text-right">
                          {typeof priceDisplay === "object" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-xs line-through text-gray-400">
                                {priceDisplay.original}
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                {priceDisplay.discounted}
                              </span>
                              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-medium">
                                -{priceDisplay.discount}%
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`text-lg font-bold ${
                                !course.price_available
                                  ? "text-orange-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {priceDisplay}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-blue-600 group-hover:text-blue-700 font-medium text-sm transition-colors">
                          {course.price_available ? (
                            <>
                              <Icon
                                icon="lucide:credit-card"
                                className="w-4 h-4"
                              />
                              <span>Enroll Now</span>
                            </>
                          ) : (
                            <>
                              <Icon icon="lucide:mail" className="w-4 h-4" />
                              <span>Request Info</span>
                            </>
                          )}
                          <Icon
                            icon="lucide:arrow-right"
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;

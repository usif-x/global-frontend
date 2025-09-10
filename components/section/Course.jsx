"use client";
import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import Link from "next/link";
import MarkdownRenderer from "../ui/MarkdownRender";
import { useEffect, useState } from "react";

// --- Reusable UI Components ---
const ErrorMessage = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div
      className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md"
      role="alert"
    >
      <h2 className="text-red-600 text-lg font-medium">
        Error loading courses
      </h2>
      <p className="text-red-500 mt-2">{error}</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center p-8 max-w-md">
      <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Icon
          icon="line-md:coffee-half-empty-filled-loop"
          className="text-blue-600 w-12 h-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        No Courses Available
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        We're currently updating our course offerings. Please check back soon
        for exciting new diving adventures!
      </p>
    </div>
  </div>
);

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
      original: basePrice,
      discounted: Math.round(discountedPrice),
      discount: courseData.discount_percentage,
    };
  }

  return `EGP${Math.round(basePrice)}`;
};

const formatDuration = (hours) => {
  if (typeof hours !== "number" || hours <= 0) return "N/A";
  if (hours === 1) return "1 Hour";
  if (hours < 24) return `${hours} Hours`;
  const days = Math.round(hours / 8); // Assuming 8-hour days
  return days === 1 ? "1 Day" : `${days} Days`;
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

const levelConfig = {
  beginner: { value: 1, color: "text-green-600", bgColor: "bg-green-100" },
  intermediate: { value: 2, color: "text-sky-600", bgColor: "bg-sky-100" },
  advanced: { value: 3, color: "text-orange-600", bgColor: "bg-orange-100" },
  professional: {
    value: 4,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
};
const TOTAL_LEVEL_STEPS = 4;

const LevelIndicator = ({ level = "beginner" }) => {
  const normalizedLevel = level.toLowerCase();
  const {
    value: activeSteps,
    color,
    bgColor,
  } = levelConfig[normalizedLevel] || levelConfig["beginner"];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-600">Difficulty</h4>
        <span className={`text-sm font-bold ${color} capitalize`}>{level}</span>
      </div>
      <div className="flex gap-1.5" title={`Level: ${level}`}>
        {Array.from({ length: TOTAL_LEVEL_STEPS }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full flex-1 transition-colors ${
              index < activeSteps ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Waves icon component
const Waves = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L13.24 8.1C12.45 8.9 12.45 10.15 13.24 10.95L14.83 12.54L16.24 11.13L14.65 9.54L17.58 6.61L20.25 9.28L21 9ZM1 9L2.5 7.5L5.17 10.17L8.1 7.24C8.9 6.45 10.15 6.45 10.95 7.24L12.54 8.83L11.13 10.24L9.54 8.65L6.61 11.58L9.28 14.25L7.5 16.5L1 9Z" />
  </svg>
);

// --- Enhanced CourseCard Component ---
const CourseCard = ({ course }) => {
  const imageUrl = course.images?.[0];
  const showImage = !!imageUrl;
  const priceDisplay = formatPrice(course);

  return (
    <Link href={`/courses/${course.id}`}>
      <div
        className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg border border-transparent 
                   hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-2xl
                   transition-all duration-300 ease-in-out will-change-transform h-full"
      >
        {/* --- Image Section --- */}
        <div className="h-56 relative overflow-hidden">
          {showImage ? (
            <img
              src={imageUrl}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center text-center p-4">
              <Waves className="w-12 h-12 text-white/50" />
              <h4 className="mt-3 font-bold text-white tracking-tight">
                {course.name}
              </h4>
              <p className="text-sm text-white/70 capitalize">
                {course.course_level}
              </p>
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Course Level Badge */}
          <div className="absolute top-4 left-4 z-10">
            {course.course_level && (
              <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                {course.course_level}
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {course.has_discount && course.discount_always_available && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                -{course.discount_percentage}% OFF
              </span>
            </div>
          )}

          {/* Provider Badge */}
          {course.provider && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">
                  {course.provider}
                </span>
              </div>
            </div>
          )}

          {/* Course Type Icon */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <Icon
                icon={getCourseTypeIcon(course.course_type)}
                className="w-5 h-5 text-white"
              />
            </div>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="p-6 flex flex-col flex-1">
          {/* Course Title and Price */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex-1 pr-4 group-hover:text-blue-600 transition-colors">
              {course.name}
            </h3>
            <div className="text-right">
              {typeof priceDisplay === "object" ? (
                <div className="flex flex-col items-end">
                  <span className="text-sm line-through text-gray-400">
                    EGP{priceDisplay.original}
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    EGP{priceDisplay.discounted}
                  </span>
                </div>
              ) : (
                <span
                  className={`text-xl font-bold ${
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

          {/* Level Indicator */}
          <LevelIndicator level={course.course_level} />

          {/* Course Features Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.has_certificate && (
              <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                <Icon
                  icon={getCertificateIcon(course.certificate_type)}
                  className="w-3 h-3 mr-1"
                />
                <span>Certificate</span>
              </div>
            )}
            {course.has_online_content && (
              <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                <Icon icon="lucide:wifi" className="w-3 h-3 mr-1" />
                <span>Online</span>
              </div>
            )}
            {course.course_type && (
              <div className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs capitalize">
                <Icon
                  icon={getCourseTypeIcon(course.course_type)}
                  className="w-3 h-3 mr-1"
                />
                <span>{course.course_type}</span>
              </div>
            )}
          </div>

          <hr className="my-3 border-gray-100" />

          {/* Course Stats */}
          <div className="flex items-center justify-around text-sm text-gray-600 py-3 mb-4">
            <div className="flex flex-col items-center space-y-1">
              <Icon icon="lucide:clock" className="w-5 h-5 text-gray-400" />
              <span className="font-medium">
                {formatDuration(course.course_duration)}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Icon icon="lucide:users" className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Group Class</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Icon
                icon="hugeicons:package"
                className="w-5 h-5 text-gray-400"
              />
              <span className="font-medium">Equipment</span>
            </div>
          </div>

          {/* Course Description */}
          <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
            <MarkdownRenderer content={course.description} />
          </div>

          {/* Group Discount Info */}
          {course.has_discount && course.discount_requires_min_people && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-orange-700 text-xs">
                <Icon icon="lucide:users" className="w-4 h-4 mr-2" />
                <span className="font-medium">
                  {course.discount_percentage}% off for{" "}
                  {course.discount_min_people}+ people
                </span>
              </div>
            </div>
          )}

          {/* Call to Action Button */}
          <div className="mt-auto">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl 
                               flex items-center justify-center space-x-2
                               transition-all duration-300 group-hover:bg-blue-700 group-hover:shadow-lg"
            >
              {course.price_available ? (
                <>
                  <Icon icon="lucide:credit-card" className="w-5 h-5" />
                  <span>Book Now</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:mail" className="w-5 h-5" />
                  <span>Inquire</span>
                </>
              )}
              <Icon
                icon="fluent:arrow-right-12-filled"
                className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
              />
            </button>
          </div>

          {/* Additional Course Info */}
          {(course.certificate_type || course.contents?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {course.certificate_type && (
                  <div className="flex items-center">
                    <Icon icon="lucide:award" className="w-3 h-3 mr-1" />
                    <span className="capitalize">
                      {course.certificate_type} Cert
                    </span>
                  </div>
                )}
                {course.contents?.length > 0 && (
                  <div className="flex items-center">
                    <Icon icon="lucide:book-open" className="w-3 h-3 mr-1" />
                    <span>
                      {course.contents.length} Module
                      {course.contents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// --- Featured Course Card (for highlighting special courses) ---
const FeaturedCourseCard = ({ course }) => {
  const imageUrl = course.images?.[0];
  const priceDisplay = formatPrice(course);

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="group relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white">
        {/* Background Image Overlay */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-30">
            <img
              src={imageUrl}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">
                ⭐ FEATURED COURSE
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-200 transition-colors">
                {course.name}
              </h3>
              <p className="text-blue-100 text-sm capitalize mb-4">
                {course.course_level} • {course.provider}
              </p>
            </div>

            {/* Price Display */}
            <div className="text-right">
              {typeof priceDisplay === "object" ? (
                <div>
                  <span className="text-lg line-through text-white/60">
                    EGP{priceDisplay.original}
                  </span>
                  <div className="text-2xl font-bold text-green-300">
                    EGP{priceDisplay.discounted}
                  </div>
                  <span className="text-xs bg-red-500 px-2 py-1 rounded-full">
                    -{priceDisplay.discount}% OFF
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">
                  {priceDisplay}
                </div>
              )}
            </div>
          </div>

          {/* Course Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
              <Icon icon="lucide:clock" className="w-3 h-3 mr-1" />
              <span>{formatDuration(course.course_duration)}</span>
            </div>
            {course.has_certificate && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                <Icon
                  icon={getCertificateIcon(course.certificate_type)}
                  className="w-3 h-3 mr-1"
                />
                <span>Certificate</span>
              </div>
            )}
            {course.has_online_content && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                <Icon icon="lucide:wifi" className="w-3 h-3 mr-1" />
                <span>Online Content</span>
              </div>
            )}
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs capitalize">
              <Icon
                icon={getCourseTypeIcon(course.course_type)}
                className="w-3 h-3 mr-1"
              />
              <span>{course.course_type}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
            {course.price_available ? (
              <>
                <Icon icon="lucide:credit-card" className="w-5 h-5" />
                <span>Enroll Now</span>
              </>
            ) : (
              <>
                <Icon icon="lucide:mail" className="w-5 h-5" />
                <span>Get Pricing</span>
              </>
            )}
            <Icon
              icon="lucide:arrow-right"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Main Server Component ---
const DivingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getData("/courses");
        setCourses(data);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  if (error) return <ErrorMessage error={error} />;
  if (!courses || courses.length === 0) return <EmptyState />;

  // Separate featured courses (you can modify this logic based on your needs)
  const featuredCourses = courses
    .filter((course) => course.has_discount && course.discount_always_available)
    .slice(0, 2);

  const regularCourses = courses.filter(
    (course) => !featuredCourses.includes(course)
  );

  const visibleCourses = showAll ? regularCourses : regularCourses.slice(0, 2);

  return (
    <main id="booking" className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
            <Icon
              icon="lucide:graduation-cap"
              className="w-4 h-4 inline mr-2"
            />
            Professional Diving Certifications
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Explore Our Diving Courses
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From your first breath underwater to becoming a Divemaster, we offer
            professional courses for every step of your diving adventure.
          </p>
          <div className="flex items-center justify-center mt-8 text-gray-600">
            <Icon icon="lucide:book-marked" className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {courses.length} Course{courses.length !== 1 ? "s" : ""} Available
            </span>
          </div>
        </section>

        {/* Featured Courses Section */}
        {featuredCourses.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ⭐ Featured Courses
              </h2>
              <p className="text-gray-600">
                Special offers and popular courses with exclusive benefits
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {featuredCourses.map((course) => (
                <FeaturedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* All Courses Section */}
        <section className="relative">
          {featuredCourses.length > 0 && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                All Available Courses
              </h2>
              <p className="text-gray-600">
                Complete range of diving certifications and specialties
              </p>
            </div>
          )}

          <div
            className={`relative transition-all duration-500 ${
              !showAll && regularCourses.length > 2
                ? "max-h-[80rem] overflow-hidden"
                : ""
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          {!showAll && regularCourses.length > 2 && (
  <div className="relative mt-12">
    {/* Subtle fade overlay */}
    <div className="absolute -top-8 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/70 to-transparent pointer-events-none z-10" />
    
    {/* Compact show more container */}
    <div className="relative z-20 text-center">
      <div className="inline-flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 mb-4">
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <Icon icon="lucide:layers" className="w-4 h-4" />
          <span>{visibleCourses.length} of {regularCourses.length} courses shown</span>
        </div>
      </div>
      
      <Link
        href={"/courses"}
        className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 space-x-3"
      >
        <Icon 
          icon="lucide:plus-circle" 
          className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
        />
        <span>Show {regularCourses.length - visibleCourses.length} More Courses</span>
        <Icon 
          icon="lucide:arrow-right" 
          className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
        />
      </Link>
      
      {/* Quick stats */}
      <div className="mt-4 text-sm text-gray-500">
        <span>✨ All courses include certification and equipment</span>
      </div>
    </div>
  </div>
)}
        </section>
      </div>
    </main>
  );
};

export default DivingCourses;

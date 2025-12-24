"use client";
import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MarkdownRenderer from "../ui/MarkdownRender";

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
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-200 group">
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
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-col items-center justify-center text-center p-4">
              <Icon
                icon="mdi:diving-scuba-tank"
                className="w-16 h-16 text-white/50 mb-3"
              />
              <h4 className="font-bold text-white text-lg">{course.name}</h4>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Course Level Badge */}
          {course.course_level && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-cyan-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                {course.course_level}
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {course.has_discount && course.discount_always_available && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                -{course.discount_percentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* --- Content Section --- */}
        <div className="p-6 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-cyan-600 transition-colors">
            {course.name}
          </h3>

          {/* Price */}
          <div className="mb-4">
            {typeof priceDisplay === "object" ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through text-gray-400">
                  EGP{priceDisplay.original}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  EGP{priceDisplay.discounted}
                </span>
              </div>
            ) : (
              <span
                className={`text-2xl font-bold ${
                  !course.price_available ? "text-orange-600" : "text-cyan-600"
                }`}
              >
                {priceDisplay}
              </span>
            )}
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <Icon
                icon="mdi:clock-outline"
                className="w-4 h-4 text-gray-400"
              />
              <span>
                {course.course_duration} {course.course_duration_unit}
              </span>
            </div>
            {course.has_certificate && (
              <div className="flex items-center gap-1">
                <Icon
                  icon="mdi:certificate"
                  className="w-4 h-4 text-gray-400"
                />
                <span>Certificate</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
            <MarkdownRenderer content={course.description} />
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
            {course.price_available ? (
              <>
                <Icon icon="mdi:book-check" className="w-5 h-5" />
                <span>Enroll Now</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:email-outline" className="w-5 h-5" />
                <span>Inquire</span>
              </>
            )}
          </button>
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
        const data = await getData("/courses/");
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

  const visibleCourses = showAll ? regularCourses : regularCourses.slice(0, 3);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Icon
              icon="mdi:diving-scuba-tank"
              className="text-blue-500"
              width={20}
            />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Diving Courses
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Start Your Diving Journey
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            From beginner to professional, explore our range of PADI-certified
            diving courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {visibleCourses.map((course, index) => (
            <div
              key={course.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {!showAll && regularCourses.length > 3 && (
          <div className="mt-16 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Icon icon="mdi:diving" width={24} />
              <span>View All Courses</span>
              <Icon icon="mdi:arrow-right" width={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default DivingCourses;

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
                  EGP {priceDisplay.original}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  EGP {priceDisplay.discounted}
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
    (course) => !featuredCourses.includes(course),
  );

  const visibleCourses = showAll ? regularCourses : regularCourses.slice(0, 3);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradient Mesh */}
      <div className="absolute inset-0"></div>

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

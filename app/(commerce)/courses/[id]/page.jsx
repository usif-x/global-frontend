// app/courses/[id]/page.js

import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const formatPrice = (courseData) => {
  if (!courseData.price_available) return "Inquire for Price";
  if (courseData.price === 0) return "Free";
  if (courseData.price == null) return "N/A";

  const basePrice = courseData.price;

  if (courseData.has_discount) {
    if (courseData.discount_always_available) {
      const discountedPrice =
        basePrice * (1 - courseData.discount_percentage / 100);
      return (
        <div className="flex flex-col">
          <span className="text-2xl line-through text-gray-500">
            EGP{Math.round(basePrice)}
          </span>
          <span className="text-4xl md:text-5xl font-black text-green-400">
            EGP{Math.round(discountedPrice)}
          </span>
          <span className="text-sm text-green-300">
            {courseData.discount_percentage}% OFF
          </span>
        </div>
      );
    } else if (courseData.discount_requires_min_people) {
      return (
        <div className="flex flex-col">
          <span className="text-4xl md:text-5xl font-black">
            EGP{Math.round(basePrice)}
          </span>
          <span className="text-sm text-green-300">
            {courseData.discount_percentage}% OFF for{" "}
            {courseData.discount_min_people}+ people
          </span>
        </div>
      );
    }
  }

  return `EGP${Math.round(basePrice)}`;
};

const formatDuration = (duration, unit = "hours") => {
  if (!duration) return "Duration TBD";
  return `${duration} ${unit}`;
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

const CourseDetailPage = async ({ params, searchParams }) => {
  const { id } = await params;

  // STEP 1: FETCH DATA ON THE SERVER
  let courseData;

  try {
    courseData = await getData(`/courses/${id}`);
  } catch (error) {
    // If the API returns a 404 or other error, this will be caught.
    console.error(`Failed to fetch course ${id}:`, error.message);
    notFound(); // Renders the not-found.js page
  }

  // STEP 2: PREPARE DATA AND RENDER THE PAGE
  const priceDisplay = formatPrice(courseData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Hero Section --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-teal-700">
        <div className="absolute inset-0 bg-black/40" />
        {courseData.images?.[0] && (
          <div className="absolute inset-0">
            <Image
              src={courseData.images[0]}
              alt={courseData.name}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-center mb-8">
            <Link
              href="/courses"
              className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mr-4"
            >
              <Icon
                icon="lucide:arrow-left"
                className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
              />
              <span>Back to Courses</span>
            </Link>
          </div>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-white leading-tight"
            style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.5)" }}
          >
            {courseData.name}
          </h1>

          {/* Course Info Badges */}
          <div className="flex flex-wrap items-center gap-4 text-white/90 mb-8 text-base">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full capitalize">
              <Icon icon="lucide:bar-chart-3" className="w-5 h-5 mr-2" />
              <span>Level: {courseData.course_level}</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon icon="lucide:clock" className="w-5 h-5 mr-2" />
              <span>
                {formatDuration(
                  courseData.course_duration,
                  courseData.course_duration_unit
                )}
              </span>
            </div>
            {courseData.course_type && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full capitalize">
                <Icon
                  icon={getCourseTypeIcon(courseData.course_type)}
                  className="w-5 h-5 mr-2"
                />
                <span>{courseData.course_type}</span>
              </div>
            )}
            {courseData.provider && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon icon="lucide:building" className="w-5 h-5 mr-2" />
                <span>{courseData.provider}</span>
              </div>
            )}
            {courseData.has_certificate && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon
                  icon={getCertificateIcon(courseData.certificate_type)}
                  className="w-5 h-5 mr-2"
                />
                <span>Certificate Included</span>
              </div>
            )}
            {courseData.has_online_content && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon icon="lucide:wifi" className="w-5 h-5 mr-2" />
                <span>Online Content</span>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-4">
            {typeof priceDisplay === "string" ? (
              <span className="text-4xl md:text-5xl font-black text-white">
                {priceDisplay}
              </span>
            ) : (
              priceDisplay
            )}
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {courseData.images && courseData.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:images"
                    className="w-8 h-8 mr-3 text-blue-600"
                  />
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {courseData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      <Image
                        src={image}
                        alt={`${courseData.name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Icon
                  icon="lucide:book-open"
                  className="w-8 h-8 mr-3 text-blue-600"
                />
                About This Course
              </h2>
              <MarkdownRenderer content={courseData.description} />
            </div>

            {/* Course Contents Section */}
            {courseData.contents && courseData.contents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:list"
                    className="w-6 h-6 mr-2 text-blue-600"
                  />
                  Course Contents
                </h3>
                <div className="space-y-4">
                  {courseData.contents.map((content, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {content.title}
                      </h4>
                      {content.description && (
                        <p className="text-gray-600 mt-1">
                          {content.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Objectives - keeping the original structure */}
            {courseData.learning_objectives &&
              Array.isArray(courseData.learning_objectives) && (
                <div className="bg-blue-50 rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                    <Icon icon="lucide:check-circle" className="w-6 h-6 mr-2" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2">
                    {courseData.learning_objectives.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start text-blue-700"
                      >
                        <Icon
                          icon="lucide:check"
                          className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Course Features */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Icon
                  icon="lucide:star"
                  className="w-6 h-6 mr-2 text-blue-600"
                />
                Course Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Icon
                    icon={getCourseTypeIcon(courseData.course_type)}
                    className="w-6 h-6 mr-3 text-blue-600"
                  />
                  <div>
                    <span className="font-semibold capitalize">
                      {courseData.course_type || "Standard"}
                    </span>
                    <p className="text-sm text-gray-600">Course Format</p>
                  </div>
                </div>

                {courseData.has_certificate && (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Icon
                      icon={getCertificateIcon(courseData.certificate_type)}
                      className="w-6 h-6 mr-3 text-green-600"
                    />
                    <div>
                      <span className="font-semibold capitalize">
                        {courseData.certificate_type || "Standard"} Certificate
                      </span>
                      <p className="text-sm text-gray-600">Upon Completion</p>
                    </div>
                  </div>
                )}

                {courseData.has_online_content && (
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <Icon
                      icon="lucide:wifi"
                      className="w-6 h-6 mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold">Online Resources</span>
                      <p className="text-sm text-gray-600">
                        Digital Materials Included
                      </p>
                    </div>
                  </div>
                )}

                {courseData.provider && (
                  <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                    <Icon
                      icon="lucide:building"
                      className="w-6 h-6 mr-3 text-purple-600"
                    />
                    <div>
                      <span className="font-semibold">
                        {courseData.provider}
                      </span>
                      <p className="text-sm text-gray-600">Course Provider</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Inquiry Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                {/* Price Section */}
                <div className="text-center mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center justify-center">
                    {typeof priceDisplay === "string" ? (
                      <span className="text-3xl md:text-4xl font-black text-gray-800">
                        {priceDisplay}
                      </span>
                    ) : (
                      priceDisplay
                    )}
                  </div>

                  {/* Discount Information */}
                  {courseData.has_discount &&
                    !courseData.discount_always_available &&
                    courseData.discount_requires_min_people && (
                      <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          <Icon
                            icon="lucide:users"
                            className="w-4 h-4 inline mr-1"
                          />
                          Group Discount Available:{" "}
                          {courseData.discount_percentage}% off for{" "}
                          {courseData.discount_min_people}+ participants
                        </p>
                      </div>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:send"
                    className="w-6 h-6 mr-2 text-blue-600"
                  />
                  Course Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Icon
                      icon="lucide:clock"
                      className="w-6 h-6 mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold">
                        {formatDuration(
                          courseData.course_duration,
                          courseData.course_duration_unit
                        )}
                      </span>
                      <p className="text-sm text-gray-600">Duration</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Icon
                      icon="lucide:bar-chart-3"
                      className="w-6 h-6 mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold capitalize">
                        {courseData.course_level}
                      </span>
                      <p className="text-sm text-gray-600">Difficulty Level</p>
                    </div>
                  </div>

                  {courseData.provider && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Icon
                        icon="lucide:building"
                        className="w-6 h-6 mr-3 text-blue-600"
                      />
                      <div>
                        <span className="font-semibold">
                          {courseData.provider}
                        </span>
                        <p className="text-sm text-gray-600">Provider</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/courses/${id}/inquire`}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-transform duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:send" className="w-5 h-5" />
                  Contact Us / Inquire
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 text-sm">
                    We'll get back to you within 24 hours with all the details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

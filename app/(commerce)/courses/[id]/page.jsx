// app/courses/[id]/page.js

import Input from "@/components/ui/Input"; // Assuming your components are here
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData, postData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const formatPrice = (price) => {
  if (price === 0) return "Inquire for Price";
  if (price == null) return "N/A";
  return `€${Math.round(price)}`;
};

const formatDuration = (duration) => {
  if (!duration) return "Duration TBD";
  return `${duration} hour${duration !== 1 ? "s" : ""} total`;
};

// --- Main Server Component ---

const CourseDetailPage = async ({ params, searchParams }) => {
  const { id } = await params;

  // STEP 1: FETCH DATA ON THE SERVER
  let courseData;

  const resolvedSearchParams = await searchParams;

  try {
    courseData = await getData(`/courses/${id}`);
  } catch (error) {
    // If the API returns a 404 or other error, this will be caught.
    console.error(`Failed to fetch course ${id}:`, error.message);
    notFound(); // Renders the not-found.js page
  }

  // STEP 2: DEFINE SERVER ACTION FOR INQUIRY FORM
  async function handleInquiry(formData) {
    "use server";

    // Extract and validate form data
    const inquiryData = {
      fullName: formData.get("fullName")?.toString().trim(),
      email: formData.get("email")?.toString().trim().toLowerCase(),
      phone: formData.get("phone")?.toString().trim(),
      message: formData.get("message")?.toString().trim() || "",
    };

    const errors = [];
    if (!inquiryData.fullName) errors.push("Full name is required");
    if (
      !inquiryData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryData.email)
    ) {
      errors.push("A valid email is required");
    }
    if (!inquiryData.phone) errors.push("A valid phone number is required");

    if (errors.length > 0) {
      return redirect(
        `/courses/${id}?error=${encodeURIComponent(errors.join(". "))}`
      );
    }

    // Prepare payload for your backend (e.g., an '/inquiries' endpoint)
    try {
      const inquiryPayload = {
        course_id: parseInt(id),
        course_name: courseData.name,
        ...inquiryData,
        status: "new",
      };

      await postData("/inquiries", inquiryPayload);

      // Redirect to a success page
      redirect(`/inquiry-sent?course=${encodeURIComponent(courseData.name)}`);
    } catch (error) {
      console.error("Inquiry submission failed:", error.message);
      const errorMessage =
        "Submission failed. Please try again or contact us directly.";
      return redirect(
        `/courses/${id}?error=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  // STEP 3: PREPARE DATA AND RENDER THE PAGE
  const priceDisplay = formatPrice(courseData.price);

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
          <div className="flex flex-wrap items-center gap-4 text-white/90 mb-8 text-base">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full capitalize">
              <Icon icon="lucide:bar-chart-3" className="w-5 h-5 mr-2" />
              <span>Level: {courseData.course_level}</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon icon="lucide:clock" className="w-5 h-5 mr-2" />
              <span>{formatDuration(courseData.course_duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl font-black text-white">
              {priceDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Example of a "What You'll Learn" section. Add this data to your API if desired. */}
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
          </div>

          {/* Right Column - Inquiry Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:send"
                    className="w-6 h-6 mr-2 text-blue-600"
                  />
                  Request Information
                </h3>

                {resolvedSearchParams.error && (
                  <div
                    className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6"
                    role="alert"
                  >
                    <p className="font-bold">Error</p>
                    <p>{decodeURIComponent(resolvedSearchParams.error)}</p>
                  </div>
                )}

                <form action={handleInquiry} className="space-y-4">
                  <Input
                    name="fullName"
                    placeholder="Full Name *"
                    required
                    icon="mdi:account-outline"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address *"
                    required
                    icon="mdi:email-outline"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number *"
                    required
                    icon="mdi:phone-outline"
                  />
                  <Input
                    name="message"
                    textarea
                    placeholder="Your Questions (Optional)"
                    icon="mdi:message-text-outline"
                    rows="4"
                  />

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-transform duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    Send Inquiry
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 text-sm">
                    We'll get back to you within 24 hours.
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

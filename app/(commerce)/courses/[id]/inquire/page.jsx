"use client";

import Input from "@/components/ui/Input";
import { postData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CourseInquirePage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    numberOfPeople: 1,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`
        );
        if (!response.ok) throw new Error("Course not found");
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Failed to fetch course:", error);
        toast.error("Failed to load course details");
        router.push("/courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const inquiryPayload = {
        course_id: parseInt(id),
        course_name: courseData.name,
        full_name: formData.fullName,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        message: formData.message,
        number_of_people: parseInt(formData.numberOfPeople),
        status: "pending",
      };

      await postData(`/courses/${id}/inquire`, inquiryPayload);

      toast.success(
        "Inquiry sent successfully! We'll contact you within 24 hours."
      );
      router.push(`/courses/${id}`);
    } catch (error) {
      console.error("Inquiry submission failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send inquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="lucide:loader-2"
            className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  const calculatePrice = () => {
    if (!courseData.price_available) return null;

    let price = courseData.price;
    const numberOfPeople = parseInt(formData.numberOfPeople) || 1;

    if (
      courseData.has_discount &&
      courseData.discount_requires_min_people &&
      numberOfPeople >= courseData.discount_min_people
    ) {
      price = price * (1 - courseData.discount_percentage / 100);
      return {
        original: courseData.price * numberOfPeople,
        discounted: price * numberOfPeople,
        hasDiscount: true,
        percentage: courseData.discount_percentage,
      };
    }

    if (courseData.has_discount && courseData.discount_always_available) {
      price = price * (1 - courseData.discount_percentage / 100);
      return {
        original: courseData.price * numberOfPeople,
        discounted: price * numberOfPeople,
        hasDiscount: true,
        percentage: courseData.discount_percentage,
      };
    }

    return {
      original: price * numberOfPeople,
      discounted: price * numberOfPeople,
      hasDiscount: false,
    };
  };

  const priceInfo = calculatePrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-teal-700 py-12">
        <div className="absolute inset-0 bg-black/40" />
        {courseData.images?.[0] && (
          <div className="absolute inset-0">
            <Image
              src={courseData.images[0]}
              alt={courseData.name}
              fill
              className="object-cover opacity-30"
              quality={90}
            />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/courses/${id}`}
            className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mb-6"
          >
            <Icon
              icon="lucide:arrow-left"
              className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
            />
            <span>Back to Course</span>
          </Link>
          <h1
            className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.5)" }}
          >
            Course Inquiry
          </h1>
          <p className="text-white/90 text-lg">{courseData.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Icon
                  icon="lucide:file-text"
                  className="w-6 h-6 mr-3 text-blue-600"
                />
                Your Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  icon="mdi:account-outline"
                  disabled={isSubmitting}
                />

                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  icon="mdi:email-outline"
                  disabled={isSubmitting}
                />

                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  icon="mdi:phone-outline"
                  disabled={isSubmitting}
                />

                <Input
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  placeholder="Number of People *"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  required
                  icon="mdi:account-group-outline"
                  disabled={isSubmitting}
                />

                <Input
                  name="message"
                  textarea
                  placeholder="Additional questions or special requirements (Optional)"
                  value={formData.message}
                  onChange={handleInputChange}
                  icon="mdi:message-text-outline"
                  rows="4"
                  disabled={isSubmitting}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        icon="lucide:loader-2"
                        className="w-5 h-5 animate-spin"
                      />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:send" className="w-5 h-5" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Icon
                  icon="lucide:info"
                  className="w-5 h-5 mr-2 text-blue-600"
                />
                Course Summary
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Course</p>
                  <p className="font-semibold text-gray-800">
                    {courseData.name}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-800">
                    {courseData.course_duration}{" "}
                    {courseData.course_duration_unit}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Level</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {courseData.course_level}
                  </p>
                </div>

                {priceInfo && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-600 mb-2">
                      Estimated Price
                    </p>
                    {priceInfo.hasDiscount ? (
                      <>
                        <p className="text-lg line-through text-gray-500">
                          EGP {Math.round(priceInfo.original)}
                        </p>
                        <p className="text-2xl font-black text-green-600">
                          EGP {Math.round(priceInfo.discounted)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {priceInfo.percentage}% Discount Applied
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-black text-gray-800">
                        EGP {Math.round(priceInfo.discounted)}
                      </p>
                    )}
                    {formData.numberOfPeople > 1 && (
                      <p className="text-xs text-gray-600 mt-2">
                        For {formData.numberOfPeople} people
                      </p>
                    )}
                  </div>
                )}

                {courseData.has_discount &&
                  courseData.discount_requires_min_people &&
                  parseInt(formData.numberOfPeople) <
                    courseData.discount_min_people && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        <Icon
                          icon="lucide:info"
                          className="w-3 h-3 inline mr-1"
                        />
                        Book {courseData.discount_min_people}+ people to get{" "}
                        {courseData.discount_percentage}% off!
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  We'll confirm availability and final pricing within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInquirePage;

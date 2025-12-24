"use client";

import Input from "@/components/ui/Input";
import { postData } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button } from "../ui/Button";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const formatDate = (dateString) => {
  if (!dateString) return "Date not available";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const StarRating = React.memo(
  ({ rating = 0, size = 20, interactive = false, onStarClick }) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon
            key={index}
            icon={index < rating ? "mdi:star" : "mdi:star-outline"}
            width={size}
            height={size}
            className={`${
              index < rating ? "text-amber-400" : "text-gray-300"
            } transition-colors duration-200 ${
              interactive ? "cursor-pointer hover:text-amber-300" : ""
            }`}
            onClick={() => interactive && onStarClick?.(index + 1)}
          />
        ))}
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

const TestimonialCard = React.memo(({ testimonial }) => {
  const { user, rating, description, created_at } = testimonial;
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Rating */}
      <div className="flex justify-center mb-6">
        <StarRating rating={rating} size={28} />
      </div>

      {/* Description */}
      <p className="text-gray-700 text-xl leading-relaxed mb-8 flex-grow">
        "{description}"
      </p>

      {/* User Info */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-800 text-lg">
            {user?.full_name || "Anonymous User"}
          </h4>
          <p className="text-gray-500 text-sm">{formatDate(created_at)}</p>
        </div>
      </div>
    </div>
  );
});

TestimonialCard.displayName = "TestimonialCard";

const RateUsModal = React.memo(({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    description: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ rating: 0, description: "", notes: "" });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0 || !formData.description.trim()) {
      toast.warn("Please provide a rating and a description.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postData(
        "/testimonials/create",
        {
          ...formData,
          notes: formData.notes.trim() || null,
        },
        true
      );
      onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
        >
          <Icon icon="mdi:close" width={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
            <Icon icon="mdi:star-plus" className="text-white" width={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Rate Our Service</h3>
          <p className="text-gray-500 mt-2">Share your experience with us</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={formData.rating}
                size={36}
                interactive
                onStarClick={(rating) => setFormData((p) => ({ ...p, rating }))}
              />
            </div>
          </div>

          {/* Description */}
          <Input
            textarea
            icon="mdi:format-quote-open"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Tell us about your experience..."
            rows={4}
            required
          />

          {/* Notes */}
          <Input
            textarea
            icon="mdi:note-text-outline"
            name="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Additional notes (optional)..."
            rows={3}
          />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              text="Cancel"
              variant="outline"
              onClick={onClose}
              type="button"
              color="red"
              shade={600}
            />
            <Button
              text={isSubmitting ? "Submitting..." : "Submit Review"}
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              full
            />
          </div>
        </form>
      </div>
    </div>
  );
});

RateUsModal.displayName = "RateUsModal";

// ============================================================================
// MAIN CLIENT COMPONENT
// ============================================================================

export default function TestimonialClient({ testimonials = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const openModal = useCallback(() => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to be logged in to submit a testimonial.",
        confirmButtonColor: "#0891b2",
      });
      return;
    }
    setIsModalOpen(true);
  }, [isAuthenticated]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleSuccess = useCallback(() => {
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Thank You!",
      text: "Your testimonial has been submitted for review.",
      confirmButtonColor: "#0891b2",
    });
  }, [closeModal]);

  const filteredTestimonials = React.useMemo(() => {
    if (!searchTerm) return testimonials;
    const searchLower = searchTerm.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.user?.full_name?.toLowerCase().includes(searchLower)
    );
  }, [testimonials, searchTerm]);

  const stats = React.useMemo(() => {
    const count = testimonials.length;
    if (count === 0) return { count, average: "0.0", fiveStar: 0 };
    const average = (
      testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / count
    ).toFixed(1);
    const fiveStar = testimonials.filter((t) => (t.rating || 0) === 5).length;
    return { count, average, fiveStar };
  }, [testimonials]);

  if (filteredTestimonials.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-6">
          <Icon
            icon="mdi:comment-quote-outline"
            className="text-white"
            width={40}
          />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          No Testimonials Yet
        </h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Be the first to share your diving experience with us!
        </p>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Icon icon="mdi:star-plus" width={24} />
          <span>Share Your Experience</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      {testimonials.length > 0 && (
        <div className="max-w-md mx-auto mb-12">
          <Input
            icon="mdi:magnify"
            name="search"
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Testimonials Slider */}
      {filteredTestimonials.length > 0 ? (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              swiper.params.navigation.nextEl = navigationNextRef.current;
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            slidesPerView={1}
            spaceBetween={40}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 30 },
              1280: { slidesPerView: 2, spaceBetween: 40 },
            }}
            className="testimonials-swiper"
            loop={filteredTestimonials.length > 3}
            centeredSlides
          >
            {filteredTestimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id} className="h-auto pb-16">
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={navigationPrevRef}
            className="swiper-nav-button left-0 md:-left-6"
            aria-label="Previous testimonial"
          >
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <button
            ref={navigationNextRef}
            className="swiper-nav-button right-0 md:-right-6"
            aria-label="Next testimonial"
          >
            <Icon icon="mdi:chevron-right" width={28} />
          </button>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-3xl mb-6">
            <Icon
              icon="mdi:magnify-remove-outline"
              className="text-gray-400"
              width={40}
            />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            No results found
          </h3>
          <p className="text-gray-500 mb-6">Try adjusting your search terms</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Statistics */}
      {testimonials.length > 0 && (
        <div className="mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {[
              {
                icon: "mdi:account-group",
                value: `${stats.count}+`,
                label: "Happy Customers",
              },
              {
                icon: "mdi:star",
                value: stats.average,
                label: "Average Rating",
              },
              {
                icon: "mdi:trophy",
                value: stats.fiveStar,
                label: "5-Star Reviews",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="relative group text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-cyan-200 transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon icon={stat.icon} className="text-white" width={28} />
                  </div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Card */}
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
            <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-10 shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
                <Icon icon="mdi:heart" className="text-white" width={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Enjoyed your dive?
              </h3>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Share your underwater adventure with us! Your feedback helps us
                create better experiences.
              </p>
              <button
                onClick={openModal}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Icon icon="mdi:star-plus" width={24} />
                <span>Share Your Experience</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <RateUsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />

      {/* Styles */}
      <style jsx global>{`
        .testimonials-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        .testimonials-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: #d1d5db;
          opacity: 1;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background-color: #06b6d4;
          width: 10px;
        }
        .swiper-slide {
          height: auto !important;
        }
        .swiper-nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #374151;
          transition: all 0.2s;
        }
        .swiper-nav-button:hover {
          background: #06b6d4;
          color: white;
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.3);
        }
        .swiper-nav-button.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

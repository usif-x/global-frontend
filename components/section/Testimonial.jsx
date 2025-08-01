"use client";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getData, postData } from "/lib/axios";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "../ui/Button";

// ============================================================================
//  HELPER COMPONENTS (Internal to this file)
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
              index < rating ? "text-yellow-400" : "text-gray-300"
            } transition-colors duration-200 ${
              interactive ? "cursor-pointer hover:text-yellow-300" : ""
            }`}
            onClick={() => interactive && onStarClick?.(index + 1)}
          />
        ))}
      </div>
    );
  }
);

const TestimonialCard = React.memo(({ testimonial }) => {
  const { user, rating, description, created_at } = testimonial;
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="flex flex-col bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto h-full w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Icon
            icon="mdi:format-quote-open"
            className="text-white"
            width={28}
          />
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <StarRating rating={rating} size={24} />
      </div>
      <p className="text-center text-gray-700 text-lg leading-relaxed italic mb-8 flex-grow">
        "{description}"
      </p>
      <div className="text-center mt-auto">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
        </div>
        <h4 className="font-semibold text-gray-800 text-lg">
          {user?.full_name || "Anonymous User"}
        </h4>
        <div className="flex items-center justify-center mt-3 text-gray-400 text-sm">
          <Icon icon="mdi:calendar" className="mr-2" />
          {formatDate(created_at)}
        </div>
      </div>
    </div>
  );
});

const TestimonialCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-8 shadow-xl mx-4 h-full animate-pulse w-full max-w-sm">
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
    </div>
    <div className="flex justify-center mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3 text-center mb-8">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
    </div>
    <div className="text-center mt-auto">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

const RateUsModal = React.memo(({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ rating: 0, description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ rating: 0, description: "" });
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
      await postData("/testimonials/create", formData, true);
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Rate Our Service</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mdi:close" width={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={formData.rating}
                size={32}
                interactive
                onStarClick={(rating) => setFormData((p) => ({ ...p, rating }))}
              />
            </div>
          </div>
          <Input
            textarea
            icon={"mdi:format-quote-open"}
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Tell us more..."
            rows={4}
            required
          />
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

// ============================================================================
//  MAIN COMPONENT
// ============================================================================

const TestimonialShowcase = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        // PERFORMANCE FIX: Fetch testimonials with user data included in a single API call.
        // This avoids the N+1 query problem from the original code.
        // This assumes your backend has an endpoint like this.
        const data = await getData("/testimonials/all-with-users");
        setTestimonials(data || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const openModal = useCallback(() => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to be logged in to submit a testimonial.",
        confirmButtonColor: "#8b5cf6",
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
      confirmButtonColor: "#8b5cf6",
    });
    // Note: We don't refetch data here, as new submissions are usually pending approval.
  }, [closeModal]);

  const filteredTestimonials = useMemo(() => {
    if (!searchTerm) return testimonials;
    const searchLower = searchTerm.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.user?.full_name?.toLowerCase().includes(searchLower)
    );
  }, [testimonials, searchTerm]);

  const stats = useMemo(() => {
    const count = testimonials.length;
    if (count === 0) return { count, average: "0.0", fiveStar: 0 };
    const average = (
      testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / count
    ).toFixed(1);
    const fiveStar = testimonials.filter((t) => (t.rating || 0) === 5).length;
    return { count, average, fiveStar };
  }, [testimonials]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center gap-8">
          <TestimonialCardSkeleton />
          <TestimonialCardSkeleton className="hidden md:block" />
          <TestimonialCardSkeleton className="hidden lg:block" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 text-red-600 bg-red-50 rounded-lg">
          <h3 className="text-xl font-semibold">{error}</h3>
        </div>
      );
    }

    if (filteredTestimonials.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-700">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "No Testimonials Yet"}
          </h3>
          <p className="text-gray-500 mt-2 mb-6">
            {searchTerm
              ? "Try a different search."
              : "Be the first to share your experience!"}
          </p>
          <Button
            text="Rate Our Service"
            onClick={openModal}
            icon="mdi:star-plus"
          />
        </div>
      );
    }

    return (
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
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
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 80,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          slidesPerView={1}
          spaceBetween={30}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper"
          loop
          centeredSlides
        >
          {filteredTestimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto pb-16">
              <TestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          ref={navigationPrevRef}
          className="swiper-nav-button left-0 md:-left-4"
        >
          <Icon icon="mdi:chevron-left" width={28} />
        </button>
        <button
          ref={navigationNextRef}
          className="swiper-nav-button right-0 md:-right-4"
        >
          <Icon icon="mdi:chevron-right" width={28} />
        </button>
      </div>
    );
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real stories from our valued customers who love our service.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <Input
            icon="mdi:magnify"
            name="search"
            type="text"
            placeholder="Search by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {renderContent()}

        {!loading && testimonials.length > 0 && (
          <div className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div>
                <h3 className="text-3xl font-bold text-purple-600">
                  {stats.count}+
                </h3>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-600">
                  {stats.average}
                </h3>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-600">
                  {stats.fiveStar}
                </h3>
                <p className="text-gray-600">5-Star Reviews</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center col-span-3 mx-10 bg-purple-50 border border-purple-200 rounded-2xl p-8 shadow-sm mt-10">
              <h1 className="text-2xl font-bold text-purple-800 mb-2">
                Enjoyed our service?
              </h1>
              <p className="text-gray-700 mb-6 text-center max-w-md">
                We'd love to hear your feedback. Your rating helps us improve
                and serve you better!
              </p>
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-full hover:from-purple-600 hover:to-purple-700 shadow-lg transition-all duration-200"
              >
                <Icon icon="mdi:star-plus" width={22} height={22} />
                <span>Rate Us</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <RateUsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />

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
          background-color: #8b5cf6;
        }
        .swiper-slide {
          height: auto !important;
          display: flex;
          align-items: stretch;
          justify-content: center;
        }
        .swiper-nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-70%);
          z-index: 10;
          width: 48px;
          height: 48px;
          background-color: white;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
          color: #4b5563;
          transition: all 0.2s ease-in-out;
        }
        .swiper-nav-button:hover {
          background-color: #f3f4f6;
          color: #6366f1;
          transform: translateY(-70%) scale(1.05);
        }
        .swiper-nav-button.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
};

export default TestimonialShowcase;

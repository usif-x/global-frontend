import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import TestimonialClient from "./TestimonialClient";

// ============================================================================
// SERVER COMPONENT - Fetches testimonials data
// ============================================================================

export default async function TestimonialShowcase() {
  let testimonials = [];
  let error = null;

  try {
    // Fetch testimonials with user data included in a single API call
    const data = await getData("/testimonials/all-with-users");
    testimonials = data || [];
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    error = "Failed to load testimonials. Please try again later.";
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Icon icon="mdi:star" className="text-amber-400" width={20} />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            What Our Divers Say
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Real experiences from adventurers who explored the Red Sea with us
          </p>
        </div>

        {/* Error State */}
        {error ? (
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl opacity-25 blur"></div>
              <div className="relative bg-white rounded-3xl p-10 text-center border border-red-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-red-500"
                    width={32}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <TestimonialClient testimonials={testimonials} />
        )}
      </div>
    </section>
  );
}

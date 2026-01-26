"use client";
import { Icon } from "@iconify/react";

// Data for the features - easy to update or add new ones
const features = [
  {
    icon: "ph:hand-coins",
    title: "Best Prices",
    description:
      "We guarantee competitive and transparent pricing with no hidden fees, ensuring you get the best value for your adventure.",
  },
  {
    icon: "mdi:emoticon-happy-outline",
    title: "Happy Divers",
    description:
      "Our community is built on fun and friendship. We have a proven track record of satisfied divers who return time and again.",
  },
  {
    icon: "fa-solid:medal",
    title: "Expert Staff",
    description:
      "Our PADI-certified instructors are passionate, experienced, and dedicated to your safety and enjoyment on every dive.",
  },
  {
    icon: "mdi:shield-check",
    title: "Safety First",
    description:
      "Your safety is our top priority. We maintain the highest standards of equipment and follow strict safety protocols on every dive.",
  },
  {
    icon: "mdi:calendar-check",
    title: "Flexible Booking",
    description:
      "Easy online booking with flexible cancellation policies. We understand that plans can change and we're here to accommodate.",
  },
  {
    icon: "mdi:diving-scuba-tank",
    title: "Top Equipment",
    description:
      "We use only the best diving equipment, regularly serviced and maintained to ensure optimal performance and safety.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradient Mesh */}
      <div className="absolute inset-0"></div>

      {/* Main content */}
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Icon icon="mdi:star-circle" className="text-cyan-500" width={20} />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Your Perfect Diving Partner
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Experience the difference with TopDivers. We combine expertise,
            passion, and dedication to create unforgettable underwater
            adventures.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-cyan-200">
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon icon={feature.icon} className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:certificate"
                className="text-cyan-500"
                width={32}
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Certified Excellence
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  PADI 5-Star Dive Center
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-md">
              Recognized for outstanding service, professional instruction, and
              commitment to diver safety
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

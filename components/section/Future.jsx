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
];

const WhyChooseUs = () => {
  return (
    <section className="relative bg-gradient-to-b from-sky-50 to-white py-20 sm:py-24 md:py-32 overflow-hidden">
      {/* Floating bubbles animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-cyan-200/50 rounded-full animate-bounce"></div>
        <div
          className="absolute top-3/4 right-1/4 w-3 h-3 bg-sky-300/50 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-2 h-2 bg-cyan-300/50 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-5 h-5 bg-sky-200/50 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-base font-semibold leading-7 text-sky-600">
              UNMATCHED EXCELLENCE
            </h2>
            <p className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Why Choose TopDivers?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We are committed to providing an unparalleled diving experience,
              blending safety, expertise, and pure underwater magic.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 max-w-none">
            <dl className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col items-center text-center p-8 transition-all duration-300 transform hover:-translate-y-2 bg-white/50 rounded-xl shadow-sm hover:shadow-2xl hover:shadow-sky-100 border border-slate-200/80"
                >
                  {/* Icon container */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-cyan-500/30">
                    <Icon icon={feature.icon} className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <dt className="mt-6 text-xl font-semibold leading-7 text-gray-900">
                    {feature.title}
                  </dt>

                  {/* Description */}
                  <dd className="mt-2 flex-auto text-base leading-7 text-gray-600">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

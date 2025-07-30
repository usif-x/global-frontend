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
    <section className="relative bg-gradient-to-b from-sky-50 to-white py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
      {/* Floating bubbles animation - responsive positioning */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-300 rounded-full opacity-60 animate-bounce"></div>
        <div
          className="absolute top-3/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-sky-400 rounded-full opacity-50 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full opacity-70 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-4 h-4 sm:w-5 sm:h-5 bg-sky-300 rounded-full opacity-40 animate-bounce"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header - responsive typography and spacing */}
          <div className="mx-auto max-w-2xl text-center lg:text-center">
            <h2 className="text-sm sm:text-base font-semibold leading-6 sm:leading-7 text-sky-600">
              Ready for some fun?
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Open the wonderful underwater world
            </p>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 px-4 sm:px-0">
              If diving has always been your dream, you're in the right place.
              We help dreams come true by providing safe, fun, and unforgettable
              experiences.
            </p>
          </div>

          {/* Features Grid - responsive grid and spacing */}
          <div className="mx-auto mt-12 sm:mt-16 lg:mt-20 xl:mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center sm:items-center sm:text-center lg:items-start lg:text-left transform hover:scale-105 transition-all duration-300 hover:bg-sky-200 p-4 sm:p-5 lg:p-6 rounded-lg group"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Icon container - responsive sizing */}
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg hover:shadow-xl transition-shadow duration-300 group-hover:shadow-2xl">
                    <Icon
                      icon={feature.icon}
                      className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white"
                    />
                  </div>

                  {/* Title - responsive typography */}
                  <dt className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-xl font-semibold leading-6 sm:leading-7 text-gray-900">
                    {feature.title}
                  </dt>

                  {/* Description - responsive typography and padding */}
                  <dd className="mt-2 flex-auto text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 px-2 sm:px-0">
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

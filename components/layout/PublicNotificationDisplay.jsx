"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const PublicNotificationDisplay = ({ notifications, onDismiss }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!notifications || notifications.length === 0) return null;

  const currentNotification = notifications[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + notifications.length) % notifications.length
    );
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "success":
        return {
          gradient: "from-emerald-500 via-green-500 to-teal-500",
          icon: "mdi:check-circle",
          shadow: "shadow-green-500/20",
        };
      case "warning":
        return {
          gradient: "from-amber-500 via-yellow-500 to-orange-500",
          icon: "mdi:alert",
          shadow: "shadow-yellow-500/20",
        };
      case "error":
        return {
          gradient: "from-red-500 via-rose-500 to-pink-500",
          icon: "mdi:alert-circle",
          shadow: "shadow-red-500/20",
        };
      case "info":
      default:
        return {
          gradient: "from-cyan-500 via-blue-500 to-indigo-500",
          icon: "mdi:information",
          shadow: "shadow-cyan-500/20",
        };
    }
  };

  const typeStyle = getTypeStyles(currentNotification.type);

  return (
    <div
      className={`relative z-[1100] w-full bg-gradient-to-r ${
        typeStyle.gradient
      } text-white transition-all duration-500 ease-out ${
        typeStyle.shadow
      } shadow-lg ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon + Message */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-pulse"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                  <Icon
                    icon={typeStyle.icon}
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base">
                <span className="md:hidden truncate block">
                  {currentNotification.title}
                </span>
                <span className="hidden md:block">
                  <span className="font-bold">{currentNotification.title}</span>
                  <span className="mx-2">•</span>
                  <span className="font-normal opacity-95">
                    {currentNotification.message}
                  </span>
                </span>
              </div>
              <p className="md:hidden text-xs sm:text-sm opacity-90 mt-0.5 truncate">
                {currentNotification.message}
              </p>
            </div>
          </div>

          {/* Right: Navigation + Close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {notifications.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-white/20 transition-all duration-200 active:scale-95"
                  aria-label="Previous notification"
                >
                  <Icon
                    icon="mdi:chevron-left"
                    className="h-4 w-4 text-white"
                  />
                </button>
                <span className="text-xs font-semibold text-white px-2 min-w-[2.5rem] text-center">
                  {currentIndex + 1} / {notifications.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-white/20 transition-all duration-200 active:scale-95"
                  aria-label="Next notification"
                >
                  <Icon
                    icon="mdi:chevron-right"
                    className="h-4 w-4 text-white"
                  />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="group p-1.5 sm:p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 transition-all duration-200 active:scale-95"
              aria-label="Dismiss notification"
            >
              <Icon
                icon="mdi:close"
                className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:rotate-90 transition-transform duration-200"
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        {notifications.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2">
            {notifications.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to notification ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicNotificationDisplay;

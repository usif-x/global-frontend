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
          gradient: "from-emerald-600 via-green-500 to-teal-400",
          animatedGradient:
            "bg-gradient-to-r from-emerald-600 via-green-500 via-emerald-400 to-teal-500",
          icon: "mdi:check-circle",
          shadow: "shadow-green-500/30",
        };
      case "warning":
        return {
          gradient: "from-amber-600 via-yellow-500 to-orange-400",
          animatedGradient:
            "bg-gradient-to-r from-amber-600 via-yellow-500 via-amber-400 to-orange-500",
          icon: "mdi:alert",
          shadow: "shadow-yellow-500/30",
        };
      case "error":
        return {
          gradient: "from-red-600 via-rose-500 to-pink-400",
          animatedGradient:
            "bg-gradient-to-r from-red-600 via-rose-500 via-red-400 to-pink-500",
          icon: "mdi:alert-circle",
          shadow: "shadow-red-500/30",
        };
      case "info":
      default:
        return {
          gradient: "from-blue-900 via-blue-600 via-sky-500 to-cyan-400",
          animatedGradient:
            "bg-gradient-to-r from-blue-900 via-blue-600 via-sky-500 via-cyan-400 to-blue-900",
          icon: "mdi:information",
          shadow: "shadow-cyan-500/30",
        };
    }
  };

  const typeStyle = getTypeStyles(currentNotification.type);

  return (
    <>
      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) rotate(45deg);
          }
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 50%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div
        className={`relative z-[1100] w-full ${
          typeStyle.animatedGradient
        } animated-gradient text-white transition-all duration-500 ease-out ${
          typeStyle.shadow
        } shadow-2xl ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer-effect"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Icon + Message */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/40 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/40 shadow-lg">
                    <Icon
                      icon={typeStyle.icon}
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base drop-shadow-md">
                  <span className="md:hidden block">
                    {currentNotification.title}
                  </span>
                  <span className="hidden md:block">
                    <span className="font-bold">
                      {currentNotification.title}
                    </span>
                    <span className="mx-2 opacity-70">•</span>
                    <span className="font-normal opacity-95">
                      {currentNotification.message}
                    </span>
                  </span>
                </div>
                <p className="md:hidden text-xs sm:text-sm opacity-90 mt-0.5 drop-shadow">
                  {currentNotification.message}
                </p>
              </div>
            </div>

            {/* Right: Navigation + Close */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {notifications.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-lg px-2 py-1 border border-white/30 shadow-lg">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-md hover:bg-white/30 transition-all duration-200 active:scale-95"
                    aria-label="Previous notification"
                  >
                    <Icon
                      icon="mdi:chevron-left"
                      className="h-4 w-4 text-white drop-shadow"
                    />
                  </button>
                  <span className="text-xs font-bold text-white px-2 min-w-[2.5rem] text-center drop-shadow">
                    {currentIndex + 1} / {notifications.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-md hover:bg-white/30 transition-all duration-200 active:scale-95"
                    aria-label="Next notification"
                  >
                    <Icon
                      icon="mdi:chevron-right"
                      className="h-4 w-4 text-white drop-shadow"
                    />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="group p-1.5 sm:p-2 rounded-lg bg-white/15 backdrop-blur-md hover:bg-white/30 border border-white/30 transition-all duration-200 active:scale-95 shadow-lg"
                aria-label="Dismiss notification"
              >
                <Icon
                  icon="mdi:close"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow group-hover:rotate-90 transition-transform duration-200"
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
                  className={`h-1.5 rounded-full transition-all duration-300 shadow ${
                    index === currentIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to notification ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicNotificationDisplay;

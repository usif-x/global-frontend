"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

const PublicNotificationDisplay = ({ notifications, onDismiss }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const getTypeStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "info":
      default:
        return "bg-cyan-600 text-white";
    }
  };

  return (
    <div
      className={`relative z-[1100] w-full ${getTypeStyles(
        currentNotification.type
      )} transition-all duration-300 ease-in-out shadow-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 flex items-center justify-center sm:justify-start min-w-0">
            <span className="flex p-1.5 rounded-lg bg-black/10 mr-3">
              <Icon icon="mdi:bullhorn" className="h-4 w-4 text-white" />
            </span>
            <div className="font-medium text-sm truncate">
              <span className="md:hidden">{currentNotification.title}</span>
              <span className="hidden md:inline">
                <span className="font-bold">{currentNotification.title}: </span>
                {currentNotification.message}
              </span>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 order-2 sm:order-3 sm:ml-3">
            {notifications.length > 1 && (
              <div className="flex items-center space-x-1 mr-4">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-black/10 transition-colors"
                >
                  <Icon
                    icon="mdi:chevron-left"
                    className="h-4 w-4 text-white"
                  />
                </button>
                <span className="text-xs font-medium text-white">
                  {currentIndex + 1}/{notifications.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-black/10 transition-colors"
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
              onClick={onDismiss}
              className="-mr-1 flex p-1.5 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <Icon icon="mdi:close" className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicNotificationDisplay;

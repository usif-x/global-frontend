"use client";

import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

export default function SnowEffect() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem("snowEffect");
    if (savedPreference !== null) {
      setIsEnabled(savedPreference === "true");
    }
    setIsLoaded(true);
  }, []);

  const toggleSnow = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem("snowEffect", String(newState));
  };

  if (!isLoaded) return null;

  return (
    <>
      {isEnabled && (
        <Snowfall
          color="#fff"
          snowflakeCount={150}
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}

      <button
        onClick={toggleSnow}
        className="fixed bottom-6 left-6 z-[10000] group"
        aria-label={isEnabled ? "Disable snow effect" : "Enable snow effect"}
      >
        <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110">
          {/* Rotating background effect */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isEnabled ? "animate-spin-slow" : ""
            }`}
          ></div>

          {/* Icon container */}
          <div className="relative z-10 text-white text-2xl md:text-3xl transition-transform duration-500 group-hover:rotate-180">
            {isEnabled ? "❄️" : "🌨️"}
          </div>

          {/* Pulse effect when enabled */}
          {isEnabled && (
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
          )}
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {isEnabled ? "Stop Snow" : "Start Snow"}
        </div>
      </button>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
}

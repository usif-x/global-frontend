"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import Snowfall from "react-snowfall";

// Helper function to manage cookies for the reset functionality
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

export default function FloatingActionButtons() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSnowEnabled, setIsSnowEnabled] = useState(true);
  const [isSnowLoaded, setIsSnowLoaded] = useState(false);

  // Use a ref to ensure initialization only runs once per modal opening
  const isInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const savedPreference = localStorage.getItem("snowEffect");
    if (savedPreference !== null) {
      setIsSnowEnabled(savedPreference === "true");
    }
    setIsSnowLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Define the callback function on the window object
    window.googleTranslateElementInit = () => {
      if (!isInitialized.current) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar,es,fr,de,it,pt,ru,ja,ko,zh",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element_fixed"
        );
        isInitialized.current = true;
      }
    };

    if (isTranslateOpen) {
      // If modal is open, load the script if it's not already there
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
      } else if (window.google && !isInitialized.current) {
        // If script is already loaded but not initialized, run init
        window.googleTranslateElementInit();
      }
    }
  }, [isTranslateOpen]);

  // When the modal closes, we reset the initialization flag
  useEffect(() => {
    if (!isTranslateOpen) {
      isInitialized.current = false;
    }
  }, [isTranslateOpen]);

  const handleReset = () => {
    setCookie("googtrans", null, -1);
    window.location.reload();
  };

  const toggleSnow = () => {
    const newState = !isSnowEnabled;
    setIsSnowEnabled(newState);
    localStorage.setItem("snowEffect", String(newState));
    setIsOpen(false);
  };

  const openTranslate = () => {
    setIsTranslateOpen(true);
    setIsOpen(false);
  };

  if (!isMounted || !hasScrolled || !isSnowLoaded) return null;

  return (
    <>
      {/* Snow Effect */}
      {isSnowEnabled && (
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 left-4 z-[999]">
        {/* Action Buttons - Drop Up */}
        <div
          className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Snow Effect Toggle Button */}
          <button
            onClick={toggleSnow}
            className="group relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-white/20"
            aria-label={
              isSnowEnabled ? "Disable snow effect" : "Enable snow effect"
            }
          >
            <div className="relative z-10 text-2xl flex items-center justify-center">
              {isSnowEnabled ? "❄️" : "🌨️"}
            </div>
            {isSnowEnabled && (
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
            )}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/10 shadow-xl">
                {isSnowEnabled ? "إيقاف الثلج" : "تشغيل الثلج"}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          </button>

          {/* Translate Button */}
          <button
            onClick={openTranslate}
            className="group relative w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-white/20"
            aria-label="Translate Page"
          >
            <Icon
              icon="lucide:languages"
              className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping opacity-0 group-hover:opacity-100"></div>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/10 shadow-xl">
                Translate Page
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          </button>
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/30 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-label="Toggle actions menu"
        >
          <Icon
            icon={isOpen ? "lucide:x" : "lucide:plus"}
            className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 animate-spin-slow transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Translate Widget Modal Overlay */}
      {isTranslateOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="translate-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsTranslateOpen(false)}
          ></div>

          {/* Translate Modal Panel */}
          <div
            className="relative bg-white rounded-2xl p-6 pt-5 shadow-2xl border border-gray-200 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                id="translate-modal-title"
                className="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <Icon
                  icon="lucide:languages"
                  className="w-5 h-5 text-cyan-500"
                />
                Translate Page
              </h3>
              <button
                onClick={() => setIsTranslateOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close translation panel"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The content of this page will be automatically translated by
                google into your selected language.
              </p>

              <div
                id="google_translate_element_fixed"
                className="google-translate-container-fixed"
              ></div>

              <button
                onClick={handleReset}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
                Reset Translation
              </button>
            </div>
            <div className="flex justify-center items-center p-4 m-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 mt-6">
              <p className="text-sm text-gray-600">
                if you want to select another language reset the current one.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
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

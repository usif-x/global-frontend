"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

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

const GoogleTranslateButton = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Use a ref to ensure initialization only runs once per modal opening
  const isInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
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
  // so it can be re-initialized the next time it opens.
  useEffect(() => {
    if (!isTranslateOpen) {
      isInitialized.current = false;
    }
  }, [isTranslateOpen]);

  const handleReset = () => {
    setCookie("googtrans", null, -1); // Invalidate the cookie
    window.location.reload();
  };

  if (!isMounted || !hasScrolled) return null;

  return (
    <>
      {/* Fixed Translate Button */}
      <div className="fixed bottom-4 left-4 z-[999]">
        <button
          onClick={() => setIsTranslateOpen(true)}
          className="group relative w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-white/20 backdrop-blur-sm"
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
            // *** FIX #2: STOP EVENT PROPAGATION ***
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

      <style jsx global>{``}</style>
    </>
  );
};

export default GoogleTranslateButton;

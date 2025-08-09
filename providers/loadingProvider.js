// components/providers/LoadingProvider.js
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to start loading
    const startLoading = () => {
      setIsLoading(true);
    };

    // Function to stop loading
    const stopLoading = () => {
      setIsLoading(false);
    };

    // Intercept all navigation methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override pushState (used by router.push, Link clicks, etc.)
    window.history.pushState = function (...args) {
      startLoading();
      return originalPushState.apply(this, args);
    };

    // Override replaceState (used by router.replace)
    window.history.replaceState = function (...args) {
      startLoading();
      return originalReplaceState.apply(this, args);
    };

    // Listen for popstate events (back/forward buttons)
    const handlePopState = () => {
      startLoading();
    };

    // Listen for all link clicks
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        // Only for internal links
        startLoading();
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, true);

    // Cleanup function
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  // Stop loading when route actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Small delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const contextValue = {
    isLoading,
    setIsLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

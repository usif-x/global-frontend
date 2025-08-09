"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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

  // Ref to store the last pathname and search params
  const lastPathRef = useRef("");
  const lastSearchRef = useRef("");

  // Helper function to check if navigation is hash-only
  const isHashOnlyNavigation = (newUrl, currentUrl) => {
    try {
      const newUrlObj = new URL(newUrl, window.location.origin);
      const currentUrlObj = new URL(currentUrl, window.location.origin);

      return (
        newUrlObj.pathname === currentUrlObj.pathname &&
        newUrlObj.search === currentUrlObj.search &&
        newUrlObj.hash !== currentUrlObj.hash
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Function to start loading (with hash check)
    const startLoading = (newUrl = null) => {
      if (newUrl && isHashOnlyNavigation(newUrl, window.location.href)) {
        return; // Don't start loading for hash-only changes
      }
      setIsLoading(true);
    };

    // Function to stop loading
    const stopLoading = () => {
      setIsLoading(false);
    };

    // Override history methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (state, title, url) {
      if (url) {
        const fullUrl = new URL(url, window.location.origin).href;
        startLoading(fullUrl);
      } else {
        startLoading();
      }
      return originalPushState.apply(this, arguments);
    };

    window.history.replaceState = function (state, title, url) {
      if (url) {
        const fullUrl = new URL(url, window.location.origin).href;
        startLoading(fullUrl);
      } else {
        startLoading();
      }
      return originalReplaceState.apply(this, arguments);
    };

    const handlePopState = (e) => {
      // For popstate, we need to check the current URL vs the new URL
      // Since popstate fires after the URL has changed, we need to use a timeout
      const currentUrl = window.location.href;
      setTimeout(() => {
        startLoading(window.location.href);
      }, 0);
    };

    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        startLoading(link.href);
      }
    };

    // Handle hash changes specifically
    const handleHashChange = (e) => {
      // Don't start loading for hash-only changes
      return;
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  useEffect(() => {
    const currentPath = pathname;
    const currentSearch = searchParams.toString();

    // Check if either pathname or search params changed
    if (
      lastPathRef.current !== currentPath ||
      lastSearchRef.current !== currentSearch
    ) {
      setIsLoading(true);
      lastPathRef.current = currentPath;
      lastSearchRef.current = currentSearch;

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
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

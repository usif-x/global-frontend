// hooks/useNavigationLoader.js
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "../components/providers/LoadingProvider";

export default function useNavigationLoader() {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    let loadingTimer;

    // Override Next.js router methods to show loading
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = async (...args) => {
      startLoading();
      loadingTimer = setTimeout(stopLoading, 5000); // Fallback timeout
      try {
        await originalPush.apply(router, args);
      } finally {
        clearTimeout(loadingTimer);
        // Small delay to ensure smooth transition
        setTimeout(stopLoading, 100);
      }
    };

    router.replace = async (...args) => {
      startLoading();
      loadingTimer = setTimeout(stopLoading, 5000);
      try {
        await originalReplace.apply(router, args);
      } finally {
        clearTimeout(loadingTimer);
        setTimeout(stopLoading, 100);
      }
    };

    router.back = () => {
      startLoading();
      loadingTimer = setTimeout(stopLoading, 3000);
      originalBack.apply(router);
      setTimeout(stopLoading, 500);
    };

    router.forward = () => {
      startLoading();
      loadingTimer = setTimeout(stopLoading, 3000);
      originalForward.apply(router);
      setTimeout(stopLoading, 500);
    };

    // Cleanup function
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      // Restore original methods
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [router, startLoading, stopLoading]);

  // Listen for browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      startLoading();
      setTimeout(stopLoading, 300);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startLoading, stopLoading]);
}

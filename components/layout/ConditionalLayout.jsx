"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ConditionalLayout = ({ children }) => {
  const pathname = usePathname();
  const [isNotFound, setIsNotFound] = useState(false);

  // المسارات التي لا تحتوي على Navbar و Footer
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = ["/login/", "/register/", "/not-found/"].includes(
    pathname || "",
  );
  const EnrollCourse = /^\/courses\/\d+\/enroll$/.test(pathname || "");

  useEffect(() => {
    // Check if it's the not-found page by looking for the 404 header
    const checkNotFound = () => {
      const h1 = document.querySelector("h1");
      if (h1 && h1.textContent.trim() === "404") {
        setIsNotFound(true);
      }
    };
    // Check immediately and after a short delay to ensure DOM is loaded
    checkNotFound();
    const timer = setTimeout(checkNotFound, 100);
    return () => clearTimeout(timer);
  }, []);

  // صفحات بدون تخطيط كامل
  if (isAdminRoute || isAuthRoute || EnrollCourse || isNotFound) {
    return <>{children}</>;
  }

  // صفحات التخطيط الكامل
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default ConditionalLayout;

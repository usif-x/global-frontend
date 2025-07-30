"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ConditionalLayout = ({ children }) => {
  const pathname = usePathname();

  // المسارات التي لا تحتوي على Navbar و Footer
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(pathname || "");

  // صفحات بدون تخطيط كامل
  if (isAdminRoute || isAuthRoute) {
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

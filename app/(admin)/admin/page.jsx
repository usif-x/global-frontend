"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminPage = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);
  const hasHydrated = useAuthStore((state) => state.hasHydrated); // 👈 NEW

  useEffect(() => {
    if (!hasHydrated) return; // 👈 wait until cookie is read

    if (!isAuthenticated) {
      router.replace("/admin/login");
    } else if (userType === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, userType, router]);

  return <div className="text-center py-10">Checking...</div>;
};

export default AdminPage;

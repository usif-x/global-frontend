"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function LogoutPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const processLogout = async () => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // 1. فقط استدعِ دالة logout من المتجر. هي ستحذف الكوكي.
        logout();

        // 2. أظهر رسالة نجاح
        await Swal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // 3. أعد التوجيه إلى الصفحة الرئيسية. لا حاجة لـ router.refresh().
        router.push("/");
      } else {
        // إذا ضغط المستخدم على "Cancel"، أعده للصفحة السابقة أو الرئيسية
        router.back();
      }
    };

    processLogout();
  }, [router, logout]); // الاعتماديات صحيحة

  // هذا المحتوى سيظهر لفترة وجيزة جدًا بينما يظهر مربع حوار Swal
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please confirm logout...</p>
      </div>
    </div>
  );
}

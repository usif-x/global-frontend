"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { postData } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function AdminLoginPage() {
  const adminLogin = useAuthStore((state) => state.adminLogin);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username_or_email.trim()) {
      newErrors.username_or_email = "Email or Username is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const data = await postData("/auth/admin/login", {
        username_or_email: formData.username_or_email.trim(),
        password: formData.password,
      });

      adminLogin({
        admin: {
          id: data.admin.id,
          name: data.admin.full_name,
          email: data.admin.email,
          role: "admin",
        },
        token: data.token,
      });

      toast.success("Admin login successful! Redirecting...");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      const message =
        error.response?.data?.detail || error.message || "Admin login failed.";
      toast.error(message);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Image Section */}
      <div className="relative w-full h-[250px] sm:h-56 md:h-64 lg:h-screen lg:w-1/2">
        <Image
          src="/image/admin-login.jpg"
          alt="Admin Background"
          fill
          priority
          className="object-cover object-center lg:object-center sm:rounded-b-3xl md:rounded-3xl lg:rounded-none"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/20 lg:bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 lg:hidden"></div>
      </div>

      {/* Login Form Section */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-4 py-6 sm:px-6 sm:py-8 lg:w-1/2 lg:px-8 lg:py-12 flex-grow lg:min-h-screen">
        <main className="w-full max-w-sm sm:max-w-md lg:max-w-lg px-2 sm:px-4 text-left">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="mb-2 sm:mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
              <Icon
                icon="mdi:shield-account"
                className="text-cyan-500 text-2xl sm:text-3xl lg:text-4xl"
              />
              <span>Admin Login</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 sm:space-y-5"
          >
            <Input
              icon="ic:twotone-email"
              dir="ltr"
              name="username_or_email"
              type="text"
              placeholder="Admin Email or Username"
              value={formData.username_or_email}
              onChange={handleInputChange}
              error={errors.username_or_email}
              color="turquoise"
              className="w-full text-sm sm:text-base"
              required
              disabled={isLoading}
              autoComplete="username"
            />

            <Input
              icon="solar:password-bold-duotone"
              dir="ltr"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              color="turquoise"
              className="w-full text-sm sm:text-base"
              required
              minLength={6}
              disabled={isLoading}
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                color="cyan"
                full
                text={isLoading ? "Signing In..." : "Sign In as Admin"}
                className="py-3 sm:py-4 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-2 sm:mt-4 flex flex-col items-center justify-center">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Not an admin?{" "}
              <Link
                href="/login"
                className="font-bold text-cyan-500 hover:text-cyan-600 transition-colors"
              >
                User Login
              </Link>
            </p>
            <Link
              href="/"
              className="text-xs mt-4 sm:text-sm text-brand-turquoise no-underline hover:underline hover:text-brand-turquoise/80 transition-colors font-bold"
            >
              Back To Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

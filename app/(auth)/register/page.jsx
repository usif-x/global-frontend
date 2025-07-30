"use client";

import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { postData } from "@/lib/axios"; // أو حسب مسار ملف axios.js عندك
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      const result = await postData("/auth/register", dataToSend); // ✅ باستخدام axios

      login({
        user: {
          name: result.user.full_name,
          email: result.user.email,
        },
        token: result.token,
      });

      await Swal.fire({
        title: "Success!",
        text: "You have registered successfully and are now logged in.",
        icon: "success",
        confirmButtonText: "Great!",
        timer: 2500,
        timerProgressBar: true,
      });

      router.push("/");
    } catch (error) {
      console.error("Registration error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Right Image Section */}
      <div className="relative w-full h-[250px] sm:rounded-b-3xl md:rounded-b-3xl lg:rounded-none sm:h-56 md:h-64 lg:h-screen lg:w-1/2">
        <Image
          src="/image/register.jpg"
          alt="Diver getting ready for a dive"
          fill
          priority
          className="object-cover object-center lg:object-center sm:rounded-b-3xl md:rounded-b-3xl lg:rounded-none"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/10 lg:hidden"></div>
      </div>

      {/* Left Form Section */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-4 py-8 lg:w-1/2 lg:px-8">
        <main className="w-full max-w-md px-4 text-left">
          <h1 className="mb-2 text-3xl lg:text-4xl font-bold text-gray-800 flex items-center space-x-4">
            <Icon icon="twemoji:diving-mask" width="40" />
            <span>Create Account</span>
          </h1>
          <p className="mb-8 text-base text-gray-500">
            Join our diving community by creating your account below.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              icon="mdi:account-outline"
              dir="ltr"
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              color="turquoise"
              required
              aria-label="Full Name"
              disabled={isLoading}
              className="w-full"
            />

            <Input
              icon="ic:twotone-email"
              dir="ltr"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              color="turquoise"
              required
              aria-label="Email"
              disabled={isLoading}
              className="w-full"
            />

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-4 sm:space-y-0">
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
                required
                minLength={6}
                aria-label="Password"
                disabled={isLoading}
                className="w-full"
              />

              <Input
                icon="ph:password-duotone"
                dir="ltr"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                color="turquoise"
                required
                aria-label="Confirm Password"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              color="yellow"
              full
              text={isLoading ? "Creating Account..." : "Create Account"}
              disabled={isLoading}
            />
          </form>

          <p className="mt-8 text-center text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-cyan-500 transition-colors hover:text-cyan-600"
            >
              Sign in here
            </Link>
          </p>

          <p className="mt-2 text-center">
            <Link
              href="/"
              className="text-sm font-bold text-black no-underline transition-colors hover:underline"
            >
              Back To Home
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}

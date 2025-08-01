"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { postData } from "@/lib/axios"; // أو المسار حسب مكان ملف axios.js
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { useState } from "react";
import { toast } from "react-toastify"; // Recommended for user feedback

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter(); // Initialize router for redirection
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state for button

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email address is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await postData("/auth/login", formData); // <-- استخدم axios helper

      if (data.user.is_blocked || !data.user.is_active) {
        toast.error(
          "Your account is blocked or inactive. Please contact support."
        );
        return;
      }

      login({
        user: data.user,
        token: data.token,
      });

      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Image Container */}
      <div className="relative w-full h-[250px] sm:rounded-b-3xl md:rounded-b-3xl lg:rounded-none sm:h-56 md:h-64 lg:h-screen lg:w-1/2">
        <Image
          src="/image/login.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center lg:object-center sm:rounded-b-3xl md:rounded-b-3xl lg:rounded-none"
          sizes="(max-width: 1024px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-black/10 lg:hidden"></div>
      </div>

      {/* Form Container */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-4 py-6 sm:px-6 sm:py-8 lg:w-1/2 lg:px-8 lg:py-12 flex-grow lg:min-h-screen">
        <main className="w-full max-w-sm sm:max-w-md lg:max-w-lg px-2 sm:px-4 text-left">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="mb-2 sm:mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
              <Icon
                icon="noto:diving-mask"
                className="text-2xl sm:text-3xl lg:text-4xl"
              />
              <span>Welcome Back!</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 sm:space-y-5"
          >
            <Input
              icon={"ic:twotone-email"}
              dir="ltr"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              color="turquoise"
              className="w-full text-sm sm:text-base"
              required
              aria-label="Email Address"
              disabled={isLoading}
            />
            <Input
              icon={"solar:password-bold-duotone"}
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
              aria-label="Password"
              minLength={6}
              disabled={isLoading}
            />

            <div className="pt-2">
              <Button
                type="submit"
                color="cyan"
                full
                text={isLoading ? "Signing In..." : "Sign In"}
                className="py-3 sm:py-4 text-sm sm:text-base font-medium"
                disabled={isLoading}
              />
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 flex flex-col items-center justify-center">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-brand-turquoise no-underline hover:text-brand-turquoise/80 transition-colors text-yellow-500"
              >
                Sign up Now!
              </Link>
            </p>

            <Link
              href="/"
              className="text-xs sm:text-sm text-brand-turquoise no-underline hover:underline hover:text-brand-turquoise/80 transition-colors font-bold"
            >
              Back To Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userType = authStore.userType;

  const user =
    userType === "user"
      ? authStore.user
      : userType === "admin"
      ? authStore.admin
      : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const TripsDropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        TripsDropdownRef.current &&
        !TripsDropdownRef.current.contains(event.target) &&
        coursesDropdownRef.current &&
        !coursesDropdownRef.current.contains(event.target) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(null);
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  const handleMobileMenuLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDropdownOpen((prev) => !prev);
    setIsDropdownOpen(null);
  };

  const handleProfileDropdownClose = () => {
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-4 z-[1000] left-2 right-2 md:left-0 md:right-0 w-[calc(100%-1rem)] md:w-[85%] lg:w-[80%] mx-auto rounded-2xl md:rounded-3xl transition-all duration-500 ease-out ${
          hasScrolled || isMobileMenuOpen
            ? "bg-gray-900/90 backdrop-blur-2xl shadow-2xl border border-white/10"
            : "bg-black/20 backdrop-blur-sm border border-white/5"
        }`}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex justify-between items-center py-3 px-4 md:px-8">
          {/* Left: Logo */}
          <Link
            href="/"
            onClick={handleMobileMenuLinkClick}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <Image
                src="/image/logo.png"
                alt="Global Divers Logo"
                width={40}
                height={40}
                className="md:w-[45px] md:h-[45px] transition-transform duration-300 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
            </div>
          </Link>

          {/* ======================================= */}
          {/* == Middle: Desktop Navigation Links === */}
          {/* ======================================= */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8 text-white text-sm font-medium">
            <li>
              <Link href="/" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Home
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>
            <li>
              <Link href="/destinations" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Destinations
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>

            <li>
              <Link href="/dive-sites" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Dive Sites
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>

            <li>
              <Link href="/packages" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Packages
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>

            {/* Trips Link */}
            <li>
              <Link href="/trips" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Trips
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>

            {/* Courses Link */}
            <li>
              <Link href="/courses" className="relative group py-2 px-1">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-cyan-300">
                  Courses
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            </li>

            {/* Dive Sites Link */}
          </ul>

          {/* Right: Desktop Login/Register/Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-white font-medium py-2 px-4 hover:text-cyan-300 transition-all duration-300 text-sm relative group"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-white/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
                <Link
                  href="/register"
                  className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-2.5 px-6 rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-sm transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                >
                  <span className="relative z-10">Register</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            ) : isMounted ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="relative">
                    <Image
                      src="/image/profile.png"
                      alt="profile image"
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-cyan-400/30 group-hover:ring-cyan-400/60 transition-all duration-300"
                      priority
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`w-4 h-4 text-white/70 transition-all duration-300 ${
                      isProfileDropdownOpen
                        ? "rotate-180 text-cyan-300"
                        : "group-hover:text-white"
                    }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl py-3 z-50 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/image/profile.png"
                          alt="profile image"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="text-white">
                          <p>{user?.full_name}</p>
                          <p className="text-sm opacity-75">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      {userType === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-200 hover:text-cyan-300"
                          onClick={handleProfileDropdownClose}
                        >
                          <Icon
                            icon="lucide:settings"
                            className="w-[18px] h-[18px] opacity-70"
                          />
                          Admin Dashboard
                        </Link>
                      ) : userType === "user" ? (
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-200 hover:text-cyan-300"
                          onClick={handleProfileDropdownClose}
                        >
                          <Icon
                            icon="lucide:user"
                            className="w-[18px] h-[18px] opacity-70"
                          />
                          My Account
                        </Link>
                      ) : null}
                    </div>

                    <hr className="border-white/10 my-2" />

                    <Link
                      href="/logout"
                      onClick={handleProfileDropdownClose}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all duration-200 hover:text-red-300 text-left"
                    >
                      <Icon
                        icon="lucide:log-out"
                        className="w-[18px] h-[18px] opacity-70"
                      />
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile: Menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <Icon icon="lucide:x" className="w-6 h-6" />
              ) : (
                <Icon icon="lucide:menu" className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[999] transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl"></div>
        <div
          className={`relative h-full flex flex-col justify-center transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? "translate-y-0" : "translate-y-8"
          }`}
        >
          <div className="px-6 py-8">
            {/* ======================================= */}
            {/* ====== Mobile Navigation Links ====== */}
            {/* ======================================= */}
            <ul className="text-center space-y-6 mb-8">
              <li>
                <Link
                  href="/"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Destinations</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
              <li>
                <Link
                  href="/dive-sites"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Dive Sites</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Packages</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
              <li>
                <Link
                  href="/trips"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Trips</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="block text-2xl md:text-3xl text-white hover:text-cyan-300 transition-all duration-300 py-2 relative group"
                  onClick={handleMobileMenuLinkClick}
                >
                  <span className="relative z-10">Courses</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
              </li>
            </ul>

            {/* Mobile Auth Section */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center gap-4 mt-8">
                <Link
                  href="/login"
                  className="text-white font-medium py-3 px-8 text-xl border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 w-48 text-center"
                  onClick={handleMobileMenuLinkClick}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full text-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 w-48 text-center shadow-lg"
                  onClick={handleMobileMenuLinkClick}
                >
                  Register
                </Link>
              </div>
            ) : isMounted ? (
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Image
                    src="/image/profile.png"
                    alt="profile image"
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-cyan-400/30"
                    priority
                  />
                  <div className="text-white">
                    <p>{user?.full_name}</p>
                    <p className="text-sm opacity-75">{user?.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {userType === "admin" ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 justify-center text-white font-medium py-3 px-6 text-lg border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
                      onClick={handleMobileMenuLinkClick}
                    >
                      <Icon icon="lucide:settings" className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  ) : userType === "user" ? (
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 justify-center text-white font-medium py-3 px-6 text-lg border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
                      onClick={handleMobileMenuLinkClick}
                    >
                      <Icon icon="lucide:user" className="w-5 h-5" />
                      My Account
                    </Link>
                  ) : null}
                  <Link
                    href="/logout"
                    className="flex items-center gap-3 justify-center text-red-400 font-medium py-3 px-6 text-lg border border-red-400/20 rounded-full hover:bg-red-500/10 transition-all duration-300"
                    onClick={handleMobileMenuLinkClick}
                  >
                    <Icon icon="lucide:log-out" className="w-5 h-5" />
                    Logout
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

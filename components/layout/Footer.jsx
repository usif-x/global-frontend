"use client";

import WavesArea from "@/components/ui/Wave";
import { Icon } from "@iconify/react";
import Link from "next/link";
import WeatherWidget from "./WeatherWidget";

export default function Home() {
  return (
    <div>
      <WavesArea
        className="h-auto mt-8"
        position="top"
        backgroundColor="#06b6d4"
        textColor="white"
        waveColor="#ffffff"
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2
            style={{ fontSize: "2rem", marginBottom: "1rem" }}
            className="font-summer-splash text-center"
          >
            READY TO DIVE ?
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Join us for an unforgettable underwater adventure
          </p>
        </div>

        {/* Footer added directly inside */}
        <footer className="mt-16 pt-8 pb-6 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-bold mb-4 text-white">
                  About Top Divers Hurghada
                </h3>
                <p className="text-white/80 mb-4 leading-relaxed">
                  Our dive base is managed and supervised by a professional team
                  of egyptain crew, toghether with english and german speaking
                  instructors. We have made it to our mission to meet the
                  requirements and the expectations of our guests needs
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/topdivers.hurghada"
                    className="text-white/60 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon icon="mdi:instagram" width={24} height={24} />
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">
                  Contact Us
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon
                      icon="mdi:email"
                      width={18}
                      height={18}
                      className="text-white/60"
                    />
                    <span className="text-white/80 text-sm">
                      contact@topdivers.online
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon
                      icon="mdi:map-marker"
                      width={18}
                      height={18}
                      className="text-white/60 mt-1"
                    />
                    <span className="text-white/80 text-sm">
                      Sunrise Aqua Joy
                      <br />
                      Egypt Hurghada
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon
                      icon="mdi:phone"
                      width={18}
                      height={18}
                      className="text-white/60"
                    />
                    <span className="text-white/80 text-sm">
                      +20 107 044 0861
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">
                  Quick Links
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/packages"
                    className="block text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Dive Packages
                  </Link>
                  <Link
                    href="/trips"
                    className="block text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Daily Trips
                  </Link>
                  <Link
                    href="/courses"
                    className="block text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Diving Courses
                  </Link>
                  <Link
                    href="/destinations"
                    className="block text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Destinations
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Weather Widget */}
              <WeatherWidget />
            </div>

            {/* Payment Methods */}
            <div className="py-6 border-y border-white/20">
              <h4 className="text-lg font-semibold mb-4 text-white text-center">
                We Accept
              </h4>
              <div className="flex flex-wrap justify-center items-center gap-4">
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/visa-svgrepo-com.svg"
                    alt="Visa"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/mastercard-svgrepo-com.svg"
                    alt="Mastercard"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/applepay-svgrepo-com.svg"
                    alt="Apple Pay"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/Meeza.svg"
                    alt="Meeza"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/mobile-wallet.png"
                    alt="Mobile Wallet"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-16 h-10 flex items-center justify-center">
                  <img
                    src="/image/cash-money.jpg"
                    alt="Cash"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm mb-2 md:mb-0">
                © {new Date().getFullYear()} Top Divers. All rights reserved.
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-sm text-white/60">
                <div className="flex space-x-6 mb-2 md:mb-0">
                  <Link
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-white transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                  <Link
                    href="/safety-guidelines"
                    className="hover:text-white transition-colors"
                  >
                    Safety Guidelines
                  </Link>
                </div>
                <span className="text-white/40">|</span>
                <a
                  href="https://api.whatsapp.com/send?phone=201070440861&text=Hello!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Built by <strong>Yousseif</strong>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </WavesArea>
    </div>
  );
}

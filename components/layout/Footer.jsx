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

        {/* Responsive Footer */}
        <footer className="mt-16 pt-8 pb-6 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Footer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
              {/* Company Info - Full width on mobile, spans 2 cols on large screens */}
              <div className="lg:col-span-2">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">
                  About Top Divers Hurghada
                </h3>
                <p className="text-white/80 mb-4 leading-relaxed text-sm sm:text-base">
                  Our dive base is managed and supervised by a highly
                  professional Egyptian team with extensive experience in the
                  diving industry. Our mission is to meet — and exceed — the
                  needs and expectations of our guests by delivering safe,
                  high-quality services and unforgettable diving experiences.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/topdivers.hurghada"
                    className="text-white/60 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Icon icon="mdi:instagram" width={24} height={24} />
                  </a>
                  <a
                    href="https://api.whatsapp.com/send?phone=201070440861"
                    className="text-white/60 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <Icon icon="mdi:whatsapp" width={24} height={24} />
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
                  Contact Us
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon
                      icon="mdi:email"
                      width={18}
                      height={18}
                      className="text-white/60 flex-shrink-0"
                    />
                    <a
                      href="mailto:contact@topdivers.online"
                      className="text-white/80 text-sm hover:text-white transition-colors break-all"
                    >
                      contact@topdivers.online
                    </a>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon
                      icon="mdi:map-marker"
                      width={18}
                      height={18}
                      className="text-white/60 mt-1 flex-shrink-0"
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
                      className="text-white/60 flex-shrink-0"
                    />
                    <a
                      href="tel:+201070440861"
                      className="text-white/80 text-sm hover:text-white transition-colors"
                    >
                      +20 107 044 0861
                    </a>
                  </div>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="sm:col-span-2 lg:col-span-1">
                <WeatherWidget />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="py-6 border-y border-white/20">
              <h4 className="text-base sm:text-lg font-semibold mb-4 text-white text-center">
                We Accept
              </h4>
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/visa-svgrepo-com.svg"
                    alt="Visa"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/mastercard-svgrepo-com.svg"
                    alt="Mastercard"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/applepay-svgrepo-com.svg"
                    alt="Apple Pay"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/Meeza.svg"
                    alt="Meeza"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/mobile-wallet.png"
                    alt="Mobile Wallet"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white rounded-lg p-2 w-14 h-9 sm:w-16 sm:h-10 flex items-center justify-center">
                  <img
                    src="/image/cash-money.jpg"
                    alt="Cash"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-xs sm:text-sm text-center sm:text-left">
                © {new Date().getFullYear()} Top Divers Hurghada. All rights
                reserved.
              </p>
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/60">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <Link
                    href="/privacy-policy"
                    className="hover:text-white transition-colors whitespace-nowrap"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-white transition-colors whitespace-nowrap"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/safety-guidelines"
                    className="hover:text-white transition-colors whitespace-nowrap"
                  >
                    Safety
                  </Link>
                </div>
                <span className="text-white/40 hidden sm:inline">|</span>
                <a
                  href="https://showjoe.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  Built by <strong>Joe</strong>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </WavesArea>
    </div>
  );
}

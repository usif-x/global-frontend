"use client";

import WavesArea from "@/components/ui/Wave";
import { Icon } from "@iconify/react";
import Link from "next/link";

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
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
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
                    href="#"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Icon icon="mdi:facebook" width={20} height={20} />
                  </a>
                  <a
                    href="#"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Icon icon="mdi:instagram" width={20} height={20} />
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
                      icon="mdi:phone"
                      width={16}
                      height={16}
                      className="text-white/60"
                    />
                    <span className="text-white/80">+1 (555) 123-DIVE</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon
                      icon="mdi:email"
                      width={16}
                      height={16}
                      className="text-white/60"
                    />
                    <span className="text-white/80">info@topdivers.online</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon
                      icon="mdi:map-marker"
                      width={16}
                      height={16}
                      className="text-white/60 mt-1"
                    />
                    <span className="text-white/80">
                      Sunrise Aqua Joy
                      <br />
                      Egypt Hurghada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center">
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
                  href="https://yousseif.vercel.app"
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

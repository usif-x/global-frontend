"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-sky-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: 'url("/image/notfound.jpg")',
        }}
      />
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/60 z-0 backdrop-blur-sm" />{" "}
      {/* <-- UPDATED */}
      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* 404 header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl px-8 py-4 shadow-2xl border border-white/20 inline-block">
            <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
              404
            </h1>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
            Oops! You're Off the Map
          </h2>
          <p className="text-lg md:text-xl text-sky-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            The page you're looking for seems to have drifted away. Don't worry,
            we'll help you navigate back to safe waters!
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 border border-sky-400"
          >
            <Icon icon="lucide:home" className="w-5 h-5" />
            Back to Home
            <Icon
              icon="lucide:arrow-right"
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/trips"
            className="group bg-white/90 hover:bg-white text-sky-800 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20 flex items-center gap-2 backdrop-blur-sm"
          >
            <Icon icon="lucide:waves" className="w-5 h-5" />
            Browse Trips
            <Icon
              icon="lucide:arrow-right"
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Quote */}
        <div className="mt-8 text-center">
          <p className="text-sky-300 text-sm italic opacity-90 drop-shadow-sm">
            "Not all who wander are lost... but this page definitely is! 🌊"
          </p>
        </div>
      </div>
      {/* Floating Icons */}
      <div className="fixed top-20 left-10 animate-bounce opacity-30">
        <Icon icon="lucide:fish" className="w-8 h-8 text-sky-300" />
      </div>
      <div
        className="fixed top-40 right-16 animate-bounce opacity-20"
        style={{ animationDelay: "1s" }}
      >
        <Icon icon="lucide:anchor" className="w-6 h-6 text-sky-400" />
      </div>
      <div
        className="fixed bottom-32 left-20 animate-bounce opacity-20"
        style={{ animationDelay: "2s" }}
      >
        <Icon icon="lucide:ship" className="w-7 h-7 text-sky-400" />
      </div>
      <div
        className="fixed bottom-20 right-10 animate-bounce opacity-30"
        style={{ animationDelay: "0.5s" }}
      >
        <Icon icon="lucide:compass" className="w-6 h-6 text-sky-300" />
      </div>
    </div>
  );
}

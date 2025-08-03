"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const Hero = ({
  slides = [
    {
      backgroundImageUrl: "/image/hero-bg2.jpg",
      title: "Global Divers",
      subtitle: "Experience the Red Sea's Beauty",
      description:
        "Book your dive today and get ready for an unforgettable adventure!",
      buttonText: "Book A Dive",
      buttonLink: "/trips",
    },
    {
      backgroundImageUrl: "/image/hero-bg.jpg",
      title: "Discover Underwater",
      subtitle: "Explore Marine Life",
      description:
        "Dive into crystal clear waters and discover the vibrant marine ecosystem of the Red Sea.",
      buttonText: "View Courses",
      buttonLink: "/courses",
    },
    {
      backgroundImageUrl: "/image/hero-bg3.jpg",
      title: "Adventure Awaits",
      subtitle: "Professional Diving",
      description:
        "Join our certified instructors for safe and exciting diving experiences in Hurghada.",
      buttonText: "Learn More",
      buttonLink: "/packages",
    },
  ],
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsContentVisible(false);

    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
      setTimeout(() => {
        setIsContentVisible(true);
        setIsTransitioning(false);
      }, 100);
    }, 400);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsContentVisible(false);

    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setProgress(0);
      setTimeout(() => {
        setIsContentVisible(true);
        setIsTransitioning(false);
      }, 100);
    }, 400);
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback(
    (index) => {
      if (index !== currentSlide && !isTransitioning) {
        setIsTransitioning(true);
        setIsContentVisible(false);

        setTimeout(() => {
          setCurrentSlide(index);
          setProgress(0);
          setTimeout(() => {
            setIsContentVisible(true);
            setIsTransitioning(false);
          }, 100);
        }, 400);
      }
    },
    [currentSlide, isTransitioning]
  );

  // Auto-play functionality with progress
  useEffect(() => {
    let progressInterval;
    let slideInterval;

    if (!isTransitioning) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + 100 / (autoPlayInterval / 50);
        });
      }, 50);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [currentSlide, isTransitioning, autoPlayInterval, nextSlide]);

  const styles = `
    @keyframes slideInFromBottom {
      from { 
        opacity: 0;
        transform: translate3d(0, 60px, 0);
      }
      to { 
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes slideInFromLeft {
      from { 
        opacity: 0;
        transform: translate3d(-80px, 0, 0);
      }
      to { 
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes slideInFromRight {
      from { 
        opacity: 0;
        transform: translate3d(80px, 0, 0);
      }
      to { 
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes scaleInLine {
      from { 
        opacity: 0;
        transform: scaleX(0) translateZ(0);
      }
      to { 
        opacity: 1;
        transform: scaleX(1) translateZ(0);
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -10px, 0); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translate3d(0, 30px, 0);
      }
      to { 
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes zoomIn {
      from { 
        opacity: 0;
        transform: scale(0.9) translateZ(0);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateZ(0);
      }
    }

    @keyframes fadeInScale {
      from { 
        opacity: 0;
        transform: scale(0.8) translateZ(0);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateZ(0);
      }
    }
    
    .animate-slideInFromBottom {
      animation: slideInFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .animate-slideInFromLeft {
      animation: slideInFromLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-slideInFromRight {
      animation: slideInFromRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .animate-scaleInLine {
      animation: scaleInLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform-origin: left center;
    }
    
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }

    .animate-shimmer {
      animation: shimmer 2s infinite;
    }

    .animate-pulse-slow {
      animation: pulse 3s ease-in-out infinite;
    }

    .animate-slideUp {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-zoomIn {
      animation: zoomIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-fadeInScale {
      animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .animate-delay-100 { animation-delay: 0.1s; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-300 { animation-delay: 0.3s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-500 { animation-delay: 0.5s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-700 { animation-delay: 0.7s; }
    .animate-delay-800 { animation-delay: 0.8s; }
    
    .text-shadow-sharp {
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.9), 
        0 4px 8px rgba(0, 0, 0, 0.7),
        0 8px 16px rgba(0, 0, 0, 0.3);
    }
    
    .text-shadow-soft {
      text-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.8), 
        0 4px 16px rgba(0, 0, 0, 0.4);
    }
    
    .glass-morphism {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .glass-button {
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
    }

    .slide-transition {
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .slide-active {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }

    .slide-inactive {
      opacity: 0;
      transform: scale(1.1) translateZ(0);
    }

    .content-transition {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .content-visible {
      opacity: 1;
      transform: translateY(0) translateZ(0);
    }

    .content-hidden {
      opacity: 0;
      transform: translateY(20px) translateZ(0);
    }

    .parallax-element {
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }

    .button-glow {
      box-shadow: 
        0 0 20px rgba(255, 255, 255, 0.1),
        0 0 40px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .button-glow:hover {
      box-shadow: 
        0 0 30px rgba(255, 255, 255, 0.2),
        0 0 60px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .progress-bar {
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.8) 0%, 
        rgba(255, 255, 255, 0.4) 100%);
    }

    /* Performance optimizations */
    .gpu-accelerated {
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
      .animate-slideInFromLeft, .animate-slideInFromBottom {
        animation-duration: 0.6s;
      }
      
      .text-shadow-sharp {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px rgba(0, 0, 0, 0.8);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="relative min-h-screen h-screen w-full overflow-hidden">
        {/* Background Images with improved transitions */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center slide-transition gpu-accelerated ${
              index === currentSlide ? "slide-active" : "slide-inactive"
            }`}
            style={{
              backgroundImage: `url('${slide.backgroundImageUrl}')`,
              backgroundAttachment: "fixed",
            }}
          >
            {/* Enhanced gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10"></div>
          </div>
        ))}

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float opacity-0 animate-fadeInScale gpu-accelerated"
              style={{
                top: `${20 + i * 15}%`,
                right: `${10 + i * 5}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <div
              className={`max-w-5xl content-transition ${
                isContentVisible ? "content-visible" : "content-hidden"
              }`}
            >
              {/* Main Title */}
              <div className="mb-6 overflow-hidden">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black tracking-tight text-shadow-sharp leading-none">
                  {slides[currentSlide].title.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className={`block text-white animate-slideInFromLeft opacity-0 gpu-accelerated`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="mb-8 overflow-hidden">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-white/95 text-shadow-soft tracking-wide leading-tight animate-slideInFromRight animate-delay-300 opacity-0 gpu-accelerated">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Animated accent line */}
              <div className="relative mb-10 overflow-hidden">
                <div className="w-32 sm:w-40 md:w-48 h-0.5 bg-gradient-to-r from-white via-white/80 to-transparent animate-scaleInLine animate-delay-400 opacity-0 gpu-accelerated">
                  <div className="absolute inset-0 bg-white/60 blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-12 overflow-hidden">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white/90 leading-relaxed max-w-3xl text-shadow-soft animate-slideInFromBottom animate-delay-500 opacity-0 gpu-accelerated">
                  {slides[currentSlide].description}
                </p>
              </div>

              {/* Enhanced CTA Button */}
              <div className="animate-fadeInScale animate-delay-600 opacity-0 gpu-accelerated">
                <Link
                  href={slides[currentSlide].buttonLink}
                  className="group relative inline-flex items-center gap-4 glass-button button-glow text-white font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-full transition-all duration-500 transform hover:scale-105 overflow-hidden border border-white/30 hover:border-white/50"
                >
                  {/* Background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                  {/* Button content */}
                  <span className="relative z-10 text-sm sm:text-base md:text-lg tracking-wide">
                    {slides[currentSlide].buttonText}
                  </span>
                  <div className="relative z-10 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-90">
                    <svg
                      className="w-4 h-4 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 glass-morphism rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg
            className="w-6 h-6 text-white transition-transform duration-300 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 glass-morphism rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg
            className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Enhanced Slide Indicators with Progress */}
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              disabled={isTransitioning}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70 hover:scale-110"
                }`}
              />
              {index === currentSlide && (
                <div className="absolute inset-0 rounded-full border-2 border-white/30">
                  <div
                    className="absolute inset-0 rounded-full progress-bar"
                    style={{
                      clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-slideUp animate-delay-800 opacity-0 z-20">
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <span className="text-white/70 text-xs sm:text-sm font-light tracking-widest uppercase transition-colors duration-300 group-hover:text-white">
              Scroll
            </span>
            <div className="w-6 h-10 glass-morphism rounded-full flex justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-110">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;

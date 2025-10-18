"use client";
import { useCallback, useEffect, useState } from "react";

const Hero = ({
  slides = [
    {
      backgroundImageUrl: "/image/hero-bg2.jpg",
      title: "Top Divers",
      subtitle: "Experience the Red Sea's Beauty with TopDivers",
      description:
        "Book your dive today and get ready for an unforgettable adventure!",
      buttonText: "Book A Trip",
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

  useEffect(() => {
    let progressInterval;

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

    @keyframes kenburns {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.08) translate(-2%, -2%); }
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

    .animate-slideUp {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-fadeInScale {
      animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-kenburns {
      animation: kenburns 20s ease-out infinite alternate;
    }

    .animate-delay-100 { animation-delay: 0.1s; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-300 { animation-delay: 0.3s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-500 { animation-delay: 0.5s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-700 { animation-delay: 0.7s; }
    .animate-delay-800 { animation-delay: 0.8s; }

    .text-shadow-luxury {
      text-shadow:
        0 2px 4px rgba(0, 0, 0, 1),
        0 4px 8px rgba(0, 0, 0, 0.95),
        0 8px 16px rgba(0, 0, 0, 0.8),
        0 16px 32px rgba(0, 0, 0, 0.6),
        0 32px 64px rgba(0, 0, 0, 0.4);
    }

    .text-shadow-sharp {
      text-shadow:
        0 4px 8px rgba(0, 0, 0, 0.95),
        0 8px 16px rgba(0, 0, 0, 0.8),
        0 16px 32px rgba(0, 0, 0, 0.6);
    }

    .glass-morphism-premium {
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 100%);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.6),
        0 6px 20px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .luxury-glass {
      backdrop-filter: blur(35px) saturate(200%);
      -webkit-backdrop-filter: blur(35px) saturate(200%);
      background: linear-gradient(135deg, 
        rgba(0, 0, 0, 0.45) 0%, 
        rgba(0, 0, 0, 0.25) 50%, 
        rgba(0, 0, 0, 0.15) 100%);
      border: 2px solid rgba(255, 255, 255, 0.12);
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.7),
        0 10px 30px rgba(0, 0, 0, 0.5),
        inset 0 2px 0 rgba(255, 255, 255, 0.12),
        inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    }

    .slide-transition {
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .slide-active {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }

    .slide-inactive {
      opacity: 0;
      transform: scale(1.05) translateZ(0);
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

    .button-glow-premium {
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.6),
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(255, 255, 255, 0.08),
        inset 0 2px 0 rgba(255, 255, 255, 0.15),
        inset 0 -2px 0 rgba(0, 0, 0, 0.25);
    }

    .button-glow-premium:hover {
      box-shadow:
        0 16px 48px rgba(0, 0, 0, 0.7),
        0 8px 24px rgba(0, 0, 0, 0.5),
        0 0 40px rgba(255, 255, 255, 0.15),
        inset 0 2px 0 rgba(255, 255, 255, 0.2),
        inset 0 -2px 0 rgba(0, 0, 0, 0.3);
    }

    .progress-bar {
      background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.5) 100%);
    }

    .gpu-accelerated {
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }

    /* Mobile responsiveness improvements */
    @media (max-width: 640px) {
      .animate-slideInFromLeft, .animate-slideInFromBottom {
        animation-duration: 0.6s;
      }
      
      .text-shadow-luxury {
        text-shadow:
          0 2px 4px rgba(0, 0, 0, 1),
          0 4px 8px rgba(0, 0, 0, 0.9),
          0 8px 16px rgba(0, 0, 0, 0.7);
      }
      
      .text-shadow-sharp {
        text-shadow:
          0 2px 4px rgba(0, 0, 0, 0.9),
          0 4px 8px rgba(0, 0, 0, 0.7);
      }
    }

    @media (max-width: 480px) {
      .glass-morphism-premium, .luxury-glass {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      
      .button-glow-premium {
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.6),
          0 2px 8px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

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
      <section className="relative min-h-screen h-screen w-full overflow-hidden bg-black">
        {/* Background Images with Ken Burns effect */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 slide-transition gpu-accelerated ${
              index === currentSlide ? "slide-active" : "slide-inactive"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center ${
                index === currentSlide ? "animate-kenburns" : ""
              }`}
              style={{
                backgroundImage: `url('${slide.backgroundImageUrl}')`,
                backgroundPosition: "center center",
              }}
            />

            {/* Refined gradient overlays for better image visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-black/20 to-black/60"></div>
          </div>
        ))}

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float opacity-0 animate-fadeInScale gpu-accelerated"
              style={{
                top: `${15 + i * 12}%`,
                right: `${5 + i * 8}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${5 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div
              className={`max-w-4xl lg:max-w-5xl xl:max-w-6xl content-transition ${
                isContentVisible ? "content-visible" : "content-hidden"
              }`}
            >
              {/* Responsive Main Title */}
              <div className="mb-4 sm:mb-6 md:mb-8 overflow-hidden">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight text-shadow-luxury leading-[0.85] uppercase">
                  {slides[currentSlide].title.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className={`block text-white animate-slideInFromLeft opacity-0 gpu-accelerated relative`}
                      style={{
                        animationDelay: `${index * 0.15}s`,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {word}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-white/4 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
                    </span>
                  ))}
                </h1>
              </div>

              {/* Responsive Subtitle */}
              <div className="mb-6 sm:mb-8 md:mb-10 overflow-hidden">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-white text-shadow-sharp tracking-wide leading-relaxed animate-slideInFromRight animate-delay-300 opacity-0 gpu-accelerated">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Responsive accent lines */}
              <div className="relative mb-6 sm:mb-8 md:mb-10 overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                  <div className="w-24 sm:w-32 md:w-40 lg:w-48 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-white via-white/90 to-white/20 animate-scaleInLine animate-delay-400 opacity-0 gpu-accelerated relative">
                    <div className="absolute inset-0 bg-white/50 blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-fadeInScale animate-delay-500 opacity-0 shadow-lg shadow-white/50"></div>
                  <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-white/70 to-transparent animate-scaleInLine animate-delay-600 opacity-0 gpu-accelerated"></div>
                </div>
              </div>

              {/* Responsive Description */}
              <div className="mb-8 sm:mb-10 md:mb-12 overflow-hidden">
                <div className="glass-morphism-premium p-4 sm:p-6 md:p-8 max-w-3xl lg:max-w-4xl animate-slideInFromBottom animate-delay-700 opacity-0 gpu-accelerated rounded-sm">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-white leading-relaxed text-shadow-sharp tracking-wide">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>

              {/* Responsive CTA Button */}
              <div className="animate-fadeInScale animate-delay-800 opacity-0 gpu-accelerated">
                <a
                  href={slides[currentSlide].buttonLink}
                  className="group relative inline-flex items-center gap-3 sm:gap-4 md:gap-6 luxury-glass button-glow-premium text-white font-bold py-3 sm:py-4 md:py-6 px-6 sm:px-8 md:px-12 transition-all duration-700 transform hover:scale-105 overflow-hidden border-2 border-white/20 hover:border-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-sm"
                >
                  {/* Enhanced shimmer effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1200"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-300%] group-hover:translate-x-[300%] transition-transform duration-1500"></div>

                  <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg tracking-[0.1em] sm:tracking-[0.15em] font-semibold">
                    {slides[currentSlide].buttonText}
                  </span>
                  <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-500 group-hover:rotate-90 shadow-lg">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>

                  <div className="absolute inset-1 bg-gradient-to-r from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-3 sm:left-4 md:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 luxury-glass flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed group border-2 border-white/20 hover:border-white/30 rounded-sm"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white transition-transform duration-500 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-3 sm:right-4 md:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 luxury-glass flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed group border-2 border-white/20 hover:border-white/30 rounded-sm"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white transition-transform duration-500 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Responsive Slide Indicators with Progress */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-3 sm:space-x-4 md:space-x-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              disabled={isTransitioning}
            >
              <div
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-all duration-500 rounded-sm ${
                  index === currentSlide
                    ? "bg-white scale-125 shadow-lg shadow-white/50"
                    : "bg-white/40 hover:bg-white/70 hover:scale-110"
                }`}
              />
              {index === currentSlide && (
                <div className="absolute inset-0 border-2 border-white/50 rounded-sm">
                  <div
                    className="absolute inset-0 progress-bar rounded-sm"
                    style={{
                      clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                    }}
                  />
                </div>
              )}
              <div
                className={`absolute inset-0 bg-white/30 blur-md transition-opacity duration-500 rounded-sm ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              ></div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

export default Hero;

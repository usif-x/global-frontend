"use client";
import { useCallback, useEffect, useState } from "react";

const Hero = ({
  slides = [
    {
      backgroundImageUrl: "/image/hero-bg2.jpg",
      title: "TopDivers",
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
    {
      backgroundImageUrl: "/image/hero-bg4.png",
      title: "Discover the Desert",
      subtitle: "Unforgettable Safari Adventures",
      description:
        "Experience the thrill of the desert with exciting safari tours, breathtaking sunsets, Bedouin culture, and memories that will last a lifetime.",
      buttonText: "Book Your Safari",
      buttonLink: "/trips",
    },
    {
      backgroundImageUrl: "/image/hero-bg5.png",
      title: "Dive Into Wonder",
      subtitle: "Snorkeling Adventures",
      description:
        "Glide through crystal-clear waters and discover vibrant coral reefs teeming with marine life, all just beneath the surface.",
      buttonText: "View Tours",
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
    [currentSlide, isTransitioning],
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
      from { opacity: 0; transform: translate3d(0, 60px, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }

    @keyframes slideInFromLeft {
      from { opacity: 0; transform: translate3d(-80px, 0, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }

    @keyframes slideInFromRight {
      from { opacity: 0; transform: translate3d(80px, 0, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }

    @keyframes scaleInLine {
      from { opacity: 0; transform: scaleX(0) translateZ(0); }
      to { opacity: 1; transform: scaleX(1) translateZ(0); }
    }

    @keyframes float {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -10px, 0); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.8) translateZ(0); }
      to { opacity: 1; transform: scale(1) translateZ(0); }
    }

    @keyframes kenburns {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.08) translate(-2%, -2%); }
    }

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
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      background: linear-gradient(135deg, rgba(6, 20, 28, 0.45) 0%, rgba(6, 20, 28, 0.2) 100%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.5),
        0 6px 20px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      border-radius: 14px;
    }

    .luxury-glass {
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      background: linear-gradient(135deg,
        rgba(8, 28, 38, 0.55) 0%,
        rgba(8, 28, 38, 0.32) 50%,
        rgba(8, 28, 38, 0.18) 100%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.55),
        0 10px 25px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
      border-radius: 999px;
    }

    .slide-transition {
      transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .slide-active { opacity: 1; transform: scale(1) translateZ(0); }
    .slide-inactive { opacity: 0; transform: scale(1.05) translateZ(0); }

    .content-transition {
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .content-visible { opacity: 1; transform: translateY(0) translateZ(0); }
    .content-hidden { opacity: 0; transform: translateY(20px) translateZ(0); }

    .button-glow-premium {
      box-shadow:
        0 8px 28px rgba(0, 0, 0, 0.5),
        0 0 22px rgba(56, 189, 248, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.14);
      transition: box-shadow 0.5s ease, transform 0.4s ease;
    }

    .button-glow-premium:hover {
      box-shadow:
        0 16px 40px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(56, 189, 248, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .progress-bar {
      background: linear-gradient(90deg, rgba(103, 232, 249, 0.95) 0%, rgba(255, 255, 255, 0.6) 100%);
    }

    .gpu-accelerated { transform: translate3d(0, 0, 0); will-change: transform; }

    .animate-slideInFromBottom { animation: slideInFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slideInFromLeft { animation: slideInFromLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slideInFromRight { animation: slideInFromRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-scaleInLine { animation: scaleInLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: left center; }
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-shimmer { animation: shimmer 2s infinite; }
    .animate-fadeInScale { animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .animate-delay-100 { animation-delay: 0.1s; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-300 { animation-delay: 0.3s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-500 { animation-delay: 0.5s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-700 { animation-delay: 0.7s; }
    .animate-delay-800 { animation-delay: 0.8s; }

    @media (max-width: 640px) {
      .animate-slideInFromLeft, .animate-slideInFromBottom { animation-duration: 0.6s; }
      .text-shadow-luxury {
        text-shadow: 0 2px 4px rgba(0,0,0,1), 0 4px 8px rgba(0,0,0,0.9), 0 8px 16px rgba(0,0,0,0.7);
      }
      .text-shadow-sharp {
        text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7);
      }
    }

    @media (max-width: 480px) {
      .glass-morphism-premium, .luxury-glass {
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
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
      <section className="relative min-h-screen h-screen w-full overflow-hidden bg-[#04121a]">
        {/* Background Images with Ken Burns */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 slide-transition gpu-accelerated ${
              index === currentSlide ? "slide-active" : "slide-inactive"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center animate-kenburns"
              style={{
                backgroundImage: `url('${slide.backgroundImageUrl}')`,
                backgroundPosition: "center center",
                animationPlayState:
                  index === currentSlide ? "running" : "paused",
              }}
            />
            {/* CRITICAL: Subtle black shadow on the left (text side) that fades completely by the middle */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 50%)",
              }}
            />
            {/* Subtle bottom fade for indicator readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04121a]/70 via-transparent to-transparent" />
          </div>
        ))}

        {/* Ambient floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-100/40 rounded-full animate-float opacity-0 animate-fadeInScale gpu-accelerated"
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
              {/* Title */}
              <div className="mb-4 sm:mb-6 md:mb-8 overflow-hidden">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight text-shadow-luxury leading-[0.85] uppercase">
                  {slides[currentSlide].title.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className="block text-white animate-slideInFromLeft opacity-0 gpu-accelerated relative"
                      style={{
                        animationDelay: `${index * 0.15}s`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="mb-6 sm:mb-8 md:mb-10 overflow-hidden">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-cyan-50 text-shadow-sharp tracking-wide leading-relaxed animate-slideInFromRight animate-delay-300 opacity-0 gpu-accelerated">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Accent line */}
              <div className="relative mb-6 sm:mb-8 md:mb-10 overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                  <div className="w-24 sm:w-32 md:w-40 lg:w-48 h-[2px] bg-gradient-to-r from-cyan-300 via-cyan-200/80 to-transparent animate-scaleInLine animate-delay-400 opacity-0 gpu-accelerated relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-fadeInScale animate-delay-500 opacity-0 shadow-lg shadow-cyan-300/50" />
                </div>
              </div>

              {/* Description */}
              <div className="mb-8 sm:mb-10 md:mb-12 overflow-hidden">
                <div className="glass-morphism-premium p-4 sm:p-6 md:p-8 max-w-3xl lg:max-w-4xl animate-slideInFromBottom animate-delay-700 opacity-0 gpu-accelerated">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-white leading-relaxed text-shadow-sharp tracking-wide">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="animate-fadeInScale animate-delay-800 opacity-0 gpu-accelerated">
                <a
                  href={slides[currentSlide].buttonLink}
                  className="group relative inline-flex items-center gap-3 sm:gap-4 md:gap-6 luxury-glass button-glow-premium text-white font-semibold py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 overflow-hidden border border-cyan-200/20 hover:border-cyan-200/40 uppercase tracking-[0.12em] transition-all duration-500 hover:scale-[1.03]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <span className="relative z-10 text-xs sm:text-sm md:text-base tracking-[0.08em]">
                    {slides[currentSlide].buttonText}
                  </span>
                  <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-cyan-200/20 flex items-center justify-center group-hover:bg-cyan-200/30 transition-all duration-500 group-hover:rotate-45">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] transition-transform duration-500"
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
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-4 md:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 luxury-glass !rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed group border border-cyan-200/15 hover:border-cyan-200/35"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white transition-transform duration-500 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
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
          aria-label="Next slide"
          className="absolute right-3 sm:right-4 md:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 luxury-glass !rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed group border border-cyan-200/15 hover:border-cyan-200/35"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white transition-transform duration-500 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slide Indicators with Progress */}
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-3 sm:space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              disabled={isTransitioning}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "bg-cyan-200 scale-125 shadow-lg shadow-cyan-200/50"
                    : "bg-white/35 hover:bg-white/60 hover:scale-110"
                }`}
              />
              {index === currentSlide && (
                <div className="absolute -inset-1 border border-cyan-200/40 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 progress-bar rounded-full"
                    style={{
                      clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

export default Hero;

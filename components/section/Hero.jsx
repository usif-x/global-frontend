import Link from "next/link";

const Hero = ({
  backgroundImageUrl = "/image/hero-bg2.jpg",
  title = "Global Divers",
  subtitle = "Experience the Red Sea's Beauty",
  description = "Book your dive today and get ready for an unforgettable adventure!",
  buttonText = "Book A Dive",
}) => {
  const styles = `
    @keyframes fadeInUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInLeft {
      from { 
        opacity: 0;
        transform: translateX(-40px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scaleX(0);
      }
      to { 
        opacity: 1;
        transform: scaleX(1);
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    .animate-slideInLeft {
      animation: slideInLeft 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: left;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-800 { animation-delay: 0.8s; }
    .animate-delay-1000 { animation-delay: 1s; }
    
    .text-shadow {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6);
    }
    
    .text-shadow-strong {
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6);
    }
    
    .glass-effect {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* Mobile-specific adjustments */
    @media (max-width: 640px) {
      .animate-slideInLeft, .animate-fadeInUp {
        animation-duration: 0.8s;
      }
      
      .text-shadow {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.7);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section
        className="relative flex items-center justify-start min-h-screen h-screen w-full bg-cover bg-center bg-fixed text-white overflow-hidden"
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
      >
        {/* Enhanced multi-layered overlay - responsive opacity */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 sm:from-black/85 sm:via-black/65 sm:to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 sm:from-black/60 sm:to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40 sm:to-black/30"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12">
          {/* Floating accent elements - responsive positioning and visibility */}
          <div className="hidden sm:block absolute top-16 sm:top-20 right-6 sm:right-10 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/20 rounded-full animate-float opacity-0 animate-fadeInUp animate-delay-1000"></div>
          <div
            className="hidden md:block absolute top-24 sm:top-32 right-24 sm:right-32 w-1 h-1 bg-white/30 rounded-full animate-float opacity-0 animate-fadeInUp animate-delay-1000"
            style={{ animationDelay: "1.2s", animationDuration: "4s" }}
          ></div>
          <div
            className="hidden lg:block absolute top-32 sm:top-40 right-12 sm:right-20 w-1.5 h-1.5 bg-white/15 rounded-full animate-float opacity-0 animate-fadeInUp animate-delay-1000"
            style={{ animationDelay: "1.5s", animationDuration: "5s" }}
          ></div>

          <div className="max-w-4xl">
            {/* Title with responsive typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black tracking-tight mb-4 sm:mb-6 text-shadow-strong animate-slideInLeft animate-delay-200 opacity-0 leading-none">
              <span className="block">{title.split(" ")[0]}</span>
              {title.split(" ")[1] && (
                <span className="block text-white/90">
                  {title.split(" ")[1]}
                </span>
              )}
            </h1>

            {/* Subtitle with responsive sizing */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light text-white/95 mb-6 sm:mb-8 md:mb-10 text-shadow animate-fadeInUp animate-delay-400 opacity-0 tracking-wide leading-tight">
              {subtitle}
            </p>

            {/* Enhanced accent line with responsive width */}
            <div className="w-24 sm:w-32 md:w-40 h-0.5 bg-gradient-to-r from-white/80 to-white/20 mb-8 sm:mb-10 md:mb-12 animate-scaleIn animate-delay-600 opacity-0 relative">
              <div className="absolute inset-0 bg-white/40 blur-sm"></div>
            </div>

            {/* Description with responsive text sizing and spacing */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white/85 mb-10 sm:mb-12 md:mb-16 leading-relaxed max-w-full sm:max-w-2xl md:max-w-3xl text-shadow animate-fadeInUp animate-delay-800 opacity-0">
              {description}
            </p>

            {/* Enhanced button with responsive sizing */}
            <div className="animate-fadeInUp animate-delay-1000 opacity-0">
              <Link
                href="/trips"
                className="group relative inline-flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/15 hover:bg-white/25 glass-effect border border-white/40 hover:border-white/60 text-white font-bold py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-full transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-white/10 overflow-hidden"
              >
                {/* Button background shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <span className="relative z-10 text-sm sm:text-base md:text-lg tracking-wide">
                  {buttonText}
                </span>
                <div className="relative z-10 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5"
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

        {/* Enhanced scroll indicator - responsive sizing and positioning */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 animate-fadeInUp animate-delay-1000 opacity-0">
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="text-white/60 text-xs sm:text-sm font-light tracking-widest uppercase">
              Scroll
            </span>
            <div className="w-5 sm:w-6 h-8 sm:h-10 border border-white/40 rounded-full flex justify-center relative overflow-hidden">
              <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1.5 sm:mt-2 animate-bounce"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;

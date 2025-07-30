"use client";

import "@/styles/waves.css";
import { useEffect, useRef } from "react";

const WavesArea = ({
  children = "Your Message Here",
  position = "both",
  waveColor = "#ffffff",
  backgroundColor = "rgb(26,84,117)",
  textColor = "white",
  textAlign = "left",
  className = "",
}) => {
  const textShadowRef = useRef(null);
  const maxProgressRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!textShadowRef.current) return;

      const element = textShadowRef.current.parentElement;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      const windowHeight = window.innerHeight;
      const viewportMiddle = windowHeight / 2;
      const elementMiddle = rect.top + rect.height / 2;

      let progress = 0;
      if (elementMiddle <= viewportMiddle) {
        progress = 1;
      } else {
        const distanceAbove = elementMiddle - viewportMiddle;
        const maxDistance = windowHeight;
        progress = 1 - Math.min(1, distanceAbove / maxDistance);
      }

      if (isScrollingDown) {
        maxProgressRef.current = Math.max(maxProgressRef.current, progress);
      }

      const effectiveProgress = progress;
      const startPos = 200; // Reduced from 3000
      const endPos = 5;

      if (textShadowRef.current) {
        textShadowRef.current.style.transform = `translateX(${
          startPos - effectiveProgress * (startPos - endPos)
        }px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fixed SVG wave path
  const wavePath =
    "M-160 44c30 0 58-18 88-18s58 18 88 18s58-18 88-18s58 18 88 18v44h-352z";

  const containerStyle = {
    position: "relative",
    minHeight: "30vh",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: "1.25rem",
    backgroundColor,
    color: textColor,
    overflow: "visible",
  };

  const contentAreaStyle = {
    position: "relative",
    zIndex: 10,
    width: "100%",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent:
      textAlign === "left"
        ? "flex-start"
        : textAlign === "right"
        ? "flex-end"
        : "center",
  };

  const textStyle = {
    position: "relative",
    fontWeight: "bold",
    fontSize: "3rem",
    zIndex: 10,
    padding: "0.5rem",
    paddingLeft: textAlign === "right" ? "0.5rem" : "2rem",
    paddingRight: textAlign === "right" ? "2rem" : "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems:
      textAlign === "left"
        ? "flex-start"
        : textAlign === "right"
        ? "flex-end"
        : "center",
    textAlign: textAlign,
  };

  const shadowStyle = {
    position: "absolute",
    left: textAlign === "right" ? "40px" : "-40px",
    top: 0,
    width: "100%",
    fontSize: "3rem",
    zIndex: -1,
    WebkitTextStroke: "1px rgba(255, 255, 255, 0.5)",
    color: "transparent",
    transform: "translateX(200px)",
    transition: "transform 0.3s ease-out",
  };

  const waveStyle = {
    position: "absolute",
    width: "100%",
    height: "10vh",
    left: 0,
  };

  const topWaveStyle = {
    ...waveStyle,
    top: 0,
    transform: "rotate(180deg)",
  };

  const bottomWaveStyle = {
    ...waveStyle,
    bottom: 0,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {/* Top Waves */}
      {(position === "top" || position === "both") && (
        <svg
          style={topWaveStyle}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path id="gentle-wave-top" d={wavePath} />
          </defs>
          <g>
            {[0.7, 0.5, 0.3, 0.1].map((opacity, index) => (
              <use
                key={index}
                href="#gentle-wave-top"
                x="48"
                y={index * 7}
                fill={waveColor}
                style={{
                  opacity,
                  animation: `wave-animation ${
                    15 + index * 5
                  }s ease-in-out infinite`,
                  animationDelay: `${-index * 2}s`,
                }}
              />
            ))}
          </g>
        </svg>
      )}

      {/* Content Area */}
      <div style={contentAreaStyle}>
        {typeof children === "string" ? (
          <div style={textStyle}>
            <span style={shadowStyle} ref={textShadowRef}>
              {children}
            </span>
            {children}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: "1rem",
              textAlign: textAlign,
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* Bottom Waves */}
      {(position === "bottom" || position === "both") && (
        <svg
          style={bottomWaveStyle}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path id="gentle-wave-bottom" d={wavePath} />
          </defs>
          <g>
            {[0.7, 0.5, 0.3, 0.1].map((opacity, index) => (
              <use
                key={index}
                href="#gentle-wave-bottom"
                x="48"
                y={index * 7}
                fill={waveColor}
                style={{
                  opacity,
                  animation: `wave-animation ${
                    15 + index * 5
                  }s ease-in-out infinite`,
                  animationDelay: `${-index * 2}s`,
                }}
              />
            ))}
          </g>
        </svg>
      )}

      <style jsx>{`
        @keyframes wave-animation {
          0% {
            transform: translate3d(-90px, 0, 0);
          }
          100% {
            transform: translate3d(85px, 0, 0);
          }
        }

        @media (max-width: 768px) {
          .waves-container {
            min-height: 20vh !important;
          }
          .waves-container svg {
            height: 8vh !important;
          }
        }

        @media (max-width: 640px) {
          .waves-container {
            min-height: 15vh !important;
          }
          .waves-container svg {
            height: 6vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WavesArea;

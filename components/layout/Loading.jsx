"use client";

import { useLoading } from "@/providers/loadingProvider"; // Make sure this path is correct
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const { isLoading, setIsLoading } = useLoading(); // Get setIsLoading from the context
  const [showLoading, setShowLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState("");
  const pathname = usePathname();

  // New state to manage the visibility of the close button
  const [showCloseButton, setShowCloseButton] = useState(false);

  // Track pathname changes and auto-dismiss loading if navigating to same page
  useEffect(() => {
    if (pathname && previousPath && pathname === previousPath && isLoading) {
      // If user clicked on the same route they're already on, dismiss loading immediately
      setIsLoading(false);
    }
    setPreviousPath(pathname);
  }, [pathname, previousPath, isLoading, setIsLoading]);

  useEffect(() => {
    let loadingTimer;
    let closeButtonTimer;

    if (isLoading) {
      // Check if we're navigating to the same page
      if (pathname === previousPath) {
        // If same page, don't show loading
        setIsLoading(false);
        return;
      }

      // Show the loading overlay after a very short delay to avoid flickering on fast loads
      loadingTimer = setTimeout(() => setShowLoading(true), 100);

      // Show the "close" button only if loading takes more than 3 seconds
      closeButtonTimer = setTimeout(() => {
        setShowCloseButton(true);
      }, 3000);
    } else {
      setShowLoading(false);
      setShowCloseButton(false); // Hide the button immediately when loading stops
    }

    // Cleanup timers on unmount or when isLoading changes
    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(closeButtonTimer);
    };
  }, [isLoading, pathname, previousPath, setIsLoading]);

  if (!showLoading) return null;

  return (
    <>
      <div className="loading-overlay">
        <div className="loading-backdrop" />

        <div className="loading-content">
          <div className="loading-spinner">
            <div className="bubble bubble1"></div>
            <div className="bubble bubble2"></div>
            <div className="bubble bubble3"></div>
          </div>
          <p className="loading-text">Loading...</p>

          {/* --- NEW: "Taking too long?" Button --- */}
          {showCloseButton && (
            <button
              onClick={() => setIsLoading(false)}
              className="close-loading-button"
            >
              Taking too long? Click to continue
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.3);
        }

        .loading-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
          padding: 20px;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
        }

        .bubble {
          position: absolute;
          width: 15px;
          height: 15px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.9),
            rgba(59, 130, 246, 0.6),
            rgba(37, 99, 235, 0.8)
          );
          border-radius: 50%;
          animation: circleMove 2s linear infinite;
        }

        .bubble1 {
          animation-delay: 0s;
        }

        .bubble2 {
          animation-delay: 0.66s;
        }

        .bubble3 {
          animation-delay: 1.33s;
        }

        .loading-text {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #333;
          text-align: center;
        }

        .close-loading-button {
          margin-top: 25px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .close-loading-button:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
        }

        /* Tablet styles */
        @media (max-width: 768px) {
          .loading-spinner {
            width: 70px;
            height: 70px;
            margin-bottom: 18px;
          }

          .bubble {
            width: 13px;
            height: 13px;
          }

          .loading-text {
            font-size: 16px;
          }

          @keyframes circleMove {
            0% {
              top: 30px;
              left: 0px;
              transform: rotate(0deg);
            }
            25% {
              top: 0px;
              left: 30px;
              transform: rotate(90deg);
            }
            50% {
              top: 30px;
              left: 57px;
              transform: rotate(180deg);
            }
            75% {
              top: 57px;
              left: 30px;
              transform: rotate(270deg);
            }
            100% {
              top: 30px;
              left: 0px;
              transform: rotate(360deg);
            }
          }
        }

        /* Mobile styles */
        @media (max-width: 480px) {
          .loading-content {
            padding: 15px;
          }

          .loading-spinner {
            width: 60px;
            height: 60px;
            margin-bottom: 15px;
          }

          .bubble {
            width: 12px;
            height: 12px;
          }

          .loading-text {
            font-size: 14px;
          }

          @keyframes circleMove {
            0% {
              top: 25px;
              left: 0px;
              transform: rotate(0deg);
            }
            25% {
              top: 0px;
              left: 25px;
              transform: rotate(90deg);
            }
            50% {
              top: 25px;
              left: 48px;
              transform: rotate(180deg);
            }
            75% {
              top: 48px;
              left: 25px;
              transform: rotate(270deg);
            }
            100% {
              top: 25px;
              left: 0px;
              transform: rotate(360deg);
            }
          }
        }

        /* Small mobile styles */
        @media (max-width: 320px) {
          .loading-spinner {
            width: 50px;
            height: 50px;
            margin-bottom: 12px;
          }

          .bubble {
            width: 10px;
            height: 10px;
          }

          .loading-text {
            font-size: 13px;
          }

          @keyframes circleMove {
            0% {
              top: 20px;
              left: 0px;
              transform: rotate(0deg);
            }
            25% {
              top: 0px;
              left: 20px;
              transform: rotate(90deg);
            }
            50% {
              top: 20px;
              left: 40px;
              transform: rotate(180deg);
            }
            75% {
              top: 40px;
              left: 20px;
              transform: rotate(270deg);
            }
            100% {
              top: 20px;
              left: 0px;
              transform: rotate(360deg);
            }
          }
        }

        @keyframes circleMove {
          0% {
            top: 35px;
            left: 0px;
            transform: rotate(0deg);
          }
          25% {
            top: 0px;
            left: 35px;
            transform: rotate(90deg);
          }
          50% {
            top: 35px;
            left: 65px;
            transform: rotate(180deg);
          }
          75% {
            top: 65px;
            left: 35px;
            transform: rotate(270deg);
          }
          100% {
            top: 35px;
            left: 0px;
            transform: rotate(360deg);
          }
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .loading-backdrop {
            background: rgba(0, 0, 0, 0.6);
          }

          .loading-text {
            color: #fff;
          }

          .bubble {
            background: radial-gradient(
              circle at 30% 30%,
              rgba(255, 255, 255, 0.8),
              rgba(59, 130, 246, 0.7),
              rgba(37, 99, 235, 0.9)
            );
          }
        }
      `}</style>
    </>
  );
}

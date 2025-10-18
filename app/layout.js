// app/layout.js
import ConditionalLayout from "@/components/layout/ConditionalLayout.jsx";
import LoadingOverlay from "@/components/layout/Loading";
import GoogleTranslateButton from "@/components/layout/TranslateButton";
import LoadingProvider from "@/providers/loadingProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "./globals.css";

const IBM = IBM_Plex_Sans_Arabic({
  subsets: ["latin", "arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: {
    template: "Top Divers - %s",
    default: "Top Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "Experience the Red Sea’s Beauty with TopDiverS — Dive into crystal-clear waters, explore vibrant coral reefs, and discover a world of marine life like never before. Whether you’re a beginner or a pro, every dive is an unforgettable adventure.",
  keywords:
    "diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea",
  creator: "Top Divers Hurghada",
  publisher: "Top Divers Hurghada",
  language: "en-US",
  robots: "index, follow",
  alternates: {
    canonical: "https://topdivers.online",
  },
  openGraph: {
    title: "Top Divers Hurghada",
    description:
      "Experience the Red Sea’s Beauty with TopDiverS — Dive into crystal-clear waters, explore vibrant coral reefs, and discover a world of marine life like never before. Whether you’re a beginner or a pro, every dive is an unforgettable adventure.",
    url: "https://topdivers.online",
    siteName: "Top Divers Hurghada",
    images: [
      {
        url: "https://topdivers.online/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Scuba diving in the Red Sea",
      },
    ],
    type: "website",
    locale: "en_US",
    language: "en-US",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${IBM.className}`}>
        <Suspense>
          <LoadingProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={true}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <ConditionalLayout>
              {children}
              <GoogleTranslateButton />
            </ConditionalLayout>
            <LoadingOverlay />
          </LoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}

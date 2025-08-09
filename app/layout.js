// app/layout.js
import ConditionalLayout from "@/components/layout/ConditionalLayout.jsx";
import LoadingOverlay from "@/components/layout/Loading";
import LoadingProvider from "@/providers/loadingProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
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
  description: "Experience the Red Sea's Beauty",
  keywords:
    "diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea",
  creator: "Top Divers Hurghada",
  publisher: "Top Divers Hurghada",
  language: "en-US",
  robots: "index, follow",
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app",
  },
  openGraph: {
    title: "Top Divers Hurghada",
    description: "Experience the Red Sea's Beauty",
    url: "https://global-frontend-lac.vercel.app",
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
          <ConditionalLayout>{children}</ConditionalLayout>
          <LoadingOverlay />
        </LoadingProvider>
      </body>
    </html>
  );
}

import ConditionalLayout from "@/components/layout/ConditionalLayout.jsx";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";

const IBM = IBM_Plex_Sans_Arabic({
  subsets: ["latin", "arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});
export const metadata = {
  title: {
    template: "Global Divers - %s",
    default: "Global Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  description: "Experience the Red Sea's Beauty",
  keywords:
    "diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea",
  creator: "Global Divers Hurghada",
  publisher: "Global Divers Hurghada",
  language: "en-US",
  robots: "index, follow",
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app",
  },
  openGraph: {
    title: "Global Divers Hurghada",
    description: "Experience the Red Sea's Beauty",
    url: "https://global-frontend-lac.vercel.app",
    siteName: "Global Divers Hurghada",
    images: [
      {
        url: "https://global-frontend-lac.vercel.app/hero-bg.jpg",
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
      </body>
    </html>
  );
}

// app/layout.js
import ConditionalLayout from "@/components/layout/ConditionalLayout.jsx";
import LoadingOverlay from "@/components/layout/Loading";
import GoogleTranslateButton from "@/components/layout/TranslateButton";
import LoadingProvider from "@/providers/loadingProvider";
import { Roboto } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";

import "./globals.css";

// add crisp chat script

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: {
    template: "Hurghada Trips - %s",
    default: "Hurghada Trips",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://hurghada-trips.online",
  ),
  icons: {
    icon: "/favicon.jpg",
  },
  description:
    "Explore Hurghada trips with us. Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
  keywords:
    "hurghada trips, egypt trips, Sunrise, , Hurghada Trips, Hurghada Trips, Hurghada Trips , , Hurghada Trips , safari, marsa alam tours, trips egypt, boat trips hurghada, diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea, snorkeling hurghada, paradise island hurghada, orange bay trip, giftun island tour, private boat hurghada, speed boat hurghada, luxor day trip from hurghada, cairo trip from hurghada, dolphin house hurghada, hurghada excursions, hurghada activities, hurghada excursions deals, hurghada diving center, scuba diving hurghada, open water course hurghada, padi diving courses egypt, red sea liveaboard, desert safari hurghada, quad safari hurghada, jeep safari hurghada, submarine hurghada, sea scope hurghada, family trips hurghada, couple trips egypt, el gouna trips, sharm el sheikh diving, marsa alam diving, egypt travel packages, red sea holidays, snorkeling egypt, diving holidays egypt, diving safari egypt, daily diving trips hurghada, beginner diving hurghada, advanced diving courses egypt, wreck diving red sea, coral reef diving hurghada, egypt tourism, red sea adventures, hurghada boat tours, luxury trips hurghada, island tours hurghada, diving instructors egypt, learn diving egypt, egypt underwater tours, scuba diving red sea, best diving spots hurghada, eco diving red sea, freediving hurghada, padi certified courses hurghada diving egypt, diving red sea, german-speaking diving center in hurghada, learn to dive with a german-speaking instructor in hurghada, learn diving in hurghada, discover scuba diving hurghada, book diving in hurghada, diving holidays in hurghada, red sea diving trips, top diving center in hurghada, top diving school in hurghada, top diving instructor in hurghada",
  creator: "Hurghada Trips",
  publisher: "Hurghada Trips",
  language: "en-US",
  robots: "index, follow",
  alternates: {
    canonical: "https://hurghada-trips.online",
  },
  openGraph: {
    title: "Hurghada Trips",
    description:
      "Explore Hurghada trips with us. Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
    url: "https://hurghada-trips.online",
    siteName: "Hurghada Trips",
    images: [
      {
        url: "https://hurghada-trips.online/image/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Scuba diving in the Red Sea",
      },
    ],
    type: "website",
    locale: "en_US",
    language: "en-US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hurghada Trips",
    description:
      "Explore Hurghada trips with us. Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
    images: ["https://hurghada-trips.online/image/hero-bg.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.className}`}>
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
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
    </html>
  );
}

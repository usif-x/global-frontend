// app/layout.js
import ConditionalLayout from "@/components/layout/ConditionalLayout.jsx";
import LoadingOverlay from "@/components/layout/Loading";
import GoogleTranslateButton from "@/components/layout/TranslateButton";
import LoadingProvider from "@/providers/loadingProvider";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "./globals.css";

// add crisp chat script
import Script from "next/script";

const roboto = Roboto({
  subsets: ["latin"],
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
    "Explore Hurghada trips with TopDivers: Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
  keywords:
    "hurghada trips, egypt trips, safari, marsa alam tours, trips egypt, boat trips hurghada, diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea, snorkeling hurghada, paradise island hurghada, orange bay trip, giftun island tour, private boat hurghada, speed boat hurghada, luxor day trip from hurghada, cairo trip from hurghada, dolphin house hurghada, hurghada excursions, hurghada activities, hurghada excursions deals, hurghada diving center, scuba diving hurghada, open water course hurghada, padi diving courses egypt, red sea liveaboard, desert safari hurghada, quad safari hurghada, jeep safari hurghada, submarine hurghada, sea scope hurghada, family trips hurghada, couple trips egypt, el gouna trips, sharm el sheikh diving, marsa alam diving, egypt travel packages, red sea holidays, snorkeling egypt, diving holidays egypt, diving safari egypt, daily diving trips hurghada, beginner diving hurghada, advanced diving courses egypt, wreck diving red sea, coral reef diving hurghada, egypt tourism, red sea adventures, hurghada boat tours, luxury trips hurghada, island tours hurghada, diving instructors egypt, learn diving egypt, egypt underwater tours, scuba diving red sea, best diving spots hurghada, eco diving red sea, freediving hurghada, padi certified courses hurghada diving egypt, diving red sea",
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
      "Explore Hurghada trips with TopDivers: Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
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
      <body className={`${roboto.className}`}>
        {/* Chatwoot Chat */}
        <Script
          id="chatwoot-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,t) {
                var BASE_URL="https://chatwoot.usif.space";
                var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
                g.src=BASE_URL+"/packs/js/sdk.js";
                g.async = true;
                s.parentNode.insertBefore(g,s);
                g.onload=function(){
                  window.chatwootSDK.run({
                    websiteToken: '9EdMLbvtgyHG66Kz7wnczvdt',
                    baseUrl: BASE_URL
                  })
                }
              })(document,"script");
            `,
          }}
        />
        {/* Umami Analytics */}
        <Script
          defer
          src="https://umami.usif.space/script.js"
          data-website-id="987ff080-4a1c-4bec-8ef4-dc0a2ed0b805"
          strategy="afterInteractive"
        />
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

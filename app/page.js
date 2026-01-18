import BestSellersHero from "@/components/section/BestSelling";
import DivingCourses from "@/components/section/Course";
import WhyChooseUs from "@/components/section/Future";
import Hero from "@/components/section/Hero";
import PackageTripDisplay from "@/components/section/PackageTrip";
export const metadata = {
  title: {
    template: "Top Divers - %s",
    default: "Top Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "Explore Hurghada trips with Top Divers Sunrise Alma: Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
  keywords:
    "hurghada trips, egypt trips, Sunrise, Sunrise Alma, Topdivers, Top Divers Hurghada, Topdivers sunrise alma, alma sunrise, Topdivers hurghada sunrise alma, safari, marsa alam tours, trips egypt, boat trips hurghada, diving, trips, packages, courses, destinations, safari, egypt, red sea, diving trips, diving packages, diving courses, diving destinations, diving safari, diving egypt, diving red sea, snorkeling hurghada, paradise island hurghada, orange bay trip, giftun island tour, private boat hurghada, speed boat hurghada, luxor day trip from hurghada, cairo trip from hurghada, dolphin house hurghada, hurghada excursions, hurghada activities, hurghada excursions deals, hurghada diving center, scuba diving hurghada, open water course hurghada, padi diving courses egypt, red sea liveaboard, desert safari hurghada, quad safari hurghada, jeep safari hurghada, submarine hurghada, sea scope hurghada, family trips hurghada, couple trips egypt, el gouna trips, sharm el sheikh diving, marsa alam diving, egypt travel packages, red sea holidays, snorkeling egypt, diving holidays egypt, diving safari egypt, daily diving trips hurghada, beginner diving hurghada, advanced diving courses egypt, wreck diving red sea, coral reef diving hurghada, egypt tourism, red sea adventures, hurghada boat tours, luxury trips hurghada, island tours hurghada, diving instructors egypt, learn diving egypt, egypt underwater tours, scuba diving red sea, best diving spots hurghada, eco diving red sea, freediving hurghada, padi certified courses hurghada diving egypt, diving red sea, german-speaking diving center in hurghada, learn to dive with a german-speaking instructor in hurghada, learn diving in hurghada, discover scuba diving hurghada, book diving in hurghada, diving holidays in hurghada, red sea diving trips, top diving center in hurghada, top diving school in hurghada, top diving instructor in hurghada",
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
      "Explore Hurghada trips with Top Divers Sunrise Alma: Red Sea diving, snorkeling, boat & island tours, safari adventures, and Egypt travel packages for all travelers.",
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
export default function Home() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <BestSellersHero />
      <DivingCourses />
      <PackageTripDisplay />
    </>
  );
}

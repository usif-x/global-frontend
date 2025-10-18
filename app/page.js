import BestSellersHero from "@/components/section/BestSelling";
import DivingCourses from "@/components/section/Course";
import WhyChooseUs from "@/components/section/Future";
import Hero from "@/components/section/Hero";
import PackageTripDisplay from "@/components/section/PackageTrip";
import TestimonialShowcase from "@/components/section/Testimonial";
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
export default function Home() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <BestSellersHero />
      <DivingCourses />
      <PackageTripDisplay />
      <TestimonialShowcase />
    </>
  );
}

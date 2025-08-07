import BestSellersHero from "@/components/section/BestSelling";
import DivingCourses from "@/components/section/Course";
import WhyChooseUs from "@/components/section/Future";
import Hero from "@/components/section/Hero";
import PackageTripDisplay from "@/components/section/PackageTrip";
import TestimonialShowcase from "@/components/section/Testimonial";
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

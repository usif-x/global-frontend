import DivingCourses from "@/components/section/Course";
import WhyChooseUs from "@/components/section/Future";
import Hero from "@/components/section/Hero";
import PackageTripDisplay from "@/components/section/PackageTrip";
export default function Home() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <DivingCourses />
      <PackageTripDisplay />
    </>
  );
}

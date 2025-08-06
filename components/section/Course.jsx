import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Link from "next/link";
import MarkdownRenderer from "../ui/MarkdownRender";

// --- Reusable UI Components ---
const ErrorMessage = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div
      className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md"
      role="alert"
    >
      <h2 className="text-red-600 text-lg font-medium">
        Error loading courses
      </h2>
      <p className="text-red-500 mt-2">{error}</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center p-8 max-w-md">
      <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Icon
          icon="line-md:coffee-half-empty-filled-loop"
          className="text-blue-600 w-12 h-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        No Courses Available
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        We're currently updating our course offerings. Please check back soon
        for exciting new diving adventures!
      </p>
    </div>
  </div>
);

// --- Helper Functions ---
const formatDuration = (days) => {
  if (typeof days !== "number" || days <= 0) return "N/A";
  if (days === 1) return "1 Day";
  return `${days} Days`;
};

const levelConfig = {
  Beginner: { value: 1, color: "text-green-600" },
  Intermediate: { value: 2, color: "text-sky-600" },
  Advanced: { value: 3, color: "text-orange-600" },
  Professional: { value: 4, color: "text-indigo-600" },
};
const TOTAL_LEVEL_STEPS = 4;

const LevelIndicator = ({ level = "Beginner" }) => {
  const { value: activeSteps, color } =
    levelConfig[level] || levelConfig["Beginner"];
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <h4 className="text-sm font-semibold text-gray-600">Difficulty</h4>
        <span className={`text-sm font-bold ${color}`}>{level}</span>
      </div>
      <div className="flex gap-1.5" title={`Level: ${level}`}>
        {Array.from({ length: TOTAL_LEVEL_STEPS }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full flex-1 transition-colors ${
              index < activeSteps ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Waves icon component (since we can't use external icons in server components easily)
const Waves = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L13.24 8.1C12.45 8.9 12.45 10.15 13.24 10.95L14.83 12.54L16.24 11.13L14.65 9.54L17.58 6.61L20.25 9.28L21 9ZM1 9L2.5 7.5L5.17 10.17L8.1 7.24C8.9 6.45 10.15 6.45 10.95 7.24L12.54 8.83L11.13 10.24L9.54 8.65L6.61 11.58L9.28 14.25L7.5 16.5L1 9Z" />
  </svg>
);

// --- CourseCard Component ---
const CourseCard = ({ course }) => {
  const imageUrl = course.images?.[0];
  const showImage = !!imageUrl;

  return (
    <div
      className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg border border-transparent 
                 hover:border-blue-500/30 hover:-translate-y-2 
                 transition-all duration-300 ease-in-out will-change-transform"
    >
      {/* --- Image Section --- */}
      <div className="h-56 relative overflow-hidden">
        {showImage ? (
          <img
            src={imageUrl}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center text-center p-4">
            <Waves className="w-12 h-12 text-white/50" />
            <h4 className="mt-3 font-bold text-white tracking-tight">
              {course.name}
            </h4>
            <p className="text-sm text-white/70">{course.course_level}</p>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md">
            <span className="text-blue-600 font-bold text-sm tracking-wide">
              PADI
            </span>
          </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex-1 pr-4">
            {course.name}
          </h3>
          <div className="text-xl font-bold text-pink-500 whitespace-nowrap">
            €{course.price}
          </div>
        </div>
        <LevelIndicator level={course.course_level} />
        <hr className="my-2 border-gray-100" />
        <div className="flex items-center justify-around text-sm text-gray-600 py-2 mb-4">
          <div className="flex flex-col items-center space-y-1">
            <Icon icon="svg-spinners:clock" />
            <span className="font-medium">
              {formatDuration(course.course_duration)}
            </span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Icon icon="hugeicons:package" />
            <span className="font-medium">Equipment</span>
          </div>
        </div>
        <div className="line-clamp-2">
          <MarkdownRenderer content={course.description} />
        </div>
        <div className="mt-auto pt-4">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl 
                             flex items-center justify-center space-x-2
                             transition-colors duration-300 group-hover:bg-blue-700"
          >
            <span>Book Now</span>
            <Icon
              icon="fluent:arrow-right-12-filled"
              className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Server Component ---
const DivingCourses = async () => {
  let courses = [];
  let error = null;

  try {
    courses = await getData("/courses");
  } catch (err) {
    error = err.message || "Failed to fetch courses";
    console.error("Error fetching courses:", err);
  }

  if (error) return <ErrorMessage error={error} />;
  if (!courses || courses.length === 0) return <EmptyState />;

  return (
    <main id="booking" className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-6">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Explore Our Diving Courses
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From your first breath underwater to becoming a Divemaster, we offer
            professional courses for every step of your diving adventure.
          </p>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </section>
        <div className="text-center mt-16">
          <Link
            href={"/courses"}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </main>
  );
};

export default DivingCourses;

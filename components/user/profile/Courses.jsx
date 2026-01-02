import { getData } from "@/lib/axios";
import { getImageUrl } from "@/utils/imageUtils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const CourseCard = ({ course }) => {
  const imageUrl =
    course.images && course.images.length > 0
      ? getImageUrl(course.images[0])
      : "/image/course-placeholder.png";

  const extractFirstParagraph = (markdown) => {
    if (!markdown) return "No description available";
    const lines = markdown
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));
    return lines[0] || "No description available";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="grid md:grid-cols-3 gap-0">
        {/* Image Section */}
        <div className="relative h-64 md:h-auto overflow-hidden">
          <Image
            src={imageUrl}
            alt={course.name}
            width={400}
            height={300}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Provider Badge */}
          {course.provider && (
            <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                <span className="text-xs font-bold text-cyan-600">
                  {course.provider}
                </span>
              </div>
            </div>
          )}

          {/* Price Badge */}
          {course.price_available && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="text-sm font-semibold">
                  {course.price
                    ? `${course.price.toLocaleString()} EGP`
                    : "Contact us"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:col-span-2 p-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {course.name}
              </h3>
              {course.has_certificate && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-semibold">
                  <Icon icon="mdi:certificate" className="w-4 h-4" />
                  Certificate
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {extractFirstParagraph(course.description)}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-cyan-50 rounded-lg">
                  <Icon icon="mdi:signal" className="text-cyan-500 w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Level</div>
                  <div className="font-semibold text-slate-700">
                    {course.course_level}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Icon
                    icon="mdi:clock-outline"
                    className="text-blue-500 w-4 h-4"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Duration</div>
                  <div className="font-semibold text-slate-700">
                    {course.course_duration}{" "}
                    {course.course_duration_unit || "days"}
                  </div>
                </div>
              </div>

              {course.course_type && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Icon icon="mdi:tag" className="text-purple-500 w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Type</div>
                    <div className="font-semibold text-slate-700">
                      {course.course_type}
                    </div>
                  </div>
                </div>
              )}

              {course.has_online_content && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <Icon
                      icon="mdi:laptop"
                      className="text-green-500 w-4 h-4"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Format</div>
                    <div className="font-semibold text-slate-700">
                      Online Content
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Link href={`/courses/${course.id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200">
                <Icon icon="mdi:play-circle" className="w-5 h-5" />
                Continue Learning
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getData("/users/me/courses", true);
        setCourses(response || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load your courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 px-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <Icon
            icon="mdi:alert-circle"
            className="mx-auto h-12 w-12 text-red-500 mb-3"
          />
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl border border-slate-200">
          <Icon
            icon="mdi:school-outline"
            className="mx-auto h-16 w-16 text-slate-400 mb-4"
          />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            No courses found
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            You are not enrolled in any courses yet.
          </p>
          <Link href="/courses" passHref>
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200">
              <Icon icon="mdi:magnify" className="h-5 w-5" />
              Browse Courses
            </span>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-1">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
            <Icon icon="mdi:school" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              My Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track your enrolled courses and progress
            </p>
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default CoursesTab;

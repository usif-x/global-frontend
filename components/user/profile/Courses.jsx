// Can be in a separate file like components/user/profile/CoursesTab.jsx
import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
    <div className="md:w-1/3 flex-shrink-0">
      <Image
        src={course.image || "/image/course-placeholder.png"}
        alt={course.title}
        width={400}
        height={225}
        className="object-cover w-full h-48 md:h-full"
      />
    </div>
    <div className="p-6 flex flex-col justify-between flex-grow">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Level:</span> {course.course_level}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Duration:</span>{" "}
          {course.course_duration}
        </p>
        <Link href={`/courses/${course.id}/enroll`} passHref>
          <span className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
            <Icon icon="mdi:arrow-right-circle" className="h-5 w-5" />
            Continue Course
          </span>
        </Link>
      </div>
    </div>
  </div>
);

const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Assuming the correct endpoint is /users/me/courses
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
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Icon
            icon="mdi:school-outline"
            className="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No courses found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You are not enrolled in any courses yet.
          </p>
          <Link href="/courses" passHref>
            <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700">
              Browse Courses
            </span>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-6">
        My Courses
      </h2>
      {renderContent()}
    </div>
  );
};

export default CoursesTab;

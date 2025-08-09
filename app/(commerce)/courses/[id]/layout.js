import { getData } from "@/lib/server-axios";

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Fetch course data
  let courseData;
  try {
    courseData = await getData(`/courses/${id}`);
  } catch (error) {
    // If fetching fails, return default metadata
    return {
      title: "Course Details ",
      description: "Diving course details",
      robots: "index, follow",
    };
  }

  return {
    title: `${courseData.name} `,
    description: courseData.description,
    keywords: "diving, courses, certifications",
    robots: "index, follow",
    authors: [{ name: "Yousseif Muhammad" }],
    openGraph: {
      title: `${courseData.name} `,
      description: courseData.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${courseData.name} `,
      description: courseData.description,
    },
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: `https://global-frontend-lac.vercel.app/courses/${id}`,
    },
  };
}

export default function CourseLayout({ children }) {
  return children;
}

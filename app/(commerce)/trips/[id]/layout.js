import { getData } from "@/lib/axios";

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Fetch trip data
  let tripData;
  try {
    tripData = await getData(`/trips/${id}`);
  } catch (error) {
    // If fetching fails, return default metadata
    return {
      title: "Trip Details ",
      description: "Diving trip details",
      robots: "index, follow",
    };
  }

  return {
    title: `${tripData.name} `,
    description: tripData.description,
    keywords: "diving, trips, certifications",
    robots: "index, follow",
    authors: [{ name: "Yousseif Muhammad" }],
    openGraph: {
      title: `${tripData.name} `,
      description: tripData.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tripData.name} `,
      description: tripData.description,
    },
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: `https://topdivers.online/trips/${id}`,
    },
  };
}

export default function TripLayout({ children }) {
  return children;
}

import { getData } from "@/lib/axios";

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Fetch trip data
  let tripData;
  try {
    tripData = await getData(`/dive-centers/${id}`);
  } catch (error) {
    // If fetching fails, return default metadata
    return {
      title: "Dive Center Details ",
      description: "Diving center details",
      robots: "index, follow",
    };
  }

  return {
    title: `${tripData.name} `,
    description: tripData.description,
    keywords: "diving, centers, our locations diving center, diving center",
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
      canonical: `https://topdivers.online/divingcenter-locations/${id}`,
    },
  };
}

export default function CenterLocationLayout({ children }) {
  return children;
}

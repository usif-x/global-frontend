import { getData } from "@/lib/axios";

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Fetch package data
  let packageData;
  try {
    packageData = await getData(`/packages/${id}`);
  } catch (error) {
    // If fetching fails, return default metadata
    return {
      title: "Package Details ",
      description: "Diving package details",
      robots: "index, follow",
    };
  }

  return {
    title: `${packageData.name} `,
    description: packageData.description,
    keywords: "diving, packages, tours",
    robots: "index, follow",
    authors: [{ name: "Yousseif Muhammad" }],
    openGraph: {
      title: `${packageData.name} `,
      description: packageData.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${packageData.name} `,
      description: packageData.description,
    },
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: `https://global-frontend-lac.vercel.app/packages/${id}`,
    },
  };
}

export default function PackageLayout({ children }) {
  return children;
}

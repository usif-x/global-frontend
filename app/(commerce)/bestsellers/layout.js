export const metadata = {
  title: "Best Selling",
  description: "Best Selling Courses and Trips",
  keywords: "best selling, courses, trips",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Best Selling",
    description: "Best Selling Courses and Trips",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Selling",
    description: "Best Selling Courses and Trips",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.globaldivershurghada.com/best-selling",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function BestSellingLayout({ children }) {
  return <div>{children}</div>;
}

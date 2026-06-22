export const metadata = {
  title: "Safety Guidelines ",
  description: "Safety guidelines for Hurghada Trips",
  keywords: "safety, guidelines, Hurghada Trips, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Safety Guidelines ",
    description: "Safety guidelines for Hurghada Trips",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Guidelines ",
    description: "Safety guidelines for Hurghada Trips",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://hurghada-trips.online/safety-guidelines",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SafetyGuidelinesLayout({ children }) {
  return <div>{children}</div>;
}

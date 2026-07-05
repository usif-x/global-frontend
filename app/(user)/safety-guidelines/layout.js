export const metadata = {
  title: "Safety Guidelines ",
  description: "Safety guidelines for TopDivers",
  keywords: "safety, guidelines, TopDivers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Safety Guidelines ",
    description: "Safety guidelines for TopDivers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Guidelines ",
    description: "Safety guidelines for TopDivers",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/safety-guidelines",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SafetyGuidelinesLayout({ children }) {
  return <div>{children}</div>;
}

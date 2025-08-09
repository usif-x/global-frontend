export const metadata = {
  title: "Safety Guidelines ",
  description: "Safety guidelines for Global Divers Hurghada",
  keywords: "safety, guidelines, global divers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Safety Guidelines ",
    description: "Safety guidelines for Global Divers Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Guidelines ",
    description: "Safety guidelines for Global Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app/safety-guidelines",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SafetyGuidelinesLayout({ children }) {
  return <div>{children}</div>;
}

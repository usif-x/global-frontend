export const metadata = {
  title: "Privacy Policy ",
  description: "Privacy policy for Hurghada Trips Hurghada",
  keywords: "privacy, policy, Hurghada Trips, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Privacy Policy ",
    description: "Privacy policy for Hurghada Trips Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy ",
    description: "Privacy policy for Hurghada Trips Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://hurghada-trips.online/privacy-policy",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function PrivacyPolicyLayout({ children }) {
  return <div>{children}</div>;
}

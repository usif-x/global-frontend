export const metadata = {
  title: "Privacy Policy ",
  description: "Privacy policy for TopDivers",
  keywords: "privacy, policy, TopDivers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Privacy Policy ",
    description: "Privacy policy for TopDivers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy ",
    description: "Privacy policy for TopDivers",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/privacy-policy",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function PrivacyPolicyLayout({ children }) {
  return <div>{children}</div>;
}

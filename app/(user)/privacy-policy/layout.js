export const metadata = {
  title: "Privacy Policy ",
  description: "Privacy policy for Top Divers Hurghada",
  keywords: "privacy, policy, Top Divers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Privacy Policy ",
    description: "Privacy policy for Top Divers Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy ",
    description: "Privacy policy for Top Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app/privacy-policy",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function PrivacyPolicyLayout({ children }) {
  return <div>{children}</div>;
}

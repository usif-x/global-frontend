export const metadata = {
  title: "Privacy Policy ",
  description: "Privacy policy for Global Divers Hurghada",
  keywords: "privacy, policy, global divers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Privacy Policy ",
    description: "Privacy policy for Global Divers Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy ",
    description: "Privacy policy for Global Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.globaldivershurghada.com/privacy-policy",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function PrivacyPolicyLayout({ children }) {
  return <div>{children}</div>;
}

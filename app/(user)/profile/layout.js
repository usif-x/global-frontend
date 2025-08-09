export const metadata = {
  title: "My Profile ",
  description: "Your profile and settings",
  keywords: "profile, settings, user",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "My Profile ",
    description: "Your profile and settings",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Profile ",
    description: "Your profile and settings",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app/profile",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function ProfileLayout({ children }) {
  return <div>{children}</div>;
}

export const metadata = {
  title: "Terms & Conditions ",
  description: "Terms and conditions for Hurghada Trips Hurghada",
  keywords: "terms, conditions, Hurghada Trips, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Terms & Conditions ",
    description: "Terms and conditions for Hurghada Trips Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions ",
    description: "Terms and conditions for Hurghada Trips Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://hurghada-trips.online/terms-and-conditions",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TermsAndConditionsLayout({ children }) {
  return <div>{children}</div>;
}

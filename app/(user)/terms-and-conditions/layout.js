export const metadata = {
  title: "Terms & Conditions ",
  description: "Terms and conditions for TopDivers",
  keywords: "terms, conditions, TopDivers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Terms & Conditions ",
    description: "Terms and conditions for TopDivers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions ",
    description: "Terms and conditions for TopDivers",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/terms-and-conditions",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TermsAndConditionsLayout({ children }) {
  return <div>{children}</div>;
}

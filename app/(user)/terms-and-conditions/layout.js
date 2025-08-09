export const metadata = {
  title: "Terms & Conditions ",
  description: "Terms and conditions for Top Divers Hurghada",
  keywords: "terms, conditions, Top Divers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Terms & Conditions ",
    description: "Terms and conditions for Top Divers Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions ",
    description: "Terms and conditions for Top Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://global-frontend-lac.vercel.app/terms-and-conditions",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TermsAndConditionsLayout({ children }) {
  return <div>{children}</div>;
}

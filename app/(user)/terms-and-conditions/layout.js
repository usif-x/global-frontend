export const metadata = {
  title: "Terms & Conditions ",
  description: "Terms and conditions for Global Divers Hurghada",
  keywords: "terms, conditions, global divers, hurghada",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Terms & Conditions ",
    description: "Terms and conditions for Global Divers Hurghada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions ",
    description: "Terms and conditions for Global Divers Hurghada",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.globaldivershurghada.com/terms-and-conditions",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function TermsAndConditionsLayout({ children }) {
  return <div>{children}</div>;
}

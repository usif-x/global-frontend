export const metadata = {
  title: "My Invoices",
  description: "My Invoices",
  keywords: "globaldiver invoices, invoices, user",
  robots: "noindex, nofollow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "My Invoices",
    description: "My Invoices",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Invoices ",
    description: "My Invoices",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  alternates: {
    canonical: "https://topdivers.online/invoices",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function InvoicesLayout({ children }) {
  return <div>{children}</div>;
}

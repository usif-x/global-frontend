export const metadata = {
  title: "My Invoices",
  description: "My Invoices",
  keywords: "globaldiver invoices, invoices, user",
  robots: "index, follow",
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
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.globaldivershurghada.com/invoices",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function InvoicesLayout({ children }) {
  return <div>{children}</div>;
}

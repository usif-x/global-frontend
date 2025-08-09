export const metadata = {
  title: "Register ",
  description: "Register to your account",
  keywords: "register, account, user",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Register ",
    description: "Register to your account",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register ",
    description: "Register to your account",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://https://global-frontend-lac.vercel.app/register",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RegisterLayout({ children }) {
  return <div>{children}</div>;
}

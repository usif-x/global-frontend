export const metadata = {
  title: "Login ",
  description: "Login to your account",
  keywords: "login, account, user",
  robots: "index, follow",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Login ",
    description: "Login to your account",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login ",
    description: "Login to your account",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://https://global-frontend-lac.vercel.app/login",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function LoginLayout({ children }) {
  return <div>{children}</div>;
}

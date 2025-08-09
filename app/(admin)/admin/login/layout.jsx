export const metadata = {
  title: "Admin Login ",
  description: "Admin Login to your account",
  keywords: "admin, login, account, user",
  authors: [{ name: "Yousseif Muhammad" }],
  openGraph: {
    title: "Admin Login ",
    description: "Admin Login to your account",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Login ",
    description: "Admin Login to your account",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://topdivers.online/admin/login",
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function AdminLoginLayout({ children }) {
  return <div>{children}</div>;
}

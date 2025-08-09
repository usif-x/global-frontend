export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Top Divers management",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const themeColor = "#ffffff";

export default function AdminDashboardLayout({ children }) {
  return <div>{children}</div>;
}

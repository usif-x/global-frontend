"use client";
import AdminManagementPage from "@/components/admin/components/admin/ModernAdmin";
import AnalyticsContent from "@/components/admin/components/analytic/AnalyticsContent";
import PackageManagement from "@/components/admin/components/package/Package";
import TestimonialManagementPage from "@/components/admin/components/testimonial/Testimonial";
import TripManagement from "@/components/admin/components/trip/Trip";
import UserManagementPage from "@/components/admin/components/user/ModernUser";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Alert from "../ui/Alert";
import CourseManagement from "./components/course/Course";
import InvoiceManagementPage from "./components/invoices/Invoices";
import AdminSettingsPage from "./components/setting/Setting";
const AdminDashboard = () => {
  const { admin, logout, isAdmin } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/admin/login");
      return;
    }
  }, [isAdmin, router]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "mdi:view-dashboard",
      color: "text-blue-500",
    },
    {
      id: "trips",
      label: "Trips",
      icon: "mdi:airplane",
      color: "text-green-500",
    },
    {
      id: "packages",
      label: "Packages",
      icon: "mdi:package-variant",
      color: "text-purple-500",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "mdi:book-open-page-variant",
      color: "text-orange-500",
    },
    {
      id: "users",
      label: "Users",
      icon: "mdi:account-group",
      color: "text-cyan-500",
    },

    ...(admin?.admin_level === 2
      ? [
          {
            id: "admins",
            label: "Admins",
            icon: "mdi:shield-account",
            color: "text-red-500",
          },
        ]
      : []),
    {
      id: "testimonials",
      label: "Testimonials",
      icon: "mdi:comment-quote",
      color: "text-yellow-500",
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "invoices",
            label: "Invoices",
            icon: "mdi:calendar-check",
            color: "text-indigo-500",
          },
        ]
      : []),
    ...(admin?.admin_level === 2
      ? [
          {
            id: "payments",
            label: "Payments",
            icon: "mdi:credit-card",
            color: "text-emerald-500",
          },
        ]
      : []),
    {
      id: "analytics",
      label: "Analytics",
      icon: "mdi:chart-line",
      color: "text-pink-500",
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "settings",
            label: "Settings",
            icon: "mdi:cog",
            color: "text-gray-500",
          },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "trips":
        return <TripManagement />;
      case "packages":
        return <PackageManagement />;
      case "courses":
        return <CourseManagement />;
      case "users":
        return <UserManagementPage />;
      case "admins":
        return <AdminManagementPage />;
      case "testimonials":
        return <TestimonialManagementPage />;
      case "invoices":
        return <InvoiceManagementPage />;
      case "payments":
        return <PaymentsContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "settings":
        return <AdminSettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  if (!admin) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                activeTab === item.id
                  ? "bg-cyan-50 text-cyan-700 border-r-4 border-cyan-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                icon={item.icon}
                className={`w-5 h-5 mr-3 ${
                  activeTab === item.id ? "text-cyan-500" : item.color
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <Icon icon="mdi:account" className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{admin.name}</p>
              <p className="text-xs text-gray-500">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Icon icon="mdi:logout" className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Icon icon="mdi:menu" className="w-6 h-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "dashboard" ? "Dashboard Overview" : activeTab}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Icon icon="mdi:bell" className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center">
                <span className="text-sm text-gray-700 mr-2">Welcome,</span>
                <span className="text-sm font-medium text-gray-900">
                  {admin.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const DashboardContent = () => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          title: "Total Users",
          value: "1,234",
          icon: "mdi:account-group",
          color: "bg-blue-500",
        },
        {
          title: "Active Trips",
          value: "56",
          icon: "mdi:airplane",
          color: "bg-green-500",
        },
        {
          title: "Total Bookings",
          value: "789",
          icon: "mdi:calendar-check",
          color: "bg-purple-500",
        },
        {
          title: "Revenue",
          value: "$45,678",
          icon: "mdi:currency-usd",
          color: "bg-orange-500",
        },
      ].map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <Icon icon={stat.icon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <Alert dismissible={true}> Hello World </Alert>

    {/* Quick Actions */}
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Add New Trip",
            icon: "mdi:plus-circle",
            color: "text-green-600",
          },
          {
            label: "Create Package",
            icon: "mdi:package-variant-plus",
            color: "text-blue-600",
          },
          {
            label: "Add Course",
            icon: "mdi:book-plus",
            color: "text-purple-600",
          },
          {
            label: "View Reports",
            icon: "mdi:chart-box",
            color: "text-orange-600",
          },
        ].map((action, index) => (
          <button
            key={index}
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <Icon
              icon={action.icon}
              className={`w-5 h-5 mr-3 ${action.color}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const InvoicesContent = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Invoices Management
      </h2>
      <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
        <Icon icon="mdi:calendar-plus" className="w-4 h-4 mr-2 inline" />
        New Booking
      </button>
    </div>
    <p className="text-gray-600">Track and manage all customer invoices.</p>
  </div>
);

const PaymentsContent = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Payments Management
      </h2>
      <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
        <Icon icon="mdi:credit-card-plus" className="w-4 h-4 mr-2 inline" />
        Process Payment
      </button>
    </div>
    <p className="text-gray-600">
      Monitor payments, refunds, and financial transactions.
    </p>
  </div>
);

const SettingsContent = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
      <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
        <Icon icon="mdi:content-save" className="w-4 h-4 mr-2 inline" />
        Save Changes
      </button>
    </div>
    <p className="text-gray-600">Configure system settings and preferences.</p>
  </div>
);

export default AdminDashboard;

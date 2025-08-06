"use client";
import AdminManagementPage from "@/components/admin/components/admin/ModernAdmin";
import AnalyticsContent from "@/components/admin/components/analytic/AnalyticsContent";
import BestSellingMain from "@/components/admin/components/bestselling/BestSelling";
import GalleryManagementPage from "@/components/admin/components/gallery/Gallery";
import PackageManagement from "@/components/admin/components/package/Package";
import PaymentsContent from "@/components/admin/components/payment/Payment";
import TestimonialManagementPage from "@/components/admin/components/testimonial/Testimonial";
import TripManagement from "@/components/admin/components/trip/Trip";
import UserManagementPage from "@/components/admin/components/user/ModernUser";
import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CourseManagement from "./components/course/Course";
import InvoiceManagementPage from "./components/invoices/Invoices";
import HeroDashboard from "./components/MainContent";
import AdminSettingsPage from "./components/setting/Setting";

// Notification Component
const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => onNotificationClick(notification)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-full ${notification.color} mr-3 mt-0.5`}
                    >
                      <Icon
                        icon={notification.icon}
                        className="w-4 h-4 text-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : notification.priority === "medium"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {notification.priority === "high"
                            ? "Urgent"
                            : notification.priority === "medium"
                            ? "Important"
                            : "Info"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Icon
                icon="mdi:bell-check"
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
              />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                // Mark all as read logic here
                onClose();
              }}
              className="w-full text-sm text-cyan-600 hover:text-cyan-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const { admin, logout, isAdmin } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationStats, setNotificationStats] = useState({
    unaccepted_testimonials_count: 0,
    pending_invoices: 0,
    new_users_today: 0,
    failed_invoices: 0,
  });

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/admin/login");
      return;
    }

    // Load notifications on component mount
    loadNotifications();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, router]);

  const loadNotifications = async () => {
    try {
      const [analyticsRes, invoiceRes, usersRes] = await Promise.allSettled([
        AnalyticsService.getAll(),
        InvoiceService.getInvoiceSummaryAdmin(),
        AdminService.getUsers({ page: 1, pageSize: 10 }),
      ]);

      let stats = {};
      let newNotifications = [];

      // Process analytics data
      if (analyticsRes.status === "fulfilled" && analyticsRes.value) {
        stats = { ...stats, ...analyticsRes.value };
      }

      // Process invoice data
      if (invoiceRes.status === "fulfilled" && invoiceRes.value) {
        stats = { ...stats, ...invoiceRes.value };
      }

      // Count new users (registered today)
      if (usersRes.status === "fulfilled" && usersRes.value?.users) {
        const today = new Date().toDateString();
        const newUsersToday = usersRes.value.users.filter(
          (user) => new Date(user.created_at).toDateString() === today
        ).length;
        stats.new_users_today = newUsersToday;
      }

      setNotificationStats(stats);

      // Generate notifications based on stats
      if (stats.unaccepted_testimonials_count > 0) {
        newNotifications.push({
          id: "testimonials",
          title: "Pending Testimonials",
          message: `${stats.unaccepted_testimonials_count} testimonial${
            stats.unaccepted_testimonials_count > 1 ? "s" : ""
          } waiting for review`,
          icon: "mdi:comment-alert",
          color: "bg-orange-500",
          priority: "medium",
          time: "Now",
          action: "testimonials",
        });
      }

      if (stats.pending_invoices > 0) {
        newNotifications.push({
          id: "invoices",
          title: "Pending Payments",
          message: `${stats.pending_invoices} invoice${
            stats.pending_invoices > 1 ? "s" : ""
          } pending payment ($${stats.pending_amount?.toLocaleString() || 0})`,
          icon: "mdi:cash-clock",
          color: "bg-blue-500",
          priority: "high",
          time: "Now",
          action: "invoices",
        });
      }

      if (stats.failed_invoices > 0) {
        newNotifications.push({
          id: "failed-invoices",
          title: "Failed Payments",
          message: `${stats.failed_invoices} payment${
            stats.failed_invoices > 1 ? "s" : ""
          } failed ($${stats.failed_amount?.toLocaleString() || 0})`,
          icon: "mdi:alert-circle",
          color: "bg-red-500",
          priority: "high",
          time: "Now",
          action: "invoices",
        });
      }

      if (stats.new_users_today > 0) {
        newNotifications.push({
          id: "new-users",
          title: "New Users Today",
          message: `${stats.new_users_today} new user${
            stats.new_users_today > 1 ? "s" : ""
          } registered today`,
          icon: "mdi:account-plus",
          color: "bg-green-500",
          priority: "low",
          time: "Today",
          action: "users",
        });
      }

      // Add system notifications (you can customize these)
      const now = new Date();
      const hour = now.getHours();

      if (hour === 9 && notifications.length === 0) {
        // Morning summary
        newNotifications.push({
          id: "morning-summary",
          title: "Good Morning!",
          message: `You have ${stats.users_count || 0} total users and $${
            stats.paid_amount?.toLocaleString() || 0
          } in revenue`,
          icon: "mdi:weather-sunny",
          color: "bg-yellow-500",
          priority: "low",
          time: "Morning",
          action: "dashboard",
        });
      }

      setNotifications(newNotifications);
      setNotificationCount(
        newNotifications.filter(
          (n) => n.priority === "high" || n.priority === "medium"
        ).length
      );
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.action) {
      setActiveTab(notification.action);
      setShowNotifications(false);
    }
  };

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
      id: "best_selling",
      label: "Best Selling",
      icon: "mdi:fire",
      color: "text-rose-500",
    },
    {
      id: "users",
      label: "Users",
      icon: "mdi:account-group",
      color: "text-cyan-500",
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: "mdi:image-multiple",
      color: "text-pink-500",
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
      badge:
        notificationStats.unaccepted_testimonials_count > 0
          ? notificationStats.unaccepted_testimonials_count
          : null,
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "invoices",
            label: "Invoices",
            icon: "mdi:calendar-check",
            color: "text-indigo-500",
            badge:
              notificationStats.pending_invoices > 0
                ? notificationStats.pending_invoices
                : null,
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
        return <HeroDashboard setActiveTab={setActiveTab} admin={admin} />;
      case "trips":
        return <TripManagement />;
      case "packages":
        return <PackageManagement />;
      case "courses":
        return <CourseManagement />;
      case "best_selling":
        return <BestSellingMain />;
      case "users":
        return <UserManagementPage />;
      case "gallery":
        return <GalleryManagementPage />;
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
        return <HeroDashboard />;
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
              className={`relative w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
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
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
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
              {/* Enhanced Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:bell" className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
              </div>

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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

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

export default AdminDashboard;

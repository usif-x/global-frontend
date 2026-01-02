"use client";
import ActivityAvailability from "@/components/admin/components/activity-availability/ActivityAvailability";
import AdminManagementPage from "@/components/admin/components/admin/ModernAdmin";
import AnalyticsContent from "@/components/admin/components/analytic/AnalyticsContent";
import BestSellingMain from "@/components/admin/components/bestselling/BestSelling";
import CouponManagement from "@/components/admin/components/coupon/Coupon";
import DiveCenterManagementPage from "@/components/admin/components/divecenter/DiveCenter";
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
import BlogManagement from "./components/blog/Blog";
import CourseManagement from "./components/course/Course";
import InvoiceManagementPage from "./components/invoices/Invoices";
import HeroDashboard from "./components/MainContent";
import OrderManagement from "./components/order/Order";
import PublicNotificationManagement from "./components/public-notifications/PublicNotification";
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
      <div className="fixed top-14 sm:top-16 right-2 sm:right-4 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => onNotificationClick(notification)}
                  className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${notification.color}`}
                    >
                      <Icon
                        icon={notification.icon}
                        className="w-4 h-4 text-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 mb-1 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
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
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <Icon
                icon="mdi:bell-check"
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300"
              />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 sm:p-3 border-t border-gray-100"></div>
        )}
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const { admin, logout, isAdmin } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop
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

    // Set up polling for real-time updates (every 3 minutes)
    const interval = setInterval(loadNotifications, 180000);

    return () => clearInterval(interval);
  }, [isAdmin, router]);

  const loadNotifications = async () => {
    try {
      // Determine what data to fetch based on admin level
      const isLevel2Admin = admin?.admin_level === 2;

      const promises = [
        AnalyticsService.getAll(),
        AdminService.getUsers({ page: 1, pageSize: 10 }),
      ];

      // Only fetch invoice data for level 2 admins
      if (isLevel2Admin) {
        promises.push(InvoiceService.getInvoiceSummaryAdmin());
      }

      const results = await Promise.allSettled(promises);

      let stats = {};
      let newNotifications = [];

      // Process analytics data
      if (results[0].status === "fulfilled" && results[0].value) {
        stats = { ...stats, ...results[0].value };
      }

      // Count new users (registered today)
      if (results[1].status === "fulfilled" && results[1].value?.users) {
        const today = new Date().toDateString();
        const newUsersToday = results[1].value.users.filter(
          (user) => new Date(user.created_at).toDateString() === today
        ).length;
        stats.new_users_today = newUsersToday;
      }

      // Process invoice data only for level 2 admins
      if (isLevel2Admin && results[2]) {
        if (results[2].status === "fulfilled" && results[2].value) {
          stats = { ...stats, ...results[2].value };
        }
      }

      setNotificationStats(stats);

      // Generate notifications based on stats and admin level
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

      // Only add invoice-related notifications for level 2 admins
      if (isLevel2Admin) {
        if (stats.pending_invoices > 0) {
          newNotifications.push({
            id: "invoices",
            title: "Pending Payments",
            message: `${stats.pending_invoices} invoice${
              stats.pending_invoices > 1 ? "s" : ""
            } pending payment ($${
              stats.pending_amount?.toLocaleString() || 0
            })`,
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
        // Morning summary - different for each admin level
        const summaryMessage = isLevel2Admin
          ? `You have ${stats.users_count || 0} total users and $${
              stats.paid_amount?.toLocaleString() || 0
            } in revenue`
          : `You have ${stats.users_count || 0} total users, ${
              stats.trips_count || 0
            } trips, and ${stats.courses_count || 0} courses`;

        newNotifications.push({
          id: "morning-summary",
          title: "Good Morning!",
          message: summaryMessage,
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
      description: "Overview of your platform activities",
    },
    {
      id: "trips",
      label: "Trips",
      icon: "mdi:airplane",
      color: "text-green-500",
      description: "Manage all trips and bookings",
    },
    {
      id: "packages",
      label: "Packages",
      icon: "mdi:package-variant",
      color: "text-purple-500",
      description: "Create and manage travel packages",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "mdi:book-open-page-variant",
      color: "text-orange-400",
      description: "Manage courses and learning materials",
    },
    {
      id: "best_selling",
      label: "Best Selling",
      icon: "mdi:fire",
      color: "text-red-500",
      description: "View best selling trips and packages",
    },
    {
      id: "coupons",
      label: "Coupons",
      icon: "mdi:ticket-percent",
      color: "text-pink-400",
      description: "Create and manage discount coupons",
    },
    {
      id: "users",
      label: "Users",
      icon: "mdi:account-group",
      color: "text-cyan-600",
      description: "Manage user accounts and permissions",
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: "mdi:image-multiple",
      color: "text-indigo-500",
      description: "Upload and manage media content",
    },
    {
      id: "blog",
      label: "Blog",
      icon: "mdi:post-outline",
      color: "text-yellow-600",
      description: "Create and manage blog posts",
    },
    {
      id: "activity_availability",
      label: "Availability",
      icon: "mdi:calendar-remove",
      color: "text-rose-500",
      description: "Manage closed dates for activities",
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "divecenters",
            label: "Dive Centers",
            icon: "mdi:diving",
            color: "text-teal-500",
            description: "Manage dive centers and their info",
          },
        ]
      : []),
    ...(admin?.admin_level === 2
      ? [
          {
            id: "orders",
            label: "Orders",
            icon: "mdi:receipt-text-check-outline",
            color: "text-lime-500",
            description: "View and manage customer orders",
          },
          {
            id: "admins",
            label: "Admins",
            icon: "mdi:shield-account",
            color: "text-red-700",
            description: "Manage other admin accounts",
          },
        ]
      : []),
    {
      id: "testimonials",
      label: "Testimonials",
      icon: "mdi:comment-quote",
      color: "text-amber-500",
      description: "Review customer feedback",
      badge:
        notificationStats.unaccepted_testimonials_count > 0
          ? notificationStats.unaccepted_testimonials_count
          : null,
    },
    {
      id: "public_notifications",
      label: "Notifications",
      icon: "mdi:bell-ring",
      color: "text-orange-500",
      description: "View all public notifications",
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "invoices",
            label: "Invoices",
            icon: "mdi:calendar-check",
            color: "text-indigo-700",
            description: "Manage invoices and billing",
            badge:
              notificationStats.pending_invoices > 0
                ? notificationStats.pending_invoices
                : null,
          },
          {
            id: "payments",
            label: "Payments",
            icon: "mdi:credit-card",
            color: "text-emerald-500",
            description: "Track payments and transactions",
          },
        ]
      : []),
    {
      id: "analytics",
      label: "Analytics",
      icon: "mdi:chart-line",
      color: "text-pink-600",
      description: "View platform statistics and reports",
    },
    ...(admin?.admin_level === 2
      ? [
          {
            id: "settings",
            label: "Settings",
            icon: "mdi:cog",
            color: "text-gray-500",
            description: "Configure platform settings",
          },
        ]
      : []),
  ];

  const renderContent = () => {
    // Prevent level 1 admins from accessing restricted content
    const isLevel2Admin = admin?.admin_level === 2;
    const restrictedTabs = [
      "invoices",
      "payments",
      "orders",
      "admins",
      "settings",
      "divecenters",
      "packages",
    ];

    if (!isLevel2Admin && restrictedTabs.includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon
              icon="mdi:shield-lock"
              className="w-16 h-16 text-red-500 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this section.
            </p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

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
      case "coupons":
        return <CouponManagement />;
      case "users":
        return <UserManagementPage />;
      case "gallery":
        return <GalleryManagementPage />;
      case "blog":
        return <BlogManagement />;
      case "activity_availability":
        return <ActivityAvailability />;
      case "divecenters":
        return <DiveCenterManagementPage />;
      case "orders":
        return <OrderManagement />;
      case "admins":
        return <AdminManagementPage />;
      case "testimonials":
        return <TestimonialManagementPage />;
      case "public_notifications":
        return <PublicNotificationManagement />;
      case "invoices":
        return <InvoiceManagementPage />;
      case "payments":
        return <PaymentsContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "settings":
        return <AdminSettingsPage />;
      default:
        return <HeroDashboard setActiveTab={setActiveTab} admin={admin} />;
    }
  };

  if (!admin) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out 
                   ${
                     sidebarOpen
                       ? "translate-x-0 w-64 sm:w-72"
                       : "-translate-x-full w-64 sm:w-72"
                   }
                   lg:relative lg:translate-x-0 ${
                     isCollapsed ? "lg:w-20" : "lg:w-64 xl:w-72"
                   } flex flex-col`}
      >
        {/* Sidebar Header - Fixed */}
        <div
          className={`flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200 flex-shrink-0 ${
            isCollapsed ? "px-3 sm:px-4 justify-center" : ""
          }`}
        >
          {!isCollapsed && (
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Admin Panel
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Icon icon="mdi:close" className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 px-2 sm:px-4 py-3 sm:py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`relative w-full flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-left rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                activeTab === item.id
                  ? "bg-cyan-50 text-cyan-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon
                icon={item.icon}
                className={`w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0 ${
                  isCollapsed ? "mr-0" : "mr-2 sm:mr-3"
                } ${activeTab === item.id ? "text-cyan-500" : item.color}`}
              />
              {!isCollapsed && (
                <span className="font-medium flex-1 truncate">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold leading-none text-white bg-red-500 rounded-full flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer - Fixed */}
        <div
          className={`border-t border-gray-200 p-2 sm:p-3 flex-shrink-0 ${
            isCollapsed ? "p-2 sm:p-3" : "p-3 sm:p-4"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center mb-2 sm:mb-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:account"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon
              icon={
                isCollapsed ? "mdi:arrow-right-thick" : "mdi:arrow-left-thick"
              }
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Icon icon="mdi:menu" className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 capitalize truncate">
                {activeTab === "dashboard"
                  ? "Dashboard Overview"
                  : activeTab.replace(/_/g, " ")}
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
              {/* Back to Main Page Button */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 whitespace-nowrap"
                title="Back to Main Page"
              >
                <Icon
                  icon="mdi:home"
                  className="w-4 h-4 sm:mr-1"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Main Page</span>
              </button>

              {/* Enhanced Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Icon icon="mdi:bell" className="w-5 h-5 sm:w-6 sm:h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse min-w-6">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                {/* Welcome message */}
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-xs md:text-sm text-gray-600">
                    Welcome,
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-32">
                    {admin.name}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 whitespace-nowrap"
                >
                  <Icon
                    icon="mdi:logout"
                    className="w-4 h-4 mr-1"
                    aria-hidden="true"
                  />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Logout (icon only) */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <Icon icon="mdi:logout" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

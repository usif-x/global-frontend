// file: /components/admin/components/MainContent.jsx (Enhanced HeroDashboard)

import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
import InvoiceService from "@/services/invoiceService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

// Helper function to format dates nicely
const formatTimeAgo = (dateString) => {
  if (!dateString) return "a while ago";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Helper function to calculate conversion rate
const calculateConversionRate = (paid, total) => {
  if (total === 0) return 0;
  return ((paid / total) * 100).toFixed(1);
};

const HeroDashboard = ({ setActiveTab, admin }) => {
  // Enhanced state structure to match all API responses
  const [stats, setStats] = useState({
    // Analytics data
    users_count: 0,
    active_users_count: 0,
    inactive_users_count: 0,
    blocked_users_count: 0,
    unblocked_users_count: 0,
    trips_count: 0,
    packages_count: 0,
    courses_count: 0,
    testimonials_count: 0,
    accepted_testimonials_count: 0,
    unaccepted_testimonials_count: 0,

    // Invoice data
    total_invoices: 0,
    total_revenue: 0,
    pending_count: 0,
    pending_amount_total: 0,
    paid_count: 0,
    paid_amount: 0, // This seems to be missing from new structure, assuming total_revenue is the paid amount
    failed_count: 0,
    failed_amount_total: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Set up polling for real-time updates (every 3 minutes)
    const interval = setInterval(fetchDashboardData, 180000);

    return () => clearInterval(interval);
  }, [admin]);

  /**
   * Fetches and processes all data required for the dashboard.
   * Enhanced with better error handling and data processing.
   * Filters data based on admin level.
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine what data to fetch based on admin level
      const isLevel2Admin = admin?.admin_level === 2;

      // Fetch analytics and users for all admin levels
      const promises = [
        AnalyticsService.getAll(),
        AdminService.getRecentUsers(),
      ];

      // Only fetch invoice data for level 2 admins
      if (isLevel2Admin) {
        promises.push(InvoiceService.getInvoiceSummaryAdmin());
      }

      const results = await Promise.allSettled(promises);

      let newStats = { ...stats };

      // Process analytics data - services return res.data directly
      if (results[0].status === "fulfilled" && results[0].value) {
        const analyticsData = results[0].value;
        newStats = { ...newStats, ...analyticsData };
        console.log("Analytics data loaded:", analyticsData);
      } else {
        console.warn("Failed to load analytics data:", results[0].reason);
      }

      // Process invoice summary data - only for level 2 admins
      if (isLevel2Admin && results[2]) {
        if (results[2].status === "fulfilled" && results[2].value) {
          const invoiceData = results[2].value;
          newStats = { ...newStats, ...invoiceData };
          console.log("Invoice data loaded:", invoiceData);
        } else {
          console.warn("Failed to load invoice data:", results[2].reason);
        }
      }

      // Update the main stats state with all new data
      setStats(newStats);

      // Process users data for the "Recent Users" list - services return res.data directly
      if (results[1].status === "fulfilled" && results[1].value) {
        const users = results[1].value;
        // Sort by creation date to ensure we have the newest first
        const sortedUsers = [...users].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentUsers(sortedUsers.slice(0, 6)); // Show only top 6 for better UI
        console.log("Users data loaded:", users.length, "users");
      } else {
        console.warn("Failed to load users data:", results[1].reason);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced stats cards with more meaningful data
  const statsCards = [
    // Level 2 Admin: Show revenue card
    ...(admin?.admin_level === 2
      ? [
          {
            title: "Total Revenue",
            value: `$${(stats.total_revenue || 0).toLocaleString()}`,
            icon: "mdi:cash-multiple",
            color: "bg-green-500",
            change: `$${(stats.paid_amount || 0).toLocaleString()} collected`,
            changeType: "positive",
            tab: "invoices",
            tooltip: "Click to view all invoices",
            subText: `${calculateConversionRate(
              stats.paid_amount,
              stats.total_revenue
            )}% conversion rate`,
          },
        ]
      : []),

    // All admin levels: Users card
    {
      title: "Total Users",
      value: (stats.users_count || 0).toLocaleString(),
      icon: "mdi:account-group-outline",
      color: "bg-blue-500",
      change: `${stats.active_users_count || 0} active users`,
      changeType: "positive",
      tab: "users",
      tooltip: "Click to manage users",
      subText:
        stats.blocked_users_count > 0
          ? `${stats.blocked_users_count} blocked`
          : "All users active",
    },

    // Level 2 Admin: Pending invoices card
    ...(admin?.admin_level === 2
      ? [
          {
            title: "Pending Invoices",
            value: (stats.pending_count || 0).toLocaleString(),
            icon: "mdi:clock-outline",
            color: "bg-orange-500",
            change: `$${(
              stats.pending_amount_total || 0
            ).toLocaleString()} pending`,
            changeType: stats.pending_count > 0 ? "warning" : "neutral",
            tab: "invoices",
            tooltip: "Click to review pending payments",
            subText: `${stats.paid_count || 0} paid, ${
              stats.failed_count || 0
            } failed`,
          },
        ]
      : []),

    // All admin levels: Content & Reviews card
    {
      title: "Content & Reviews",
      value: `${stats.trips_count || 0}/${stats.testimonials_count || 0}`,
      icon: "mdi:star-outline",
      color: "bg-purple-500",
      change: `${stats.unaccepted_testimonials_count || 0} pending reviews`,
      changeType:
        stats.unaccepted_testimonials_count > 0 ? "warning" : "positive",
      tab: "testimonials",
      tooltip: "Trips/Testimonials - Click to manage",
      subText: `${stats.trips_count} trips, ${
        stats.packages_count || 0
      } packages, ${stats.courses_count || 0} courses`,
    },

    // Level 1 Admin: Additional stats to fill the gap
    ...(admin?.admin_level === 1
      ? [
          {
            title: "Best Selling Items",
            value: "Top Picks",
            icon: "mdi:fire",
            color: "bg-red-500",
            change: "Manage bestsellers",
            changeType: "positive",
            tab: "best_selling",
            tooltip: "Click to manage best selling items",
            subText: "Update rankings and featured items",
          },
        ]
      : []),
  ];

  const quickActions = [
    {
      title: "Create New Trip",
      icon: "mdi:airplane-plus",
      action: () => setActiveTab("trips"),
      description: "Add a new travel package",
    },
    {
      title: "Review Testimonials",
      icon: "mdi:comment-check",
      action: () => setActiveTab("testimonials"),
      description: `${stats.unaccepted_testimonials_count || 0} pending`,
      urgent: stats.unaccepted_testimonials_count > 0,
    },
    {
      title: "Manage Users",
      icon: "mdi:account-group",
      action: () => setActiveTab("users"),
      description: `${stats.users_count || 0} total users`,
    },
    // Only show for Level 2 admins
    ...(admin?.admin_level === 2
      ? [
          {
            title: "Invoice Management",
            icon: "mdi:receipt",
            action: () => setActiveTab("invoices"),
            description: `${stats.pending_invoices || 0} pending payments`,
            urgent: stats.pending_invoices > 0,
          },
        ]
      : []),
    {
      title: "Gallery Management",
      icon: "mdi:image-multiple",
      action: () => setActiveTab("gallery"),
      description: "Manage travel photos",
    },
    {
      title: "Course Management",
      icon: "mdi:school",
      action: () => setActiveTab("courses"),
      description: `${stats.courses_count || 0} active courses`,
    },
    {
      title: "Best Selling Items",
      icon: "mdi:fire",
      action: () => setActiveTab("best_selling"),
      description: "Manage featured items",
    },
    {
      title: "Coupon Management",
      icon: "mdi:ticket-percent",
      action: () => setActiveTab("coupons"),
      description: "Manage discount coupons",
    },
  ];

  // Enhanced loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-400 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse"
            >
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icon
            icon="mdi:alert-circle"
            className="w-16 h-16 text-red-500 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section with Key Metrics */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {admin?.name || "Admin"}!
            </h1>
            <p className="text-cyan-100 mb-3">
              Here's your platform overview for today
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Icon icon="mdi:account-multiple" className="w-4 h-4 mr-1" />
                <span>{stats.active_users_count} active users</span>
              </div>
              {/* Only show revenue for Level 2 admins */}
              {admin?.admin_level === 2 && (
                <div className="flex items-center">
                  <Icon icon="mdi:cash" className="w-4 h-4 mr-1" />
                  <span>
                    ${(stats.paid_amount || 0).toLocaleString()} revenue
                  </span>
                </div>
              )}
              {/* Show content stats for Level 1 admins instead */}
              {admin?.admin_level === 1 && (
                <div className="flex items-center">
                  <Icon icon="mdi:airplane" className="w-4 h-4 mr-1" />
                  <span>{stats.trips_count || 0} trips available</span>
                </div>
              )}
              {stats.unaccepted_testimonials_count > 0 && (
                <div className="flex items-center bg-orange-500 bg-opacity-30 px-2 py-1 rounded">
                  <Icon icon="mdi:bell" className="w-4 h-4 mr-1" />
                  <span>
                    {stats.unaccepted_testimonials_count} reviews pending
                  </span>
                </div>
              )}
            </div>
          </div>
          <Icon
            icon="mdi:view-dashboard-variant"
            className="hidden md:block w-20 h-20 text-cyan-300 opacity-50"
          />
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.tab && setActiveTab(stat.tab)}
            className="group bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            title={stat.tooltip}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Icon
                  icon={
                    stat.changeType === "positive"
                      ? "mdi:arrow-top-right"
                      : stat.changeType === "warning"
                      ? "mdi:alert-circle"
                      : "mdi:information-outline"
                  }
                  className={`w-4 h-4 mr-1 ${
                    stat.changeType === "positive"
                      ? "text-green-500"
                      : stat.changeType === "warning"
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "warning"
                      ? "text-orange-600"
                      : "text-gray-600"
                  }
                >
                  {stat.change}
                </span>
              </div>
              {stat.subText && (
                <p className="text-xs text-gray-500">{stat.subText}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Recent Users & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Users - Spanning 3 columns */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Users
            </h3>
            <button
              onClick={() => setActiveTab("users")}
              className="text-sm font-medium text-cyan-600 hover:text-cyan-800 flex items-center"
            >
              View All
              <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                      <span className="text-cyan-700 font-bold text-lg">
                        {user.full_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.full_name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                        {user.testimonials && user.testimonials.length > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            {user.testimonials.length} reviews
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(user.created_at)}
                    </span>
                    {user.last_login && (
                      <p className="text-xs text-gray-400">
                        Last: {formatTimeAgo(user.last_login)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Icon
                  icon="mdi:account-multiple-remove-outline"
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
                />
                <p>No user data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions - Spanning 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`group w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  action.urgent
                    ? "bg-orange-50 border border-orange-200 hover:bg-orange-100"
                    : "bg-gray-50 hover:bg-cyan-50 hover:shadow-sm"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    action.urgent ? "bg-orange-100" : "bg-white"
                  }`}
                >
                  <Icon
                    icon={action.icon}
                    className={`w-5 h-5 transition-colors ${
                      action.urgent
                        ? "text-orange-600"
                        : "text-gray-500 group-hover:text-cyan-600"
                    }`}
                  />
                </div>
                <div className="ml-3 text-left">
                  <span
                    className={`text-sm font-semibold block ${
                      action.urgent
                        ? "text-orange-700"
                        : "text-gray-700 group-hover:text-cyan-700"
                    }`}
                  >
                    {action.title}
                  </span>
                  {action.description && (
                    <span className="text-xs text-gray-500">
                      {action.description}
                    </span>
                  )}
                </div>
                {action.urgent && (
                  <Icon
                    icon="mdi:alert-circle"
                    className="w-4 h-4 text-orange-500 ml-auto"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;

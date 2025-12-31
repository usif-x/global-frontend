"use client";

import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Format currency helper
const formatEGP = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

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

const GeniusStatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
  trend,
  trendValue,
}) => (
  <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
    <div
      className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 ${color}`}
    ></div>
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-xl ${color} bg-opacity-10 text-white group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon
          icon={icon}
          className={`w-6 h-6 ${color.replace("bg-", "text-")}`}
        />
      </div>
      {(trend || trendValue) && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend === "up"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <Icon
            icon={trend === "up" ? "mdi:trending-up" : "mdi:trending-down"}
          />
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
    </div>
  </div>
);

const QuickActionBtn = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-cyan-200 hover:shadow-md hover:bg-cyan-50 transition-all duration-200 group text-left w-full"
  >
    <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
      <Icon
        icon={icon}
        className="w-6 h-6 text-slate-500 group-hover:text-cyan-600"
      />
    </div>
    <div className="ml-4">
      <h4 className="font-semibold text-slate-700 group-hover:text-cyan-800">
        {title}
      </h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <Icon
      icon="mdi:chevron-right"
      className="w-5 h-5 text-slate-300 ml-auto group-hover:text-cyan-400"
    />
  </button>
);

const HeroDashboard = ({ setActiveTab, admin }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, [admin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all analytics endpoints in parallel
      const [analytics, all, invoiceSummary, recentUsersData] =
        await Promise.all([
          AnalyticsService.getDashboardSummary(),
          fetch("https://api.topdivers.online/analytics/all").then((r) =>
            r.json()
          ),
          fetch("https://api.topdivers.online/invoices/admin/summary").then(
            (r) => r.json()
          ),
          AdminService.getRecentUsers(),
        ]);

      setDashboardData({
        ...analytics,
        all,
        invoiceSummary,
        recentUsers: recentUsersData,
      });

      // Simulate some notifications based on data
      const notifs = [];
      if (analytics.stats?.pending_invoices > 0) {
        notifs.push({
          id: 1,
          type: "warning",
          message: `${analytics.stats.pending_invoices} invoices need review`,
          time: "Today",
        });
      }
      setRecentNotifications(notifs);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const {
    stats,
    top_customers,
    top_courses,
    top_activities,
    users,
    testimonials,
    content,
    invoices,
    recent_transactions,
    recentUsers,
    all,
    invoiceSummary,
  } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Genius Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Icon icon="mdi:finance" className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-cyan-500 text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-wider">
              {admin?.role || "Admin"} Dashboard
            </span>
            <span className="text-slate-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Hello, {admin?.name?.split(" ")[0] || "Captain"}! 👋
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            Here's what's happening with your business today. You have{" "}
            <span className="text-cyan-400 font-bold">
              {stats?.pending_invoices_today || 0} pending items
            </span>{" "}
            requiring attention.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab("invoices")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
            >
              <Icon icon="mdi:file-document-edit-outline" />
              Manage Invoices
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-sm flex items-center gap-2"
            >
              <Icon icon="mdi:account-group" />
              View Users
            </button>
          </div>
        </div>
      </div>

      {/* Genius Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GeniusStatCard
          title="Total Revenue"
          value={formatEGP(stats?.revenue)}
          subValue={`${stats?.sales_count} Sales | Trips: ${stats?.trips_booked}`}
          icon="mdi:cash-fast"
          color="bg-emerald-500"
          trend="up"
          trendValue="Live"
        />
        <GeniusStatCard
          title="Potential Revenue"
          value={formatEGP(stats?.potential_revenue)}
          subValue={`${stats?.pending_invoices} Pending Orders`}
          icon="mdi:cash-clock"
          color="bg-amber-500"
          trend="down"
          trendValue="Pending"
        />
        <GeniusStatCard
          title="Avg. Order Value"
          value={formatEGP(stats?.average_order_value)}
          subValue="Per Paid Invoice"
          icon="mdi:chart-box-outline"
          color="bg-blue-500"
        />
        <GeniusStatCard
          title="Best Selling Month"
          value={
            stats?.best_selling_month?.month
              ? `${stats.best_selling_month.year}-${String(
                  stats.best_selling_month.month
                ).padStart(2, "0")}`
              : "-"
          }
          subValue={
            stats?.best_selling_month?.revenue
              ? `EGP ${stats.best_selling_month.revenue}`
              : "All Time"
          }
          icon="mdi:trophy"
          color="bg-yellow-400"
        />
      </div>

      {/* Invoice Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <GeniusStatCard
          title="Total Invoices"
          value={invoiceSummary?.total_invoices}
          subValue={`Paid: ${invoiceSummary?.paid_count} | Pending: ${invoiceSummary?.pending_count}`}
          icon="mdi:file-document"
          color="bg-green-400"
        />
        <GeniusStatCard
          title="Total Invoice Revenue"
          value={formatEGP(invoiceSummary?.total_revenue)}
          subValue={`Pending: ${formatEGP(
            invoiceSummary?.pending_amount_total
          )}`}
          icon="mdi:cash"
          color="bg-cyan-500"
        />
        <GeniusStatCard
          title="Failed Invoices"
          value={invoiceSummary?.failed_count}
          subValue={`Failed Amount: ${formatEGP(
            invoiceSummary?.failed_amount_total
          )}`}
          icon="mdi:close-circle"
          color="bg-red-400"
        />
        <GeniusStatCard
          title="Confirmed Invoices"
          value={all?.confirmed_invoices_count}
          subValue={`Unconfirmed: ${all?.unconfirmed_invoices_count}`}
          icon="mdi:check-decagram"
          color="bg-teal-500"
        />
      </div>

      {/* New breakdowns row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GeniusStatCard
          title="Total Users"
          value={all?.users_count}
          subValue={`Active: ${all?.active_users_count} | Inactive: ${all?.inactive_users_count}`}
          icon="mdi:account-group"
          color="bg-cyan-500"
        />
        <GeniusStatCard
          title="Testimonials"
          value={all?.testimonials_count}
          subValue={`Accepted: ${all?.accepted_testimonials_count} | Unaccepted: ${all?.unaccepted_testimonials_count}`}
          icon="mdi:comment-quote"
          color="bg-purple-500"
        />
        <GeniusStatCard
          title="Content"
          value={`Trips: ${all?.trips_count}`}
          subValue={`Packages: ${all?.packages_count} | Courses: ${all?.courses_count}`}
          icon="mdi:folder-multiple"
          color="bg-blue-400"
        />
        <GeniusStatCard
          title="Invoices"
          value={all?.invoices_count}
          subValue={`Paid: ${all?.paid_invoices_count} | Pending: ${all?.pending_invoices_count}`}
          icon="mdi:file-document"
          color="bg-green-400"
        />
      </div>
      {/* Top Courses & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon icon="mdi:book-open-page-variant" className="text-blue-600" />
            Top Courses
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    Course
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                    Revenue
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {top_courses && top_courses.length > 0 ? (
                  top_courses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm text-slate-800">
                          {course.name || course.course || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                        {formatEGP(course.revenue || course.total_revenue)}
                      </td>
                      <td className="py-3 px-2 text-center text-sm">
                        {course.count || course.sales_count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-slate-400 py-4">
                      No course data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Activities */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon icon="mdi:run-fast" className="text-pink-600" />
            Top Activities
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    Activity
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                    Revenue
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {top_activities && top_activities.length > 0 ? (
                  top_activities.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm text-slate-800">
                          {activity.name || activity.activity || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                        {formatEGP(activity.revenue || activity.total_revenue)}
                      </td>
                      <td className="py-3 px-2 text-center text-sm">
                        {activity.count || activity.sales_count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-slate-400 py-4">
                      No activity data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Icon icon="mdi:pulse" className="text-cyan-500" />
              Live Pulse
            </h3>
            <button
              onClick={() => setActiveTab("invoices")}
              className="text-sm text-cyan-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recent_transactions?.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.status === "PAID"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <Icon
                      icon={
                        tx.status === "PAID" ? "mdi:check" : "mdi:clock-outline"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{tx.buyer}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • Invoice #{tx.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">
                    {formatEGP(tx.amount)}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-bold ${
                      tx.status === "PAID"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recent_transactions || recent_transactions.length === 0) && (
              <div className="text-center py-10 text-slate-400">
                No recent transactions today
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Top Customers */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Quick Shortcuts
            </h3>
            <div className="space-y-3">
              <QuickActionBtn
                icon="mdi:airplane-plus"
                title="New Trip"
                desc="Create a travel package"
                onClick={() => setActiveTab("trips")}
              />
              <QuickActionBtn
                icon="mdi:ticket-percent"
                title="Create Coupon"
                desc="Run a promotion"
                onClick={() => setActiveTab("coupons")}
              />
            </div>
          </div>

          {/* Top Customer Spotlight */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-4">
                Star Customer
              </h3>
              {top_customers && top_customers.length > 0 ? (
                <>
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md text-3xl">
                    👑
                  </div>
                  <h4 className="text-xl font-bold">{top_customers[0].name}</h4>
                  <p className="text-indigo-200 text-sm mb-4">
                    {top_customers[0].email}
                  </p>
                  <div className="bg-white/10 rounded-lg p-2 inline-block backdrop-blur-sm">
                    <span className="font-bold text-white">
                      {formatEGP(top_customers[0].total_spent)}
                    </span>
                    <span className="text-indigo-200 text-xs ml-1">
                      Lifetime
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-indigo-200">No customer data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;

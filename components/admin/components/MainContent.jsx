"use client";

import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
import InvoiceService from "@/services/invoiceService";
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
          InvoiceService.getInvoiceSummaryAdmin(),
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
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Icon icon="mdi:view-dashboard" className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {admin?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-cyan-50 text-lg">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GeniusStatCard
          title="Total Revenue"
          value={formatEGP(stats?.revenue)}
          subValue={`${stats?.sales_count || 0} Sales`}
          icon="mdi:cash-fast"
          color="bg-emerald-500"
        />
        <GeniusStatCard
          title="Pending Revenue"
          value={formatEGP(stats?.potential_revenue)}
          subValue={`${stats?.pending_invoices || 0} Orders`}
          icon="mdi:cash-clock"
          color="bg-amber-500"
        />
        <GeniusStatCard
          title="Total Users"
          value={all?.users_count || 0}
          subValue={`${all?.active_users_count || 0} Active`}
          icon="mdi:account-group"
          color="bg-cyan-500"
        />
        <GeniusStatCard
          title="Content"
          value={`${all?.trips_count || 0}`}
          subValue={`Trips & ${all?.courses_count || 0} Courses`}
          icon="mdi:folder-multiple"
          color="bg-blue-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:lightning-bolt" className="text-cyan-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionBtn
            icon="mdi:chart-line"
            title="View Analytics"
            desc="Detailed insights & reports"
            onClick={() => setActiveTab("analytics")}
          />
          <QuickActionBtn
            icon="mdi:file-document-edit"
            title="Manage Invoices"
            desc="Track payments & billing"
            onClick={() => setActiveTab("invoices")}
          />
          <QuickActionBtn
            icon="mdi:account-group"
            title="View Users"
            desc="Manage user accounts"
            onClick={() => setActiveTab("users")}
          />
          <QuickActionBtn
            icon="mdi:airplane-plus"
            title="Create Trip"
            desc="Add new travel package"
            onClick={() => setActiveTab("trips")}
          />
          <QuickActionBtn
            icon="mdi:ticket-percent"
            title="Create Coupon"
            desc="Run a promotion"
            onClick={() => setActiveTab("coupons")}
          />
          <QuickActionBtn
            icon="mdi:cog"
            title="Settings"
            desc="Configure platform"
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {recent_transactions && recent_transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icon icon="mdi:pulse" className="text-cyan-500" />
              Recent Activity
            </h3>
            <button
              onClick={() => setActiveTab("invoices")}
              className="text-sm text-cyan-600 hover:underline font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recent_transactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
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
                    <p className="font-medium text-sm text-slate-800">
                      {tx.buyer}
                    </p>
                    <p className="text-xs text-slate-500">Invoice #{tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-800">
                    {formatEGP(tx.amount)}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-semibold ${
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
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroDashboard;

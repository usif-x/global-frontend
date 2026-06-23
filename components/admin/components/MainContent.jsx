"use client";

import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
import getAuthHeaders from "@/utils/auth";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// ---------- Helpers ----------

const formatEGP = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const formatCompact = (amount) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
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

const initials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// confirmation_rate assumed to be 0–1 fraction. If your API returns 0–100
// already, drop the * 100 here.
const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

// ---------- Small building blocks ----------

const GeniusStatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
  trend,
  trendValue,
  span,
}) => (
  <div
    className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300 ${span || ""}`}
  >
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
      {subValue && <div className="mt-3">{subValue}</div>}
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

const SectionHeading = ({ icon, title, action, onAction }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <Icon icon={icon} className="text-cyan-500" />
      {title}
    </h3>
    {action && (
      <button
        onClick={onAction}
        className="text-sm text-cyan-600 hover:underline font-medium"
      >
        {action} →
      </button>
    )}
  </div>
);

// Stacked bar showing paid / pending / failed proportions by amount
const InvoiceSplitBar = ({ paid, pending, failed }) => {
  const total = paid + pending + failed;
  const paidPct = total > 0 ? (paid / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const failedPct = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100">
        {paidPct > 0 && (
          <div className="bg-emerald-500" style={{ width: `${paidPct}%` }} />
        )}
        {pendingPct > 0 && (
          <div className="bg-amber-400" style={{ width: `${pendingPct}%` }} />
        )}
        {failedPct > 0 && (
          <div className="bg-rose-400" style={{ width: `${failedPct}%` }} />
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid{" "}
          {formatEGP(paid)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending{" "}
          {formatEGP(pending)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" /> Failed{" "}
          {formatEGP(failed)}
        </span>
      </div>
    </div>
  );
};

// Circular ring for confirmation rate
const ConfirmationRing = ({ rate }) => {
  const pct = Math.round((rate || 0) * 100);
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: `conic-gradient(#6366f1 ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      >
        <div className="absolute inset-1.5 bg-white rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-slate-700">{pct}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        of invoices confirmed by customers
      </p>
    </div>
  );
};

// Small horizontal bar chart for sales_over_time
const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-10 text-center">
        No sales recorded in this period
      </p>
    );
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 mt-4">
      {data.map((d, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center gap-1.5 group"
          title={`${d.date}: ${formatEGP(d.revenue)} (${d.count} sale${d.count === 1 ? "" : "s"})`}
        >
          <div className="w-full flex items-end justify-center h-24">
            <div
              className="w-full max-w-[28px] rounded-t-md bg-cyan-500 group-hover:bg-cyan-600 transition-colors"
              style={{ height: `${Math.max((d.revenue / max) * 100, 4)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {new Date(d.date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

// Horizontal proportion list for activity / payment-method distributions
const DistributionList = ({ items, colorClass }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-6 text-center">No data yet</p>
    );
  }
  const total = items.reduce((sum, i) => sum + (i.value || 0), 0) || 1;
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const pct = Math.round((item.value / total) * 100);
        return (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 truncate pr-2">
                {item.name}
              </span>
              <span className="text-slate-400 flex-shrink-0">
                {item.value} • {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Generic ranked-list panel for top customers / courses / activities
const RankedListPanel = ({ title, icon, items, emptyLabel, renderItem }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
      <Icon icon={icon} className="text-cyan-500 w-5 h-5" />
      {title}
    </h3>
    {!items || items.length === 0 ? (
      <p className="text-sm text-slate-400 py-6 text-center">{emptyLabel}</p>
    ) : (
      <div className="space-y-1">
        {items.slice(0, 5).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="min-w-0">{renderItem(item)}</div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Small lifecycle badge for invoice statuses
const LifecycleBadge = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
    <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
      <Icon
        icon={icon}
        className={`w-4 h-4 ${color.replace("bg-", "text-")}`}
      />
    </div>
    <div>
      <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

// ---------- Main component ----------

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
      const isLevel2Admin = admin?.admin_level === 2;
      const headers = getAuthHeaders();

      if (!isLevel2Admin) {
        const [all, recentUsersData] = await Promise.all([
          fetch("https://api.hurghada-trips.online/analytics/all", {
            headers,
          }).then((r) => r.json()),
          AdminService.getRecentUsers(),
        ]);

        setDashboardData({ all, recentUsers: recentUsersData });
      } else {
        const [analytics, all, invoiceSummary, recentUsersData] =
          await Promise.all([
            AnalyticsService.getDashboardSummary(),
            fetch("https://api.hurghada-trips.online/analytics/all", {
              headers,
            }).then((r) => r.json()),
            fetch("https://api.hurghada-trips.online/invoices/admin/summary", {
              headers,
            }).then((r) => r.json()),
            AdminService.getRecentUsers(),
          ]);

        setDashboardData({
          ...analytics,
          all,
          invoiceSummary,
          recentUsers: recentUsersData,
        });

        const notifs = [];
        if (invoiceSummary?.pending_count > 0) {
          notifs.push({
            id: 1,
            type: "warning",
            message: `${invoiceSummary.pending_count} invoice${invoiceSummary.pending_count > 1 ? "s" : ""} need review`,
            time: "Today",
          });
        }
        if (invoiceSummary?.failed_count > 0) {
          notifs.push({
            id: 2,
            type: "danger",
            message: `${invoiceSummary.failed_count} invoice${invoiceSummary.failed_count > 1 ? "s" : ""} failed payment`,
            time: "Today",
          });
        }
        if (analytics?.invoices?.not_picked_up > 0) {
          notifs.push({
            id: 3,
            type: "warning",
            message: `${analytics.invoices.not_picked_up} booking${analytics.invoices.not_picked_up > 1 ? "s" : ""} not yet picked up`,
            time: "Today",
          });
        }
        setRecentNotifications(notifs);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const {
    stats,
    charts,
    top_customers,
    top_courses,
    top_activities,
    users,
    testimonials,
    invoices,
    recent_transactions,
    recentUsers,
    all,
    invoiceSummary,
  } = dashboardData || {};

  const isLevel2Admin = admin?.admin_level === 2;

  // Invoice summary (dedicated endpoint) — used for the revenue split bar
  const paidAmount = invoiceSummary?.total_revenue || 0;
  const paidCount = invoiceSummary?.paid_count || 0;
  const pendingAmount = invoiceSummary?.pending_amount_total || 0;
  const pendingCount = invoiceSummary?.pending_count || 0;
  const failedAmount = invoiceSummary?.failed_amount_total || 0;
  const failedCount = invoiceSummary?.failed_count || 0;
  const totalInvoices = invoiceSummary?.total_invoices || 0;
  const collectionRate =
    totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

  const bestMonth = stats?.best_selling_month;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Icon icon="mdi:view-dashboard" className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
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
          <div className="flex items-center gap-2">
            {isLevel2Admin && bestMonth?.revenue > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Icon icon="mdi:trophy" className="w-4 h-4" />
                Best month: {MONTH_NAMES[bestMonth.month - 1]} {bestMonth.year}{" "}
                • {formatEGP(bestMonth.revenue)}
              </span>
            )}
            {isLevel2Admin && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Icon icon="mdi:shield-crown" className="w-4 h-4" />
                Superadmin view
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alerts - Level 2 only */}
      {isLevel2Admin && recentNotifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                n.type === "danger"
                  ? "bg-rose-50 border-rose-100 text-rose-700"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
            >
              <Icon
                icon={n.type === "danger" ? "mdi:alert-circle" : "mdi:alert"}
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="font-medium">{n.message}</span>
              <span className="ml-auto text-xs opacity-60">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Stats Grid (bento) - Level 2 */}
      {isLevel2Admin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GeniusStatCard
            span="md:col-span-2"
            title="Revenue"
            value={formatEGP(paidAmount)}
            icon="mdi:cash-fast"
            color="bg-emerald-500"
            subValue={
              <InvoiceSplitBar
                paid={paidAmount}
                pending={pendingAmount}
                failed={failedAmount}
              />
            }
          />

          <GeniusStatCard
            title="Sales"
            value={stats?.sales_count || 0}
            icon="mdi:cart-check"
            color="bg-cyan-600"
            subValue={
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="font-medium">
                  {stats?.trips_booked || 0} trips
                </span>
                <span className="font-medium">
                  {stats?.courses_booked || 0} courses
                </span>
              </div>
            }
          />

          <GeniusStatCard
            title="Avg. Order Value"
            value={formatEGP(stats?.average_order_value)}
            icon="mdi:calculator-variant"
            color="bg-indigo-500"
            subValue={
              <p className="text-xs text-slate-400">
                {formatEGP(stats?.total_discount_given)} given in discounts
              </p>
            }
          />

          <GeniusStatCard
            title="Confirmation Rate"
            value=""
            icon="mdi:check-decagram"
            color="bg-violet-500"
            subValue={<ConfirmationRing rate={stats?.confirmation_rate} />}
          />
        </div>
      )}

      {/* Content & users overview - all admins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GeniusStatCard
          title="Total Users"
          value={formatCompact(all?.users_count || 0)}
          icon="mdi:account-group"
          color="bg-cyan-500"
          subValue={
            isLevel2Admin && users ? (
              <div className="flex gap-3 text-xs">
                <span className="font-medium text-emerald-600">
                  {users.active} active
                </span>
                <span className="font-medium text-slate-400">
                  {users.inactive} inactive
                </span>
                {users.blocked > 0 && (
                  <span className="font-medium text-rose-600">
                    {users.blocked} blocked
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {all?.active_users_count || 0} active
              </p>
            )
          }
        />
        <GeniusStatCard
          title="Trips"
          value={`${all?.trips_count || 0}`}
          subValue={<p className="text-xs text-slate-400">Available trips</p>}
          icon="mdi:airplane"
          color="bg-blue-500"
        />
        <GeniusStatCard
          title="Courses"
          value={`${all?.courses_count || 0}`}
          subValue={<p className="text-xs text-slate-400">Available courses</p>}
          icon="mdi:book-open-page-variant"
          color="bg-purple-500"
        />
        <GeniusStatCard
          title="Packages"
          value={`${all?.packages_count || 0}`}
          subValue={
            <p className="text-xs text-slate-400">Available packages</p>
          }
          icon="mdi:package-variant"
          color="bg-green-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:lightning-bolt" className="text-cyan-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLevel2Admin && (
            <>
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
            </>
          )}
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
            icon="mdi:package-variant"
            title="Manage Packages"
            desc="Create travel packages"
            onClick={() => setActiveTab("packages")}
          />
          <QuickActionBtn
            icon="mdi:ticket-percent"
            title="Create Coupon"
            desc="Run a promotion"
            onClick={() => setActiveTab("coupons")}
          />
          <QuickActionBtn
            icon="mdi:comment-quote"
            title="Testimonials"
            desc="Review customer feedback"
            onClick={() => setActiveTab("testimonials")}
          />
          {isLevel2Admin && (
            <QuickActionBtn
              icon="mdi:cog"
              title="Settings"
              desc="Configure platform"
              onClick={() => setActiveTab("settings")}
            />
          )}
        </div>
      </div>

      {/* Sales trend + distributions - Level 2 only */}
      {isLevel2Admin && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <SectionHeading
              icon="mdi:chart-bar"
              title="Sales Over Time"
              action="View Analytics"
              onAction={() => setActiveTab("analytics")}
            />
            <SalesTrendChart data={charts?.sales_over_time} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <SectionHeading
                icon="mdi:map-marker-radius"
                title="Activity Distribution"
              />
              <DistributionList
                items={charts?.activity_distribution}
                colorClass="bg-blue-500"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <SectionHeading
                icon="mdi:credit-card-outline"
                title="Payment Methods"
              />
              <DistributionList
                items={charts?.payment_method_distribution}
                colorClass="bg-emerald-500"
              />
            </div>
          </div>

          {/* Invoice lifecycle breakdown */}
          {invoices && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <SectionHeading
                icon="mdi:timeline-clock"
                title="Invoice Lifecycle"
                action="Manage Invoices"
                onAction={() => setActiveTab("invoices")}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <LifecycleBadge
                  label="Confirmed"
                  value={invoices.confirmed}
                  icon="mdi:check-circle"
                  color="bg-emerald-500"
                />
                <LifecycleBadge
                  label="Unconfirmed"
                  value={invoices.unconfirmed}
                  icon="mdi:help-circle"
                  color="bg-amber-500"
                />
                <LifecycleBadge
                  label="Picked Up"
                  value={invoices.picked_up}
                  icon="mdi:bag-checked"
                  color="bg-cyan-500"
                />
                <LifecycleBadge
                  label="Not Picked Up"
                  value={invoices.not_picked_up}
                  icon="mdi:bag-personal"
                  color="bg-orange-500"
                />
                <LifecycleBadge
                  label="Expired"
                  value={invoices.expired}
                  icon="mdi:calendar-remove"
                  color="bg-rose-500"
                />
                <LifecycleBadge
                  label="Cancelled"
                  value={invoices.cancelled}
                  icon="mdi:close-circle"
                  color="bg-slate-400"
                />
                <LifecycleBadge
                  label="Unpaid"
                  value={invoices.unpaid}
                  icon="mdi:cash-remove"
                  color="bg-red-500"
                />
                <LifecycleBadge
                  label="Potential Revenue"
                  value={formatEGP(stats?.potential_revenue)}
                  icon="mdi:cash-clock"
                  color="bg-violet-500"
                />
              </div>
            </div>
          )}

          {/* Top customers / courses / activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RankedListPanel
              title="Top Customers"
              icon="mdi:account-star"
              items={top_customers}
              emptyLabel="No customer data yet"
              renderItem={(c) => (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {c.name || "Unnamed customer"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatEGP(c.total_spent)} • {c.order_count || 0} order
                      {c.order_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              )}
            />

            <RankedListPanel
              title="Top Courses"
              icon="mdi:book-open-page-variant"
              items={top_courses}
              emptyLabel="No course sales yet"
              renderItem={(c) => (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {c.title || c.name || "Untitled course"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatEGP(c.total_revenue)} • {c.sales_count || 0} sales
                  </p>
                </div>
              )}
            />

            <RankedListPanel
              title="Top Activities"
              icon="mdi:airplane"
              items={top_activities}
              emptyLabel="No activity sales yet"
              renderItem={(a) => (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {a.activity || "Untitled activity"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatEGP(a.total_revenue)} • {a.sales_count || 0} sales
                  </p>
                </div>
              )}
            />
          </div>
        </>
      )}

      {/* Recent Activity + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLevel2Admin && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <SectionHeading
              icon="mdi:pulse"
              title="Recent Activity"
              action={recent_transactions?.length ? "View All" : null}
              onAction={() => setActiveTab("invoices")}
            />
            {!recent_transactions || recent_transactions.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-3">
                {recent_transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tx.status === "PAID" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
                      >
                        <Icon
                          icon={
                            tx.status === "PAID"
                              ? "mdi:check"
                              : "mdi:clock-outline"
                          }
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">
                          {tx.buyer}
                        </p>
                        <p className="text-xs text-slate-500">
                          Invoice #{tx.id} • {formatTimeAgo(tx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-800">
                        {formatEGP(tx.amount)}
                      </p>
                      <span
                        className={`text-[10px] uppercase font-semibold ${tx.status === "PAID" ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${isLevel2Admin ? "" : "lg:col-span-3"}`}
        >
          <SectionHeading
            icon="mdi:account-plus"
            title="Recent Users"
            action="View All"
            onAction={() => setActiveTab("users")}
          />
          {!recentUsers || recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No new users yet
            </p>
          ) : (
            <div className="space-y-1">
              {recentUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {u.name || u.email || "Unnamed user"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {formatTimeAgo(u.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials snapshot - Level 2 only */}
      {isLevel2Admin && testimonials && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <SectionHeading
            icon="mdi:comment-quote"
            title="Testimonials"
            action="Review Feedback"
            onAction={() => setActiveTab("testimonials")}
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">
                {testimonials.total}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-600">
                {testimonials.accepted}
              </p>
              <p className="text-xs text-slate-500 mt-1">Accepted</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50">
              <p className="text-2xl font-bold text-amber-600">
                {testimonials.unaccepted}
              </p>
              <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroDashboard;

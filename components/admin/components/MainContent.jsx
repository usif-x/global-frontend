"use client";

import AdminService from "@/services/adminService";
import AnalyticsService from "@/services/analyticsService";
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
            key={item.id || idx}
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

      // Level 1 admins only get basic data
      if (!isLevel2Admin) {
        const [all, recentUsersData] = await Promise.all([
          fetch("https://api.hurghada-trips.online/analytics/all").then((r) =>
            r.json(),
          ),
          AdminService.getRecentUsers(),
        ]);

        setDashboardData({
          all,
          recentUsers: recentUsersData,
        });
      } else {
        // Level 2 admins get full analytics
        const [analytics, all, invoiceSummary, recentUsersData] =
          await Promise.all([
            AnalyticsService.getDashboardSummary(),
            fetch("https://api.hurghada-trips.online/analytics/all").then((r) =>
              r.json(),
            ),
            fetch(
              "https://api.hurghada-trips.online/invoices/admin/summary",
            ).then((r) => r.json()),
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
    top_customers,
    top_courses,
    top_activities,
    testimonials,
    recent_transactions,
    recentUsers,
    all,
    invoiceSummary,
  } = dashboardData || {};

  const isLevel2Admin = admin?.admin_level === 2;

  // Invoice summary (level 2 only)
  const paidAmount = invoiceSummary?.total_revenue || 0;
  const paidCount = invoiceSummary?.paid_count || 0;
  const pendingAmount = invoiceSummary?.pending_amount_total || 0;
  const pendingCount = invoiceSummary?.pending_count || 0;
  const failedAmount = invoiceSummary?.failed_amount_total || 0;
  const failedCount = invoiceSummary?.failed_count || 0;
  const totalInvoices = invoiceSummary?.total_invoices || 0;
  const collectionRate =
    totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

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
          {isLevel2Admin && (
            <span className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Icon icon="mdi:shield-crown" className="w-4 h-4" />
              Superadmin view
            </span>
          )}
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

      {/* Key Stats Grid (bento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLevel2Admin && (
          <>
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
              title="Invoices"
              value={totalInvoices}
              icon="mdi:file-document-edit"
              color="bg-violet-500"
              trend={collectionRate >= 50 ? "up" : "down"}
              trendValue={`${collectionRate}% paid`}
              subValue={
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="font-medium text-emerald-600">
                    {paidCount} paid
                  </span>
                  <span className="font-medium text-amber-600">
                    {pendingCount} pending
                  </span>
                  {failedCount > 0 && (
                    <span className="font-medium text-rose-600">
                      {failedCount} failed
                    </span>
                  )}
                </div>
              }
            />

            <GeniusStatCard
              title="Avg. Invoice"
              value={formatEGP(
                totalInvoices > 0
                  ? (paidAmount + pendingAmount + failedAmount) / totalInvoices
                  : 0,
              )}
              subValue={
                <p className="text-xs text-slate-400">Across all invoices</p>
              }
              icon="mdi:calculator-variant"
              color="bg-indigo-500"
            />
          </>
        )}
        <GeniusStatCard
          title="Total Users"
          value={formatCompact(all?.users_count || 0)}
          subValue={
            <p className="text-xs text-slate-400">
              {all?.active_users_count || 0} active
            </p>
          }
          icon="mdi:account-group"
          color="bg-cyan-500"
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
        <GeniusStatCard
          title="Testimonials"
          value={`${all?.testimonials_count || 0}`}
          subValue={<p className="text-xs text-slate-400">Customer reviews</p>}
          icon="mdi:comment-quote"
          color="bg-red-500"
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

      {/* Insights row - Level 2 only: Top customers / courses / activities */}
      {isLevel2Admin && (
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
                    {formatEGP(c.total_spent)} • {c.orders_count || 0} orders
                  </p>
                </div>
              </div>
            )}
          />

          <RankedListPanel
            title="Top Courses"
            icon="mdi:book-open-page-variant"
            items={top_courses}
            emptyLabel="No course data yet"
            renderItem={(c) => (
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {c.title || c.name || "Untitled course"}
                </p>
                <p className="text-xs text-slate-400">
                  {c.enrollments_count || c.bookings_count || 0} enrollments
                </p>
              </div>
            )}
          />

          <RankedListPanel
            title="Top Activities"
            icon="mdi:airplane"
            items={top_activities}
            emptyLabel="No activity data yet"
            renderItem={(a) => (
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {a.title || a.name || "Untitled activity"}
                </p>
                <p className="text-xs text-slate-400">
                  {a.bookings_count || 0} bookings
                </p>
              </div>
            )}
          />
        </div>
      )}

      {/* Recent Activity + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Level 2 only */}
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          tx.status === "PAID"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
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
                          Invoice #{tx.id}
                        </p>
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
            )}
          </div>
        )}

        {/* Recent Users - all admins */}
        <div
          className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${
            isLevel2Admin ? "" : "lg:col-span-3"
          }`}
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
      {isLevel2Admin && testimonials && testimonials.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <SectionHeading
            icon="mdi:comment-quote"
            title="Latest Testimonials"
            action="View All"
            onAction={() => setActiveTab("testimonials")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div
                key={t.id || idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      icon="mdi:star"
                      className={`w-4 h-4 ${
                        i < (t.rating || 0)
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {t.comment || t.message || "No comment provided"}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {t.customer_name || t.name || "Anonymous"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroDashboard;

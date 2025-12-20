"use client";
import CouponService from "@/services/couponService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Enhanced Loading Spinner with Coupon Theme
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
    </div>
  </div>
);

// Enhanced Skeleton Loader
const CouponSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-purple-200 to-pink-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-slate-200 rounded flex-1"></div>
            <div className="h-10 bg-slate-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "No expiration";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to check if coupon is expired
const isExpired = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

// Enhanced Coupon Card Component
const CouponCard = ({ coupon, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const expired = isExpired(coupon.expire_date);
  const usagePercentage =
    (coupon.used_count / coupon.can_used_up_to) * 100 || 0;

  // Determine status color
  const getStatusColor = () => {
    if (!coupon.is_active) return "bg-slate-500";
    if (expired) return "bg-red-500";
    if (coupon.remaining <= 0) return "bg-orange-500";
    if (usagePercentage > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!coupon.is_active) return "Inactive";
    if (expired) return "Expired";
    if (coupon.remaining <= 0) return "Fully Used";
    if (usagePercentage > 80) return "Running Low";
    return "Active";
  };

  const getActivityIcon = () => {
    switch (coupon.activity) {
      case "trip":
        return "mdi:airplane";
      case "course":
        return "mdi:school";
      default:
        return "mdi:star-circle";
    }
  };

  const getActivityColor = () => {
    switch (coupon.activity) {
      case "trip":
        return "from-blue-500 to-cyan-600";
      case "course":
        return "from-green-500 to-emerald-600";
      default:
        return "from-purple-500 to-pink-600";
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
      {/* Header with gradient */}
      <div
        className={`relative bg-gradient-to-r ${getActivityColor()} p-6 text-white`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon icon={getActivityIcon()} className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90 uppercase">
                {coupon.activity === "all"
                  ? "All Activities"
                  : coupon.activity === "trip"
                  ? "Trips"
                  : "Courses"}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-wider mb-1">
              {coupon.code}
            </h3>
            <p className="text-3xl font-black">
              {coupon.discount_percentage}% OFF
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`${getStatusColor()} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Usage Statistics */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Usage</span>
            <span className="text-sm font-bold text-slate-800">
              {coupon.used_count} / {coupon.can_used_up_to}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                usagePercentage > 80
                  ? "from-orange-500 to-red-600"
                  : "from-green-500 to-emerald-600"
              } transition-all duration-300`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {coupon.remaining} uses remaining
          </p>
        </div>

        {/* Expiration Date */}
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2 text-slate-600">
            <Icon icon="mdi:calendar-clock" className="w-5 h-5" />
            <span className="text-sm font-medium">Expires</span>
          </div>
          <span
            className={`text-sm font-semibold ${
              expired ? "text-red-600" : "text-slate-800"
            }`}
          >
            {formatDate(coupon.expire_date)}
          </span>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors py-2"
        >
          <span className="text-sm font-medium">
            {showDetails ? "Hide Details" : "Show Details"}
          </span>
          <Icon
            icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="w-5 h-5"
          />
        </button>

        {/* Detailed Information (Collapsible) */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t border-slate-200 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Created</p>
                <p className="font-medium text-slate-800">
                  {new Date(coupon.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Last Updated</p>
                <p className="font-medium text-slate-800">
                  {new Date(coupon.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Coupon ID</p>
                <p className="font-medium text-slate-800 font-mono">
                  #{coupon.id}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Can Use</p>
                <p className="font-medium text-slate-800">
                  {coupon.can_used ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Icon icon="mdi:check-circle" className="w-4 h-4" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <Icon icon="mdi:close-circle" className="w-4 h-4" />
                      No
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => onEdit(coupon)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-sky-600 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Icon icon="mdi:pencil" className="w-5 h-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(coupon)}
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Icon icon="mdi:delete" className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`bg-gradient-to-br ${color
            .replace("text-", "from-")
            .replace("-600", "-500")} to-${
            color.split("-")[1]
          }-600 p-3 rounded-xl`}
        >
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

//=================================================================
//  MAIN COUPON LIST COMPONENT
//=================================================================
const CouponList = ({ onAdd, onEdit }) => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'inactive', 'expired'

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await CouponService.getAll();
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await CouponService.getUsageStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching coupon statistics:", error);
    }
  };

  const handleDelete = async (coupon) => {
    if (
      !confirm(
        `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await CouponService.delete(coupon.id);
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
      fetchStats();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === "active")
      return coupon.is_active && !isExpired(coupon.expire_date);
    if (filter === "inactive") return !coupon.is_active;
    if (filter === "expired") return isExpired(coupon.expire_date);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                <Icon
                  icon="mdi:ticket-percent"
                  className="w-10 h-10 text-white"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Coupon Management
                </h1>
                <p className="text-slate-600">
                  Create and manage discount coupons for your trips and courses
                </p>
              </div>
            </div>
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 whitespace-nowrap"
            >
              <Icon icon="mdi:plus-circle" className="w-6 h-6" />
              <span>Create New Coupon</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon="mdi:ticket-percent"
              title="Total Coupons"
              value={stats.total_coupons}
              color="text-purple-600"
            />
            <StatCard
              icon="mdi:check-circle"
              title="Active Coupons"
              value={stats.active_coupons}
              color="text-green-600"
            />
            <StatCard
              icon="mdi:counter"
              title="Total Uses"
              value={stats.total_usage}
              color="text-blue-600"
            />
            <StatCard
              icon="mdi:percent"
              title="Avg Discount"
              value={
                stats.coupons && stats.coupons.length > 0
                  ? `${(
                      stats.coupons.reduce(
                        (sum, c) => sum + (c.discount_percentage || 0),
                        0
                      ) / stats.coupons.length
                    ).toFixed(1)}%`
                  : "0%"
              }
              color="text-orange-600"
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon
              icon="mdi:filter-variant"
              className="w-6 h-6 text-purple-600"
            />
            <h2 className="text-lg font-bold text-slate-800">Filter Coupons</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Coupons", icon: "mdi:view-grid" },
              { key: "active", label: "Active", icon: "mdi:check-circle" },
              { key: "inactive", label: "Inactive", icon: "mdi:close-circle" },
              { key: "expired", label: "Expired", icon: "mdi:calendar-remove" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    filter === tab.key
                      ? "bg-white/30 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {
                    coupons.filter((c) => {
                      if (tab.key === "active")
                        return c.is_active && !isExpired(c.expire_date);
                      if (tab.key === "inactive") return !c.is_active;
                      if (tab.key === "expired")
                        return isExpired(c.expire_date);
                      return true;
                    }).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <LoadingSpinner />
            <p className="text-center text-slate-600 font-medium mt-4">
              Loading coupons...
            </p>
            <CouponSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCoupons.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-16 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon
                icon="mdi:ticket-percent"
                className="w-14 h-14 text-purple-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              {filter === "all" ? "No Coupons Yet" : `No ${filter} Coupons`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === "all"
                ? "Create your first coupon to offer discounts to your users"
                : `There are no ${filter} coupons at the moment`}
            </p>
            {filter === "all" && (
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2"
              >
                <Icon icon="mdi:plus-circle" className="w-6 h-6" />
                <span>Create First Coupon</span>
              </button>
            )}
          </div>
        )}

        {/* Coupon Grid */}
        {!loading && filteredCoupons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponList;

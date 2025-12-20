"use client";
import PublicNotificationService from "@/services/publicNotificationService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);

// Skeleton Loader
const NotificationSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="h-24 bg-gradient-to-r from-cyan-200 to-blue-200"></div>
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
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Notification Card Component
const NotificationCard = ({ notification, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeGradient = () => {
    switch (notification.type) {
      case "success":
        return "from-green-500 to-emerald-600";
      case "warning":
        return "from-yellow-500 to-orange-600";
      case "error":
        return "from-red-500 to-rose-600";
      case "info":
      default:
        return "from-cyan-500 to-blue-600";
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case "success":
        return "mdi:check-circle";
      case "warning":
        return "mdi:alert";
      case "error":
        return "mdi:close-circle";
      case "info":
      default:
        return "mdi:information";
    }
  };

  const getTypeBadgeColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "info":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Header with Gradient */}
      <div
        className={`bg-gradient-to-r ${getTypeGradient()} p-6 text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Icon icon={getTypeIcon()} className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <Icon icon="mdi:bullhorn" className="w-8 h-8" />
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeColor()} capitalize`}
            >
              {notification.type}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">
            {notification.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <p className="text-slate-600 text-sm line-clamp-3">
            {notification.message}
          </p>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium flex items-center space-x-1 mb-4"
        >
          <span>{showDetails ? "Hide" : "Show"} Details</span>
          <Icon
            icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="w-4 h-4"
          />
        </button>

        {/* Expandable Details */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t border-slate-200 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Created</p>
                <p className="font-medium text-slate-800">
                  {formatDate(notification.created_at)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Notification ID</p>
                <p className="font-medium text-slate-800 font-mono">
                  #{notification.id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-200 mt-4">
          <button
            onClick={() => onEdit(notification)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-sky-600 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Icon icon="mdi:pencil" className="w-5 h-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(notification)}
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
const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
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
//  MAIN COMPONENT
//=================================================================
const PublicNotificationList = ({ onEdit, onAdd }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'info', 'success', 'warning', 'error'

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await PublicNotificationService.getAll(0, 100);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotification) return;
    try {
      setDeleteLoading(true);
      await PublicNotificationService.delete(selectedNotification.id);
      toast.success("Notification deleted successfully!");
      setNotifications(
        notifications.filter((n) => n.id !== selectedNotification.id)
      );
      setShowDeleteModal(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(error.message || "Failed to delete notification");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  // Calculate statistics
  const stats = {
    total: notifications.length,
    info: notifications.filter((n) => n.type === "info").length,
    success: notifications.filter((n) => n.type === "success").length,
    warning: notifications.filter((n) => n.type === "warning").length,
    error: notifications.filter((n) => n.type === "error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Icon icon="mdi:bullhorn" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Public Notifications</h1>
              <p className="text-cyan-100">
                Manage global notifications visible to all users
              </p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <Icon icon="mdi:plus-circle" className="w-6 h-6" />
            <span>Add Notification</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon="mdi:bell-ring"
          title="Total Notifications"
          value={stats.total}
          color="text-cyan-600"
        />
        <StatCard
          icon="mdi:information"
          title="Info"
          value={stats.info}
          color="text-blue-600"
        />
        <StatCard
          icon="mdi:check-circle"
          title="Success"
          value={stats.success}
          color="text-green-600"
        />
        <StatCard
          icon="mdi:alert"
          title="Warning"
          value={stats.warning}
          color="text-yellow-600"
        />
        <StatCard
          icon="mdi:close-circle"
          title="Error"
          value={stats.error}
          color="text-red-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon icon="mdi:filter-variant" className="w-6 h-6 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Filter Notifications
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "all", label: "All", icon: "mdi:view-grid" },
            { key: "info", label: "Info", icon: "mdi:information" },
            { key: "success", label: "Success", icon: "mdi:check-circle" },
            { key: "warning", label: "Warning", icon: "mdi:alert" },
            { key: "error", label: "Error", icon: "mdi:close-circle" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                filter === tab.key
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon icon={tab.icon} className="w-5 h-5" />
              <span>{tab.label}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  filter === tab.key
                    ? "bg-white/30 text-white"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                {tab.key === "all" ? stats.total : stats[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <LoadingSpinner />
          <p className="text-center text-slate-600 font-medium mt-4">
            Loading notifications...
          </p>
          <NotificationSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNotifications.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-16 text-center">
          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Icon icon="mdi:bullhorn" className="w-14 h-14 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            {filter === "all"
              ? "No Notifications Yet"
              : `No ${filter} Notifications`}
          </h3>
          <p className="text-slate-600 mb-6">
            {filter === "all"
              ? "Create your first notification to inform users"
              : `There are no ${filter} notifications at the moment`}
          </p>
          {filter === "all" && (
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Icon icon="mdi:plus-circle" className="w-6 h-6" />
              <span>Create First Notification</span>
            </button>
          )}
        </div>
      )}

      {/* Notification Grid */}
      {!isLoading && filteredNotifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <Icon icon="mdi:alert-circle" className="w-8 h-8" />
                <h3 className="text-xl font-bold">Delete Notification</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete this notification?
              </p>
              <p className="font-semibold text-slate-800 mb-4">
                "{selectedNotification?.title}"
              </p>
              <p className="text-sm text-slate-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-6 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:delete" className="w-5 h-5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicNotificationList;

"use client";
import PublicNotificationService from "@/services/publicNotificationService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PublicNotificationList = ({ onEdit, onAdd }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await PublicNotificationService.getAll(0, 100); // Fetching up to 100 for now
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
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

  const getTypeColor = (type) => {
    switch (type) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Public Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage global notifications visible to all users
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
          Add Notification
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <Icon
                    icon="mdi:bell-off-outline"
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p>No notifications found</p>
                </td>
              </tr>
            ) : (
              notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {notification.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(notification)}
                      className="text-cyan-600 hover:text-cyan-900 mr-4"
                    >
                      <Icon icon="mdi:pencil" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icon icon="mdi:delete" className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Notification
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{selectedNotification?.title}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicNotificationList;

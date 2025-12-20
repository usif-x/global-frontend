"use client";
import PublicNotificationService from "@/services/publicNotificationService";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";

const PublicNotificationForm = ({ notification, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: notification?.title || "",
    message: notification?.message || "",
    type: notification?.type || "info",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (notification) {
        await PublicNotificationService.update(notification.id, formData);
        toast.success("Notification updated successfully");
      } else {
        await PublicNotificationService.create(formData);
        toast.success("Notification created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving notification:", error);
      toast.error(error.message || "Failed to save notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          {notification ? "Edit Notification" : "Create Notification"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {notification
            ? "Update existing notification details"
            : "Create a new global notification"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="e.g., Summer Sale!"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter detailed notification message..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {loading && (
              <Icon icon="mdi:loading" className="w-5 h-5 mr-2 animate-spin" />
            )}
            {notification ? "Update Notification" : "Create Notification"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicNotificationForm;

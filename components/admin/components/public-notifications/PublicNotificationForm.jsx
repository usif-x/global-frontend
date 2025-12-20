"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
      // Validate
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setLoading(false);
        return;
      }

      if (!formData.message.trim()) {
        toast.error("Message is required");
        setLoading(false);
        return;
      }

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
      toast.error(
        error.response?.data?.detail ||
          "Failed to save notification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    {
      value: "info",
      label: "Info",
      icon: "mdi:information",
      color: "text-blue-600",
    },
    {
      value: "success",
      label: "Success",
      icon: "mdi:check-circle",
      color: "text-green-600",
    },
    {
      value: "warning",
      label: "Warning",
      icon: "mdi:alert",
      color: "text-yellow-600",
    },
    {
      value: "error",
      label: "Error",
      icon: "mdi:close-circle",
      color: "text-red-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Icon icon="mdi:bullhorn" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {notification ? "Edit Notification" : "Create New Notification"}
            </h2>
            <p className="text-sm text-slate-500">
              {notification
                ? "Update notification details"
                : "Add a new global notification for users"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Close"
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <Input
            icon="mdi:format-title"
            name="title"
            type="text"
            placeholder="e.g., Summer Sale!"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            required
            color="cyan"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notification Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: option.value }))
                }
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === option.value
                    ? "border-cyan-500 bg-cyan-50 shadow-lg transform scale-105"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
                disabled={loading}
              >
                <Icon
                  icon={option.icon}
                  className={`w-8 h-8 mb-2 ${
                    formData.type === option.value
                      ? option.color
                      : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    formData.type === option.value
                      ? "text-cyan-700"
                      : "text-slate-600"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            required
            rows="5"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Enter detailed notification message..."
          />
          <p className="mt-1 text-xs text-slate-500">
            This message will be displayed to all users on the website
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon
                  icon={notification ? "mdi:content-save" : "mdi:plus-circle"}
                  className="w-5 h-5"
                />
                <span>
                  {notification ? "Update Notification" : "Create Notification"}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PublicNotificationForm;

"use client";
import { useState } from "react";
import PublicNotificationForm from "./PublicNotificationForm";
import PublicNotificationList from "./PublicNotificationList";

const PublicNotificationManagement = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleAdd = () => {
    setSelectedNotification(null);
    setCurrentView("add");
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setCurrentView("edit");
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedNotification(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedNotification(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <PublicNotificationList onAdd={handleAdd} onEdit={handleEdit} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <PublicNotificationForm
          notification={selectedNotification}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default PublicNotificationManagement;

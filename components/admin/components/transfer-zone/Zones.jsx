"use client";
import { useState } from "react";
import TransferZoneForm from "./ZoneForm";
import TransferZoneList from "./ZoneList";

const TransferZoneManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'add', 'edit'
  const [selectedZone, setSelectedZone] = useState(null);

  const handleAddZone = () => {
    setSelectedZone(null);
    setCurrentView("add");
  };

  const handleEditZone = (zone) => {
    setSelectedZone(zone);
    setCurrentView("edit");
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedZone(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedZone(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <TransferZoneList onAdd={handleAddZone} onEdit={handleEditZone} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <TransferZoneForm
          zone={selectedZone}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TransferZoneManagement;

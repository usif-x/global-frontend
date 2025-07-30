"use client";
import { useState } from "react";
import TripForm from "./TripForm";
import TripList from "./TripList";

const TripManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'add', 'edit'
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleAddTrip = () => {
    setSelectedTrip(null);
    setCurrentView("add");
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setCurrentView("edit");
  };

  const handleSuccess = (tripData) => {
    // Trip was successfully created or updated
    setCurrentView("list");
    setSelectedTrip(null);
    // The list will automatically refresh
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedTrip(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <TripList onAdd={handleAddTrip} onEdit={handleEditTrip} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <TripForm
          trip={selectedTrip}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TripManagement;

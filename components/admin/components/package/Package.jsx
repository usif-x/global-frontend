"use client";
import { useState } from "react";
import PackageForm from "./PackageForm";
import PackageList from "./PackageList";

const PackageManagement = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleAddPackage = () => {
    setSelectedPackage(null);
    setCurrentView("add");
  };

  const handleEditPackage = (packageData) => {
    setSelectedPackage(packageData);
    setCurrentView("edit");
  };

  const handleSuccess = (packageData) => {
    // Package was successfully created or updated
    setCurrentView("list");
    setSelectedPackage(null);
    // The list will automatically refresh
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedPackage(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <PackageList onAdd={handleAddPackage} onEdit={handleEditPackage} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <PackageForm
          package={selectedPackage}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default PackageManagement;

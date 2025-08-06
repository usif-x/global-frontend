"use client";
import { useState } from "react";
import BestSellingForm from "./BestSellingForm";
import BestSellingList from "./BestSellingList";

const BestSellingMain = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = (data) => {
    setShowForm(false);
    setSelectedItem(null);
    // Trigger refresh of the list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Best Selling Management</h1>
            <p className="text-amber-100 mt-1">
              Manage and showcase your top performing courses and trips
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <BestSellingList
        key={refreshTrigger} // This will force re-render when refreshTrigger changes
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      {showForm && (
        <BestSellingForm
          initialData={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default BestSellingMain;

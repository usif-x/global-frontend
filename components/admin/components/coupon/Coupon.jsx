"use client";
import { useState } from "react";
import CouponForm from "./CouponForm";
import CouponList from "./CouponList";

const CouponManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'add', 'edit'
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setCurrentView("add");
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setCurrentView("edit");
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedCoupon(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedCoupon(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <CouponList onAdd={handleAddCoupon} onEdit={handleEditCoupon} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <CouponForm
          coupon={selectedCoupon}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CouponManagement;

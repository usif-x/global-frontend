"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import CouponService from "@/services/couponService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CouponForm = ({ coupon, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: "",
    activity: "all",
    discount_percentage: "",
    can_used_up_to: "",
    user_limit: 1,
    is_active: true,
    expire_date: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        activity: coupon.activity || "all",
        discount_percentage: coupon.discount_percentage || "",
        can_used_up_to: coupon.can_used_up_to || "",
        user_limit: coupon.user_limit ?? 1,
        is_active: coupon.is_active ?? true,
        expire_date: coupon.expire_date
          ? new Date(coupon.expire_date).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.code.trim()) {
        toast.error("Coupon code is required");
        setLoading(false);
        return;
      }

      if (
        !formData.discount_percentage ||
        formData.discount_percentage <= 0 ||
        formData.discount_percentage > 100
      ) {
        toast.error("Discount percentage must be between 0 and 100");
        setLoading(false);
        return;
      }

      if (!formData.can_used_up_to || formData.can_used_up_to <= 0) {
        toast.error("Usage limit must be greater than 0");
        setLoading(false);
        return;
      }

      // Prepare data
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        activity: formData.activity,
        user_limit: parseInt(formData.user_limit),
        discount_percentage: parseFloat(formData.discount_percentage),
        can_used_up_to: parseInt(formData.can_used_up_to),
        is_active: formData.is_active,
      };

      // Add expire_date only if provided
      if (formData.expire_date) {
        submitData.expire_date = new Date(formData.expire_date).toISOString();
      }

      let result;
      if (coupon) {
        result = await CouponService.update(coupon.id, submitData);
        toast.success("Coupon updated successfully!");
      } else {
        result = await CouponService.create(submitData);
        toast.success("Coupon created successfully!");
      }

      onSuccess(result);
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to save coupon. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const activityOptions = [
    { value: "all", label: "All Activities" },
    { value: "trip", label: "Trips Only" },
    { value: "course", label: "Courses Only" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Icon icon="mdi:ticket-percent" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {coupon ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <p className="text-sm text-slate-500">
              {coupon
                ? "Update coupon details"
                : "Add a new discount coupon for users"}
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
        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Coupon Code *
          </label>
          <Input
            icon="mdi:ticket-confirmation"
            name="code"
            type="text"
            placeholder="e.g., SUMMER2024"
            value={formData.code}
            onChange={handleChange}
            disabled={loading || !!coupon}
            required
            className="uppercase"
            color="cyan"
          />
          <p className="mt-1 text-xs text-slate-500">
            {coupon
              ? "Coupon code cannot be changed after creation"
              : "Will be converted to uppercase automatically"}
          </p>
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Activity Type *
          </label>
          <Select
            icon="mdi:format-list-bulleted-type"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            options={activityOptions}
            disabled={loading}
            required
          />
        </div>

        {/* Discount Percentage */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Discount Percentage * (0-100)
          </label>
          <Input
            icon="mdi:percent"
            name="discount_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 15.5"
            value={formData.discount_percentage}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Usage Limit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum Usage Count *
          </label>
          <Input
            icon="mdi:counter"
            name="can_used_up_to"
            type="number"
            min="1"
            placeholder="e.g., 100"
            value={formData.can_used_up_to}
            onChange={handleChange}
            disabled={loading}
            required
          />
          {coupon && (
            <p className="mt-1 text-xs text-slate-500">
              Currently used: {coupon.used_count} times
            </p>
          )}

          {/* User Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Per-User Usage Limit *
            </label>
            <Input
              icon="mdi:account-check"
              name="user_limit"
              type="number"
              min="0"
              placeholder="e.g., 1 (0 for unlimited)"
              value={formData.user_limit}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              How many times a single user can use this coupon (0 = unlimited)
            </p>
          </div>
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expiration Date (Optional)
          </label>
          <Input
            icon="mdi:calendar-clock"
            name="expire_date"
            type="datetime-local"
            value={formData.expire_date}
            onChange={handleChange}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-slate-500">
            Leave empty for no expiration
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            disabled={loading}
            className="w-5 h-5 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Active (users can apply this coupon)
          </label>
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
                  icon={coupon ? "mdi:content-save" : "mdi:plus-circle"}
                  className="w-5 h-5"
                />
                <span>{coupon ? "Update Coupon" : "Create Coupon"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;

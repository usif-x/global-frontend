"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import bundleService from "@/services/bundleService";
import tripService from "@/services/tripService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  MultiSelectChips — reused from TripForm pattern
//=================================================================
const MultiSelectChips = ({
  options,
  selectedIds,
  onChange,
  disabled,
  emptyText,
}) => {
  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200">
      {options.length === 0 && (
        <p className="text-sm text-slate-400">
          {emptyText || "No options available"}
        </p>
      )}
      {options.map((opt) => {
        const active = selectedIds.includes(opt.value);
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => toggle(opt.value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 flex items-center gap-1.5 ${
              active
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {active && <Icon icon="mdi:check" className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

//=================================================================
//  BundleOfferForm
//=================================================================
const BundleOfferForm = ({ bundle = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allTrips, setAllTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offer_trip_id: "",
    discount_type: "percentage",
    discount_value: "",
    required_trip_ids: [],
    min_required_trips: 0, // 0 = "all required trips"
    is_active: true,
    valid_from: "",
    valid_until: "",
  });

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const trips = await tripService.getAll();
        setAllTrips(trips || []);
      } catch (err) {
        toast.error("Failed to load trips");
      } finally {
        setIsLoadingTrips(false);
      }
    };
    loadTrips();

    if (bundle) {
      setFormData({
        name: bundle.name || "",
        description: bundle.description || "",
        offer_trip_id: bundle.offer_trip_id?.toString() || "",
        discount_type: bundle.discount_type || "percentage",
        discount_value: bundle.discount_value?.toString() || "",
        required_trip_ids: bundle.required_trip_ids || [],
        min_required_trips: bundle.min_required_trips || 0,
        is_active: bundle.is_active ?? true,
        valid_from: bundle.valid_from ? bundle.valid_from.slice(0, 10) : "",
        valid_until: bundle.valid_until ? bundle.valid_until.slice(0, 10) : "",
      });
    }
  }, [bundle]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const tripOptions = allTrips.map((t) => ({ value: t.id, label: t.name }));

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.offer_trip_id)
      newErrors.offer_trip_id = "Select the trip that becomes discounted";
    if (formData.required_trip_ids.length === 0)
      newErrors.required_trip_ids = "Select at least one required trip";
    if (
      formData.required_trip_ids.includes(parseInt(formData.offer_trip_id, 10))
    )
      newErrors.offer_trip_id =
        "The offer trip can't also be one of the required trips";
    if (formData.discount_type !== "free") {
      if (!formData.discount_value || parseFloat(formData.discount_value) <= 0)
        newErrors.discount_value = "Enter a discount value";
      if (
        formData.discount_type === "percentage" &&
        parseFloat(formData.discount_value) > 100
      )
        newErrors.discount_value = "Percentage can't exceed 100";
    }
    if (
      formData.min_required_trips &&
      parseInt(formData.min_required_trips, 10) >
        formData.required_trip_ids.length
    )
      newErrors.min_required_trips =
        "Can't require more trips than are selected below";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        offer_trip_id: parseInt(formData.offer_trip_id, 10),
        discount_type: formData.discount_type,
        discount_value:
          formData.discount_type === "free"
            ? 0
            : parseFloat(formData.discount_value),
        required_trip_ids: formData.required_trip_ids.map((id) =>
          parseInt(id, 10),
        ),
        min_required_trips: parseInt(formData.min_required_trips, 10) || 0,
        is_active: formData.is_active,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
      };

      let result;
      if (bundle) {
        result = await bundleService.update(bundle.id, payload);
        toast.success("🎉 Bundle offer updated!");
      } else {
        result = await bundleService.create(payload);
        toast.success("🎉 Bundle offer created!");
      }
      onSuccess && onSuccess(result);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.message ||
          "Failed to save bundle offer",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:gift-outline" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {bundle ? "Edit Bundle Offer" : "Create Bundle Offer"}
              </h2>
              <p className="text-amber-100 mt-1">
                Reward customers for booking multiple trips together
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            disabled={isLoading}
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Offer Details
          </h3>
          <Input
            dir="ltr"
            icon="mdi:tag-text"
            placeholder="Offer name (e.g. Safari + Snorkeling Combo)"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            color="turquoise"
            required
            disabled={isLoading}
          />
          <Input
            dir="ltr"
            icon="mdi:text"
            placeholder="Description (optional, shown to customer)"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon icon="mdi:cart-check" className="w-5 h-5 text-amber-600" />
            Step 1 — Which trips unlock the offer?
          </h3>
          <p className="text-sm text-slate-600">
            Select the trips a customer needs to book. Choose whether they need{" "}
            <strong>all</strong> of them, or just <strong>some</strong> of them.
          </p>

          <MultiSelectChips
            options={tripOptions}
            selectedIds={formData.required_trip_ids}
            onChange={(ids) => handleChange("required_trip_ids", ids)}
            disabled={isLoading || isLoadingTrips}
            emptyText={
              isLoadingTrips ? "Loading trips..." : "No trips available"
            }
          />
          {errors.required_trip_ids && (
            <p className="text-sm text-red-500">{errors.required_trip_ids}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              icon="mdi:counter"
              dir="ltr"
              options={[
                { value: 0, label: "All selected trips required" },
                ...Array.from(
                  {
                    length: Math.max(formData.required_trip_ids.length - 1, 0),
                  },
                  (_, i) => ({
                    value: i + 1,
                    label: `Any ${i + 1} of the selected trips`,
                  }),
                ),
              ]}
              value={{
                value: formData.min_required_trips,
                label:
                  formData.min_required_trips === 0
                    ? "All selected trips required"
                    : `Any ${formData.min_required_trips} of the selected trips`,
              }}
              onChange={(opt) => handleChange("min_required_trips", opt.value)}
              placeholder="Requirement rule"
              disabled={isLoading || formData.required_trip_ids.length === 0}
            />
          </div>
          {errors.min_required_trips && (
            <p className="text-sm text-red-500">{errors.min_required_trips}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon icon="mdi:gift" className="w-5 h-5 text-green-600" />
            Step 2 — What gets discounted?
          </h3>

          <Select
            icon="mdi:airplane"
            dir="ltr"
            options={tripOptions}
            placeholder="Select the trip that becomes discounted *"
            value={tripOptions.find(
              (t) => t.value.toString() === formData.offer_trip_id.toString(),
            )}
            onChange={(opt) => handleChange("offer_trip_id", opt.value)}
            error={errors.offer_trip_id}
            searchable={true}
            disabled={isLoading || isLoadingTrips}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              icon="mdi:swap-horizontal"
              dir="ltr"
              options={[
                { value: "percentage", label: "Percentage off" },
                { value: "fixed", label: "Fixed amount off" },
                { value: "free", label: "Completely free" },
              ]}
              value={{
                value: formData.discount_type,
                label:
                  formData.discount_type === "percentage"
                    ? "Percentage off"
                    : formData.discount_type === "fixed"
                      ? "Fixed amount off"
                      : "Completely free",
              }}
              onChange={(opt) => handleChange("discount_type", opt.value)}
              placeholder="Discount type"
              disabled={isLoading}
            />

            {formData.discount_type !== "free" && (
              <Input
                dir="ltr"
                icon="mdi:cash"
                type="number"
                step="0.01"
                placeholder={
                  formData.discount_type === "percentage"
                    ? "Percentage (e.g. 25)"
                    : "Amount (EGP)"
                }
                value={formData.discount_value}
                onChange={(e) => handleChange("discount_value", e.target.value)}
                error={errors.discount_value}
                color="green"
                disabled={isLoading}
              />
            )}
          </div>

          {formData.discount_type === "free" && (
            <div className="bg-white border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-start gap-2">
              <Icon icon="mdi:information" className="w-4 h-4 mt-0.5" />
              <span>
                The selected offer trip will be completely free once this bundle
                is unlocked.
              </span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon
              icon="mdi:calendar-range"
              className="w-5 h-5 text-purple-600"
            />
            Availability (optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              dir="ltr"
              icon="mdi:calendar-start"
              type="date"
              placeholder="Valid from"
              value={formData.valid_from}
              onChange={(e) => handleChange("valid_from", e.target.value)}
              disabled={isLoading}
            />
            <Input
              dir="ltr"
              icon="mdi:calendar-end"
              type="date"
              placeholder="Valid until"
              value={formData.valid_until}
              onChange={(e) => handleChange("valid_until", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-slate-700">
              Active (uncheck to pause this offer without deleting it)
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Button
            type="button"
            color="gray"
            text="Cancel"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:check-circle" className="w-5 h-5" />
                <span>{bundle ? "Update Offer" : "Create Offer"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BundleOfferForm;

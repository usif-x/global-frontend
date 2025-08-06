"use client";
import BestSellingService from "@/services/bestsellingService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const BestSellingForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    item_type: "course",
    item_id: "",
    ranking_position: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        item_type: initialData.item_type || "course",
        item_id: initialData.item_id?.toString() || "",
        ranking_position: initialData.ranking_position?.toString() || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    // We don't reset item_id when changing type in edit mode
    // as it's pre-filled and disabled.
    if (!isEditMode) {
      setFormData((prev) => ({ ...prev, item_id: "" }));
    }
    loadAvailableItems();
  }, [formData.item_type]);

  const loadAvailableItems = async () => {
    if (!formData.item_type) return;

    try {
      setIsLoadingItems(true);
      let items = [];

      if (formData.item_type === "course") {
        items = await BestSellingService.getCourses();
      } else {
        items = await BestSellingService.getTrips();
      }

      setAvailableItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error(`Failed to load ${formData.item_type}s`);
      setAvailableItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const getSelectedItemDetails = () => {
    if (!formData.item_id) return null;
    return availableItems.find(
      (item) => item.id.toString() === formData.item_id
    );
  };

  const selectedItem = getSelectedItemDetails();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.item_type) {
      newErrors.item_type = "Item type is required";
    }

    if (!formData.item_id) {
      newErrors.item_id = "Please select an item";
    }

    if (!formData.ranking_position) {
      newErrors.ranking_position = "Ranking position is required";
    } else if (parseInt(formData.ranking_position, 10) < 1) {
      newErrors.ranking_position = "Ranking position must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing/changing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrors({}); // Clear previous errors

      const submitData = {
        item_type: formData.item_type,
        item_id: parseInt(formData.item_id, 10),
        ranking_position: parseInt(formData.ranking_position, 10),
      };

      let result;
      if (isEditMode) {
        result = await BestSellingService.update(initialData.id, submitData);
        toast.success("Best selling item updated successfully!");
      } else {
        result = await BestSellingService.create(submitData);
        toast.success("Item added to best selling list!");
      }

      onSubmit(result);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);

      if (error.response?.status === 400 || error.response?.status === 409) {
        setErrors({ general: errorMessage });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon icon="mdi:star-circle" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isEditMode
                      ? "Edit Best Selling Item"
                      : "Add to Best Selling"}
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {isEditMode
                      ? "Update the best selling item details"
                      : "Select an item to add to the best selling list"}
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <Icon icon="mdi:alert-circle" className="w-5 h-5" />
                  <span className="font-medium">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Item Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Item Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "course",
                    label: "Course",
                    icon: "mdi:school",
                    color: "blue",
                  },
                  {
                    value: "trip",
                    label: "Trip",
                    icon: "mdi:airplane",
                    color: "green",
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange("item_type", type.value)}
                    disabled={isEditMode} // Disable in edit mode
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.item_type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : "border-slate-200 hover:border-slate-300"
                    } ${
                      isEditMode
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon={type.icon}
                        className={`w-6 h-6 ${
                          formData.item_type === type.value
                            ? `text-${type.color}-600`
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          formData.item_type === type.value
                            ? `text-${type.color}-800`
                            : "text-slate-600"
                        }`}
                      >
                        {type.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.item_type && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <Icon icon="mdi:alert-circle-outline" className="w-4 h-4" />
                  <span>{errors.item_type}</span>
                </p>
              )}
            </div>

            {/* Item Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Select {formData.item_type === "course" ? "Course" : "Trip"} *
              </label>

              {isLoadingItems ? (
                <div className="flex items-center justify-center py-8 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Loading {formData.item_type}s...</span>
                  </div>
                </div>
              ) : (
                <select
                  value={formData.item_id}
                  onChange={(e) => handleInputChange("item_id", e.target.value)}
                  disabled={isEditMode} // Disable in edit mode
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                    errors.item_id ? "border-red-300" : "border-slate-300"
                  } ${isEditMode ? "bg-slate-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    Choose a{" "}
                    {formData.item_type === "course" ? "course" : "trip"}...
                  </option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.price && `- $${item.price}`}
                    </option>
                  ))}
                </select>
              )}

              {errors.item_id && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <Icon icon="mdi:alert-circle-outline" className="w-4 h-4" />
                  <span>{errors.item_id}</span>
                </p>
              )}
            </div>

            {/* Selected Item Preview */}
            {selectedItem && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <Icon icon="mdi:eye" className="w-4 h-4" />
                  <span>Selected Item Preview</span>
                </h4>
                <div className="flex items-center space-x-4">
                  {selectedItem.images && selectedItem.images.length > 0 ? (
                    <img
                      src={selectedItem.images[0]}
                      alt={selectedItem.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${
                        formData.item_type === "course"
                          ? "from-blue-400 to-blue-600"
                          : "from-green-400 to-green-600"
                      } rounded-lg flex items-center justify-center`}
                    >
                      <Icon
                        icon={
                          formData.item_type === "course"
                            ? "mdi:school"
                            : "mdi:airplane"
                        }
                        className="w-8 h-8 text-white"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {selectedItem.name}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {selectedItem.description}
                    </p>
                    {selectedItem.price && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        ${selectedItem.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ranking Position */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Ranking Position *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formData.ranking_position}
                  onChange={(e) =>
                    handleInputChange("ranking_position", e.target.value)
                  }
                  placeholder="Enter ranking position (1, 2, 3...)"
                  className={`w-full p-4 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                    errors.ranking_position
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                />
                <Icon
                  icon="mdi:trophy"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-500">
                Lower numbers appear first (1 = top position).
              </p>
              {errors.ranking_position && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <Icon icon="mdi:alert-circle-outline" className="w-4 h-4" />
                  <span>{errors.ranking_position}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingItems}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                    <span>{isEditMode ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <>
                    <Icon
                      icon={isEditMode ? "mdi:content-save" : "mdi:star-plus"}
                      className="w-4 h-4"
                    />
                    <span>
                      {isEditMode ? "Update Item" : "Add to Best Selling"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BestSellingForm;

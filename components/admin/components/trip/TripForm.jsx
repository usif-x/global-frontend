"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import tripService from "@/services/tripService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. HELPER COMPONENT: DynamicListField
//=================================================================
/**
 * A styled component for managing dynamic lists of text inputs (e.g., "Included", "Not Included").
 */
const DynamicListField = ({
  title,
  items,
  onChange,
  placeholder,
  icon,
  color = "turquoise",
  disabled,
}) => {
  const handleItemChange = (index, value) => {
    const newItems = items.map((item, i) => (i === index ? value : item));
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const colorClasses = {
    green: "from-green-500 to-emerald-600",
    red: "from-red-500 to-rose-600",
    blue: "from-blue-500 to-sky-600",
  };

  const buttonGradient = colorClasses[color] || colorClasses.blue;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-slate-700">
          {title}
        </label>
        <button
          type="button"
          onClick={addItem}
          className={`bg-gradient-to-r ${buttonGradient} text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
          disabled={disabled}
        >
          <Icon icon="mdi:plus-circle" className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="group flex items-center space-x-3">
            <Input
              dir="ltr"
              icon={icon}
              name={`${title.toLowerCase()}_${index}`}
              type="text"
              placeholder={placeholder}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              color={color}
              className="flex-1"
              disabled={disabled}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                disabled={disabled}
              >
                <Icon icon="mdi:delete" className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

//=================================================================
//  2. MAIN COMPONENT: TripForm
//=================================================================
const TripForm = ({ trip = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    package_id: "",
    duration: "",
    adult_price: "",
    child_price: "",
    maxim_person: "",
    has_discount: false,
    discount_percentage: "",
    included: [""],
    not_included: [""],
    terms_and_conditions: [""],
    images: [],
    is_image_list: false,
  });

  // Load packages and populate form
  useEffect(() => {
    const loadAndPopulate = async () => {
      try {
        const packagesData = await tripService.getPackages();
        setPackages(
          packagesData.map((pkg) => ({
            value: pkg.id.toString(),
            label: pkg.name,
          }))
        );
      } catch (error) {
        toast.error("Failed to load packages for selection.");
      }
    };
    loadAndPopulate();

    if (trip) {
      setFormData({
        name: trip.name || "",
        description: trip.description || "",
        images: trip.images || [],
        is_image_list: trip.is_image_list || false,
        adult_price: trip.adult_price?.toString() || "",
        child_price: trip.child_price?.toString() || "",
        maxim_person: trip.maxim_person?.toString() || "",
        has_discount: trip.has_discount || false,
        discount_percentage: trip.discount_percentage?.toString() || "",
        duration: trip.duration?.toString() || "",
        package_id: trip.package_id?.toString() || "",
        included: trip.included?.length ? trip.included : [""],
        not_included: trip.not_included?.length ? trip.not_included : [""],
        terms_and_conditions: trip.terms_and_conditions?.length
          ? trip.terms_and_conditions
          : [""],
      });
    }
  }, [trip]);

  // All handler functions from your original TripForm
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, selectedOption) => {
    const valueToSet = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({ ...prev, [name]: valueToSet }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
  };
  const addImage = () =>
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  const removeImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Trip name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = "Valid duration is required";
    if (!formData.adult_price || formData.adult_price <= 0)
      newErrors.adult_price = "Valid adult price is required";
    if (!formData.maxim_person || formData.maxim_person <= 0)
      newErrors.maxim_person = "Max persons is required";
    if (
      formData.has_discount &&
      (!formData.discount_percentage ||
        formData.discount_percentage <= 0 ||
        formData.discount_percentage > 100)
    ) {
      newErrors.discount_percentage = "Discount must be between 1 and 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      toast.error("Please fix the errors on all steps.");
      return;
    }
    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        adult_price: parseFloat(formData.adult_price),
        child_price: parseFloat(formData.child_price) || 0,
        maxim_person: parseInt(formData.maxim_person, 10),
        duration: parseInt(formData.duration, 10),
        package_id: formData.package_id
          ? parseInt(formData.package_id, 10)
          : null,
        discount_percentage: formData.has_discount
          ? parseFloat(formData.discount_percentage)
          : 0,
        included: formData.included.filter((item) => item && item.trim()),
        not_included: formData.not_included.filter(
          (item) => item && item.trim()
        ),
        terms_and_conditions: formData.terms_and_conditions.filter(
          (item) => item && item.trim()
        ),
        images: formData.images.filter((img) => img && img.trim()),
      };
      let result;
      if (trip) {
        result = await tripService.update(trip.id, submitData);
        toast.success("🎉 Trip updated successfully!");
      } else {
        result = await tripService.create(submitData);
        toast.success("🎉 Trip created successfully!");
      }
      onSuccess && onSuccess(result);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save trip"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Essential Info", icon: "mdi:information-variant-circle" },
    { id: 2, name: "Logistics & Pricing", icon: "mdi:cash-multiple" },
    { id: 3, name: "Details & Media", icon: "mdi:clipboard-text-multiple" },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Header & Progress Steps */}
      <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon
                icon={trip ? "mdi:airplane-edit" : "mdi:airplane-plus"}
                className="w-8 h-8"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {trip ? "Edit Trip" : "Create New Trip"}
              </h2>
              <p className="text-cyan-100 mt-1">
                {trip
                  ? "Update the details of your adventure"
                  : "Craft an unforgettable journey"}
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
        <div className="relative mt-8">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/20"></div>
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-white text-cyan-600 border-white"
                      : "bg-transparent border-white/50 text-white/80"
                  }`}
                >
                  <Icon icon={step.icon} className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id ? "text-white" : "text-white/70"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Step 1: Essential Info */}
        <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Essential Trip Information
            </h3>
            <div className="space-y-6">
              <Input
                dir="ltr"
                icon="mdi:airplane-takeoff"
                name="name"
                type="text"
                placeholder="Trip Name (e.g., Bali Adventure)"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                color="turquoise"
                required
                disabled={isLoading}
              />
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this amazing trip..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all duration-200 ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
              <Select
                icon="mdi:package-variant"
                name="package_id"
                dir="ltr"
                options={packages}
                placeholder="Assign to Package (Optional)"
                value={packages.find((p) => p.value === formData.package_id)}
                onChange={(opt) => handleSelectChange("package_id", opt)}
                error={errors.package_id}
                disabled={isLoading}
                searchable={true}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={!formData.name || !formData.description || isLoading}
            >
              <span>Continue to Logistics</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 2: Logistics & Pricing */}
        <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Logistics & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                dir="ltr"
                icon="mdi:clock-outline"
                name="duration"
                type="number"
                placeholder="Duration (in days)"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                color="green"
                required
                disabled={isLoading}
              />
              <Input
                dir="ltr"
                icon="mdi:account-group"
                name="maxim_person"
                type="number"
                placeholder="Max Persons"
                value={formData.maxim_person}
                onChange={handleInputChange}
                error={errors.maxim_person}
                color="green"
                required
                disabled={isLoading}
              />
              <Input
                dir="ltr"
                icon="mdi:account"
                name="adult_price"
                type="number"
                step="0.01"
                placeholder="Adult Price ($)"
                value={formData.adult_price}
                onChange={handleInputChange}
                error={errors.adult_price}
                color="green"
                required
                disabled={isLoading}
              />
              <Input
                dir="ltr"
                icon="mdi:account-child"
                name="child_price"
                type="number"
                step="0.01"
                placeholder="Child Price ($)"
                value={formData.child_price}
                onChange={handleInputChange}
                error={errors.child_price}
                color="green"
                disabled={isLoading}
              />
              <div className="lg:col-span-2 space-y-3 bg-white/50 p-4 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_discount"
                    checked={formData.has_discount}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Offer a Discount?
                  </span>
                </label>
                {formData.has_discount && (
                  <Input
                    dir="ltr"
                    icon="mdi:percent"
                    name="discount_percentage"
                    type="number"
                    step="1"
                    placeholder="Discount %"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    error={errors.discount_percentage}
                    color="green"
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span>Continue to Details</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 3: Details & Media */}
        <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100 space-y-6">
              <DynamicListField
                title="What's Included"
                items={formData.included}
                onChange={(items) =>
                  setFormData((prev) => ({ ...prev, included: items }))
                }
                placeholder="e.g., Airport Transfer"
                icon="mdi:check"
                color="green"
                disabled={isLoading}
              />
              <DynamicListField
                title="What's Not Included"
                items={formData.not_included}
                onChange={(items) =>
                  setFormData((prev) => ({ ...prev, not_included: items }))
                }
                placeholder="e.g., International Flights"
                icon="mdi:close"
                color="red"
                disabled={isLoading}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 space-y-6">
              <DynamicListField
                title="Terms & Conditions"
                items={formData.terms_and_conditions}
                onChange={(items) =>
                  setFormData((prev) => ({
                    ...prev,
                    terms_and_conditions: items,
                  }))
                }
                placeholder="e.g., Cancellation Policy"
                icon="mdi:file-document-outline"
                color="blue"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Trip Images
              </label>
              <button
                type="button"
                onClick={addImage}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                disabled={isLoading}
              >
                <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    {image && image.trim() ? (
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path fill="%23ccc" d="M21,17H7V3A1,1 0 0,1 8,2H20A1,1 0 0,1 21,3V17M19,4H9V15H19V4M16,10.5L13.5,13.5L11.5,11L9,14H19M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6Z"/></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <Icon
                          icon="mdi:image-plus"
                          className="w-8 h-8 text-slate-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      dir="ltr"
                      icon="mdi:link"
                      name={`image_${index}`}
                      type="url"
                      placeholder="Paste image URL here..."
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      color="purple"
                      className="w-full"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Image {index + 1}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Icon icon="mdi:delete" className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <Icon
                    icon="mdi:image-plus"
                    className="w-12 h-12 text-slate-400 mx-auto mb-4"
                  />
                  <h4 className="text-lg font-medium text-slate-600 mb-2">
                    No images yet
                  </h4>
                  <button
                    type="button"
                    onClick={addImage}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    disabled={isLoading}
                  >
                    Add First Image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex space-x-4">
              <Button
                type="button"
                color="gray"
                text="Cancel"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check-circle" className="w-5 h-5" />
                    <span>{trip ? "Update Trip" : "Create Trip"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripForm;

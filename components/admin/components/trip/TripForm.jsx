"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
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
    // Simplified pricing - single currency (EGP)
    adult_price: "",
    child_price: "",
    child_allowed: true,
    maxim_person: "",
    has_discount: false,
    discount_percentage: "",
    discount_requires_min_people: false,
    discount_always_available: false,
    discount_min_people: "",
    included: [""],
    not_included: [""],
    duration: "",
    duration_unit: "day/s",
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
        // Simplified pricing
        adult_price: trip.adult_price?.toString() || "",
        child_price: trip.child_price?.toString() || "",
        child_allowed:
          trip.child_allowed !== undefined ? trip.child_allowed : true,
        maxim_person: trip.maxim_person?.toString() || "",
        has_discount: trip.has_discount || false,
        discount_percentage: trip.discount_percentage?.toString() || "",
        discount_requires_min_people:
          trip.discount_requires_min_people || false,
        discount_always_available: trip.discount_always_available || false,
        discount_min_people: trip.discount_min_people?.toString() || "",
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

  const handleDescriptionChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue || "" }));
    // Clear error on change
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
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
    if (!formData.package_id.trim())
      newErrors.package_id = "Package selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = "Valid duration is required";
    if (!formData.maxim_person || formData.maxim_person <= 0)
      newErrors.maxim_person = "Max persons is required";
    if (!formData.adult_price || formData.adult_price <= 0)
      newErrors.adult_price = "Adult price is required";

    // Only validate child price if children are allowed
    if (
      formData.child_allowed &&
      (!formData.child_price || formData.child_price <= 0)
    )
      newErrors.child_price =
        "Child price is required when children are allowed";

    if (
      formData.has_discount &&
      (!formData.discount_percentage ||
        formData.discount_percentage <= 0 ||
        formData.discount_percentage > 100)
    ) {
      newErrors.discount_percentage = "Discount must be between 1 and 100";
    }

    // Validate discount min people if required
    if (
      formData.has_discount &&
      formData.discount_requires_min_people &&
      (!formData.discount_min_people || formData.discount_min_people <= 0)
    ) {
      newErrors.discount_min_people = "Minimum people required for discount";
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
        // Simplified pricing conversion
        adult_price: parseFloat(formData.adult_price),
        child_price: formData.child_allowed
          ? parseFloat(formData.child_price || 0)
          : 0,
        child_allowed: formData.child_allowed,
        maxim_person: parseInt(formData.maxim_person, 10),
        duration: parseInt(formData.duration, 10),
        package_id: parseInt(formData.package_id, 10),
        discount_percentage: formData.has_discount
          ? parseFloat(formData.discount_percentage)
          : 0,
        discount_requires_min_people: formData.has_discount
          ? formData.discount_requires_min_people
          : false,
        discount_always_available: formData.has_discount
          ? formData.discount_always_available
          : false,
        discount_min_people:
          formData.has_discount && formData.discount_requires_min_people
            ? parseInt(formData.discount_min_people, 10)
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trip Description (Supports Markdown)
                </label>
                <MarkdownEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe this amazing trip using Markdown for lists, bold text, etc."
                  error={errors.description}
                  disabled={isLoading}
                />
              </div>
              <Select
                icon="mdi:package-variant"
                name="package_id"
                dir="ltr"
                options={packages}
                placeholder="Select Package *"
                value={packages.find((p) => p.value === formData.package_id)}
                onChange={(opt) => handleSelectChange("package_id", opt)}
                error={errors.package_id}
                disabled={isLoading}
                searchable={true}
                required={true}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.package_id ||
                isLoading
              }
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
              Logistics & Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                dir="ltr"
                icon="mdi:clock-outline"
                name="duration"
                type="number"
                placeholder="Duration"
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

              {/* Child Allowed Section */}
              <div className="md:col-span-2 space-y-3 bg-white/50 p-4 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="child_allowed"
                    checked={formData.child_allowed}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Icon icon="mdi:baby-face" className="w-4 h-4" />
                    <span>Allow Children on this Trip</span>
                  </span>
                </label>
                {!formData.child_allowed && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start space-x-2">
                      <Icon
                        icon="mdi:alert"
                        className="w-4 h-4 text-orange-600 mt-0.5"
                      />
                      <p className="text-sm text-orange-700">
                        This trip is restricted to adults only. Children will
                        not be allowed to participate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Discount Section */}
              <div className="md:col-span-2 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon
                    icon="mdi:tag-percent"
                    className="w-5 h-5 text-purple-600"
                  />
                  <h4 className="text-lg font-semibold text-slate-800">
                    Discount Settings
                  </h4>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_discount"
                    checked={formData.has_discount}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Offer a Discount for this Trip
                  </span>
                </label>

                {formData.has_discount && (
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-purple-200">
                    <Input
                      dir="ltr"
                      icon="mdi:percent"
                      name="discount_percentage"
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      placeholder="Discount Percentage (1-100)"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      error={errors.discount_percentage}
                      color="purple"
                      disabled={isLoading}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <input
                          type="checkbox"
                          name="discount_always_available"
                          checked={formData.discount_always_available}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                          disabled={isLoading}
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 block">
                            Always Available
                          </span>
                          <p className="text-xs text-slate-600 mt-1">
                            Apply discount automatically for all bookings
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <input
                          type="checkbox"
                          name="discount_requires_min_people"
                          checked={formData.discount_requires_min_people}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                          disabled={
                            isLoading || formData.discount_always_available
                          }
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 block">
                            Requires Minimum People
                          </span>
                          <p className="text-xs text-slate-600 mt-1">
                            Only apply if minimum people book
                          </p>
                        </div>
                      </label>
                    </div>

                    {formData.discount_requires_min_people &&
                      !formData.discount_always_available && (
                        <Input
                          dir="ltr"
                          icon="mdi:account-multiple"
                          name="discount_min_people"
                          type="number"
                          min="2"
                          placeholder="Minimum People Required for Discount"
                          value={formData.discount_min_people}
                          onChange={handleInputChange}
                          error={errors.discount_min_people}
                          color="purple"
                          disabled={isLoading}
                        />
                      )}

                    {formData.discount_always_available && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Icon
                            icon="mdi:check-circle"
                            className="w-4 h-4 text-green-600 mt-0.5"
                          />
                          <p className="text-sm text-green-700">
                            This discount will be automatically applied to all
                            bookings for this trip.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center space-x-2">
              <Icon
                icon="mdi:cash-multiple"
                className="w-6 h-6 text-orange-600"
              />
              <span>Pricing (EGP)</span>
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Icon
                  icon="mdi:information"
                  className="w-5 h-5 text-blue-600 mt-0.5"
                />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Payment Processing
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Prices are set in EGP. Our payment provider will
                    automatically convert to the customer's preferred currency
                    during checkout.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                dir="ltr"
                icon="mdi:account"
                name="adult_price"
                type="number"
                step="0.01"
                placeholder="Adult Price (EGP)"
                value={formData.adult_price}
                onChange={handleInputChange}
                error={errors.adult_price}
                color="orange"
                required
                disabled={isLoading}
              />
              {formData.child_allowed && (
                <Input
                  dir="ltr"
                  icon="mdi:account-child"
                  name="child_price"
                  type="number"
                  step="0.01"
                  placeholder="Child Price (EGP)"
                  value={formData.child_price}
                  onChange={handleInputChange}
                  error={errors.child_price}
                  color="green"
                  required={formData.child_allowed}
                  disabled={isLoading}
                />
              )}
              {!formData.child_allowed && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      icon="mdi:baby-face-off"
                      className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      Child pricing not applicable
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Children are not allowed on this trip
                    </p>
                  </div>
                </div>
              )}
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

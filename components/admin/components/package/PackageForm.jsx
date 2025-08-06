"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import PackageService from "@/services/packageService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PackageForm = ({ package: packageData = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [],
    is_image_list: false,
  });

  // Populate form if editing
  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || "",
        description: packageData.description || "",
        images: packageData.images || [],
        is_image_list: packageData.is_image_list || false,
      });
      setImagePreview(packageData.images || []);
    }
  }, [packageData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDescriptionChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue || "" }));
    // Clear error on change
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };
  const handleImageChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));

    // Update preview
    setImagePreview((prev) =>
      prev.map((img, i) => (i === index ? value : img))
    );
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
    setImagePreview((prev) => [...prev, ""]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Package name is required";
    if (formData.name.trim().length < 3)
      newErrors.name = "Package name must be at least 3 characters";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        images: formData.images.filter((img) => img && img.trim()),
      };

      let result;
      if (packageData) {
        result = await PackageService.update(packageData.id, submitData);
        toast.success("🎉 Package updated successfully!");
      } else {
        result = await PackageService.create(submitData);
        toast.success("🎉 Package created successfully!");
      }

      onSuccess && onSuccess(result);
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save package"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", icon: "mdi:information" },
    { id: 2, name: "Media & Options", icon: "mdi:image-multiple" },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon
                icon={
                  packageData
                    ? "mdi:package-variant"
                    : "mdi:package-variant-plus"
                }
                className="w-8 h-8"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {packageData ? "Edit Package" : "Create New Package"}
              </h2>
              <p className="text-cyan-100 mt-1">
                {packageData
                  ? "Update your package details"
                  : "Build an amazing travel package"}
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

        {/* Progress Steps */}
        <div className="relative mt-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 ${
                    currentStep >= step.id ? "text-white" : "text-white/60"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentStep >= step.id
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-white/10"
                    }`}
                  >
                    <Icon icon={step.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-20 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-white/40" : "bg-white/20"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Step 1: Basic Information */}
        <div
          className={`space-y-6 transition-all duration-300 ${
            currentStep === 1 ? "block" : "hidden"
          }`}
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Icon icon="mdi:information" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Package Details
              </h3>
            </div>

            <div className="space-y-6">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Name *
                </label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    icon="mdi:package-variant"
                    name="name"
                    type="text"
                    placeholder="Enter an exciting package name..."
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    color="turquoise"
                    className="w-full"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span
                      className={`text-xs ${
                        formData.name.length >= 3
                          ? "text-green-500"
                          : "text-slate-400"
                      }`}
                    >
                      {formData.name.length}/50
                    </span>
                  </div>
                </div>
                {formData.name && formData.name.length >= 3 && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1" />
                    Great name choice!
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Package Description (Supports Markdown)
                  </label>
                  <MarkdownEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe this amazing trip using Markdown for lists, bold text, etc."
                    error={errors.description}
                    disabled={isLoading}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                {formData.description && formData.description.length >= 10 && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1" />
                    Perfect description length!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={
                !formData.name.trim() ||
                !formData.description.trim() ||
                isLoading
              }
            >
              <span>Continue to Media</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 2: Media & Options */}
        <div
          className={`space-y-6 transition-all duration-300 ${
            currentStep === 2 ? "block" : "hidden"
          }`}
        >
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Icon icon="mdi:image-multiple" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Media & Display Options
              </h3>
            </div>

            <div className="space-y-6">
              {/* Display Options */}
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_image_list"
                      checked={formData.is_image_list}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        Display as Image Gallery
                      </span>
                      <p className="text-xs text-slate-500">
                        Show images in a beautiful gallery layout
                      </p>
                    </div>
                  </label>
                  <Icon
                    icon={
                      formData.is_image_list
                        ? "mdi:view-gallery"
                        : "mdi:view-list"
                    }
                    className="w-6 h-6 text-purple-500"
                  />
                </div>
              </div>

              {/* Images Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Package Images
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
                      className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Image Preview */}
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

                        {/* Input Field */}
                        <div className="flex-1">
                          <Input
                            dir="ltr"
                            icon="mdi:link"
                            name={`image_${index}`}
                            type="url"
                            placeholder="Paste image URL here..."
                            value={image}
                            onChange={(e) =>
                              handleImageChange(index, e.target.value)
                            }
                            color="purple"
                            className="w-full"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Image {index + 1} • Supports JPG, PNG, WebP formats
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          disabled={isLoading}
                        >
                          <Icon icon="mdi:delete" className="w-5 h-5" />
                        </button>
                      </div>
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
                      <p className="text-slate-500 mb-4">
                        Add some beautiful images to showcase your package
                      </p>
                      <button
                        type="button"
                        onClick={addImage}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        disabled={isLoading}
                      >
                        Add Your First Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back to Details</span>
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
                    <span>
                      {packageData ? "Update Package" : "Create Package"}
                    </span>
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

export default PackageForm;

"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import Select from "@/components/ui/Select";
import CourseService from "@/services/courseService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  MAIN COMPONENT: CourseForm
//=================================================================
const CourseForm = ({ course = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseForImport, setSelectedCourseForImport] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Updated state to match the new schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_available: true,
    price: "",
    images: [], // Will store File objects for new uploads
    existing_images: [], // Will store existing image URLs
    is_image_list: false,
    course_level: "Beginner",
    course_duration: "",
    course_duration_unit: "days",
    provider: "",
    has_discount: false,
    discount_requires_min_people: false,
    discount_always_available: false,
    discount_percentage: "",
    discount_min_people: "",
    course_type: "Basic",
    has_certificate: false,
    certificate_type: "Standard",
    has_online_content: false,
    contents: [],
  });

  // Populate form if editing
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        description: course.description || "",
        price_available: course.price_available ?? true,
        price: course.price?.toString() || "",
        images: [], // Reset for new uploads
        existing_images: course.images || [], // Store existing image URLs
        is_image_list: course.is_image_list || false,
        course_level: course.course_level || "Beginner",
        course_duration: course.course_duration?.toString() || "",
        course_duration_unit: course.course_duration_unit || "days",
        provider: course.provider || "",
        has_discount: course.has_discount || false,
        discount_requires_min_people:
          course.discount_requires_min_people || false,
        discount_always_available: course.discount_always_available || false,
        discount_percentage: course.discount_percentage?.toString() || "",
        discount_min_people: course.discount_min_people?.toString() || "",
        course_type: course.course_type || "Basic",
        has_certificate: course.has_certificate || false,
        certificate_type: course.certificate_type || "Standard",
        has_online_content: course.has_online_content || false,
        contents: course.contents || [],
      });
    }
  }, [course]);

  // Load all courses for import functionality
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const coursesData = await CourseService.getAll();
        // Filter out current course if editing
        const filteredCourses = course
          ? coursesData.filter((c) => c.id !== course.id)
          : coursesData;
        setAllCourses(filteredCourses);
      } catch (error) {
        console.error("Failed to load courses for import:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    loadCourses();
  }, [course]);

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

  const handleImageChange = (index, file) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? file : img)),
    }));
  };

  const addImage = () =>
    setFormData((prev) => ({ ...prev, images: [...prev.images, null] }));

  const removeImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const removeExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      existing_images: prev.existing_images.filter((_, i) => i !== index),
    }));
  };

  const handleImportImages = () => {
    if (!selectedCourseForImport) {
      toast.error("Please select a course to import images from");
      return;
    }

    const selectedCourse = allCourses.find(
      (c) => c.id === parseInt(selectedCourseForImport)
    );

    if (
      !selectedCourse ||
      !selectedCourse.images ||
      selectedCourse.images.length === 0
    ) {
      toast.error("Selected course has no images to import");
      return;
    }

    // Add images from selected course to existing_images
    const newImages = selectedCourse.images.filter(
      (img) => !formData.existing_images.includes(img)
    );

    if (newImages.length === 0) {
      toast.info("All images from this course are already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      existing_images: [...prev.existing_images, ...newImages],
    }));

    toast.success(
      `Imported ${newImages.length} image(s) from ${selectedCourse.name}`
    );
    setSelectedCourseForImport(null);
  };

  // Content management functions
  const handleContentChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.map((content, i) =>
        i === index ? { ...content, [field]: value } : content
      ),
    }));
  };

  const addContent = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [
        ...prev.contents,
        {
          title: "",
          description: "",
          content_type: "video",
          content_url: "",
          order: prev.contents.length,
        },
      ],
    }));
  };

  const removeContent = (index) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index),
    }));
  };

  // Updated validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Course name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.provider.trim()) newErrors.provider = "Provider is required";

    // Only validate price if price is available
    if (formData.price_available) {
      if (!formData.price || formData.price < 0)
        newErrors.price = "Valid price is required";
    }

    if (!formData.course_duration || formData.course_duration <= 0)
      newErrors.course_duration = "Duration in days is required";
    if (!formData.course_level)
      newErrors.course_level = "Please select a difficulty level";
    if (!formData.course_type)
      newErrors.course_type = "Please select a course type";

    // Validate discount fields if discount is enabled
    if (formData.has_discount) {
      if (
        !formData.discount_percentage ||
        formData.discount_percentage <= 0 ||
        formData.discount_percentage >= 100
      ) {
        newErrors.discount_percentage =
          "Discount percentage must be between 1-99";
      }
      if (
        formData.discount_requires_min_people &&
        (!formData.discount_min_people || formData.discount_min_people <= 0)
      ) {
        newErrors.discount_min_people =
          "Minimum people required for discount must be greater than 0";
      }
    }

    // Validate content if has_online_content is true
    if (formData.has_online_content && formData.contents.length === 0) {
      newErrors.contents = "Please add at least one content item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updated submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }
    setIsLoading(true);
    try {
      // Create FormData for multipart upload
      const submitFormData = new FormData();

      // Add basic fields
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      submitFormData.append("price_available", formData.price_available);
      submitFormData.append(
        "price",
        formData.price_available ? parseInt(formData.price, 10) : 0
      );
      submitFormData.append("is_image_list", formData.is_image_list);
      submitFormData.append("course_level", formData.course_level);
      submitFormData.append(
        "course_duration",
        parseInt(formData.course_duration, 10)
      );
      submitFormData.append(
        "course_duration_unit",
        formData.course_duration_unit
      );
      submitFormData.append("provider", formData.provider);
      submitFormData.append("has_discount", formData.has_discount);
      submitFormData.append(
        "discount_requires_min_people",
        formData.discount_requires_min_people
      );
      submitFormData.append(
        "discount_always_available",
        formData.discount_always_available
      );
      submitFormData.append(
        "discount_percentage",
        formData.has_discount ? parseInt(formData.discount_percentage, 10) : 0
      );
      submitFormData.append(
        "discount_min_people",
        formData.discount_requires_min_people
          ? parseInt(formData.discount_min_people, 10)
          : 0
      );
      submitFormData.append("course_type", formData.course_type);
      submitFormData.append("has_certificate", formData.has_certificate);
      submitFormData.append("certificate_type", formData.certificate_type);
      submitFormData.append("has_online_content", formData.has_online_content);

      // Add existing images (for updates)
      if (course && formData.existing_images.length > 0) {
        submitFormData.append(
          "existing_images",
          JSON.stringify(formData.existing_images)
        );
      }

      // Add new image files
      formData.images.forEach((file) => {
        if (file instanceof File) {
          submitFormData.append("images", file);
        }
      });

      // Add contents
      if (formData.has_online_content) {
        const validContents = formData.contents.filter((content) =>
          content.title.trim()
        );
        submitFormData.append("contents", JSON.stringify(validContents));
      } else {
        submitFormData.append("contents", JSON.stringify([]));
      }

      let result;
      if (course) {
        result = await CourseService.update(course.id, submitFormData);
        toast.success("🎉 Course updated successfully!");
      } else {
        result = await CourseService.create(submitFormData);
        toast.success("🎉 Course created successfully!");
      }
      onSuccess && onSuccess(result);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save course"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue || "" }));
    // Clear error on change
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  // Updated to three steps
  const steps = [
    { id: 1, name: "Core Info", icon: "mdi:information-variant-circle" },
    { id: 2, name: "Pricing & Discounts", icon: "mdi:cash-multiple" },
    { id: 3, name: "Content & Media", icon: "mdi:book-open-page-variant" },
  ];

  const levelOptions = [
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
  ];

  const typeOptions = [
    { value: "Basic", label: "Basic Course" },
    { value: "Premium", label: "Premium Course" },
    { value: "Specialty", label: "Specialty Course" },
  ];

  const certificateOptions = [
    { value: "Standard", label: "Standard Certificate" },
    { value: "Premium", label: "Premium Certificate" },
    { value: "Digital", label: "Digital Certificate" },
  ];

  const durationUnitOptions = [
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
  ];

  const contentTypeOptions = [
    { value: "video", label: "Video" },
    { value: "pdf", label: "PDF Document" },
    { value: "quiz", label: "Quiz" },
    { value: "text", label: "Text Content" },
    { value: "audio", label: "Audio" },
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
                icon={course ? "mdi:school-outline" : "mdi:school"}
                className="w-8 h-8"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {course ? "Edit Course" : "Create New Course"}
              </h2>
              <p className="text-cyan-100 mt-1">
                {course
                  ? "Update the course curriculum"
                  : "Design a new learning experience"}
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
          <div className="relative flex justify-between px-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => !isLoading && setCurrentStep(step.id)}
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
        {/* Step 1: Core Info */}
        <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Course Information
            </h3>
            <div className="space-y-6">
              <Input
                dir="ltr"
                icon="mdi:book-outline"
                name="name"
                type="text"
                placeholder="Course Name (e.g., Introduction to Scuba)"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                color="turquoise"
                required
                disabled={isLoading}
              />

              <Input
                dir="ltr"
                icon="mdi:domain"
                name="provider"
                type="text"
                placeholder="Course Provider (e.g., Ocean Academy)"
                value={formData.provider}
                onChange={handleInputChange}
                error={errors.provider}
                color="turquoise"
                required
                disabled={isLoading}
              />

              <div>
                <MarkdownEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe this amazing course using Markdown for lists, bold text, etc."
                  error={errors.description}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Course Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Select
                icon="mdi:school"
                name="course_level"
                dir="ltr"
                options={levelOptions}
                placeholder="Select Difficulty"
                value={levelOptions.find(
                  (opt) => opt.value === formData.course_level
                )}
                onChange={(opt) => handleSelectChange("course_level", opt)}
                error={errors.course_level}
                disabled={isLoading}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  dir="ltr"
                  icon="mdi:clock-outline"
                  name="course_duration"
                  type="number"
                  placeholder="Duration"
                  value={formData.course_duration}
                  onChange={handleInputChange}
                  error={errors.course_duration}
                  color="green"
                  required
                  disabled={isLoading}
                />

                <Select
                  icon="mdi:calendar-clock"
                  name="course_duration_unit"
                  dir="ltr"
                  options={durationUnitOptions}
                  placeholder="Unit"
                  value={durationUnitOptions.find(
                    (opt) => opt.value === formData.course_duration_unit
                  )}
                  onChange={(opt) =>
                    handleSelectChange("course_duration_unit", opt)
                  }
                  disabled={isLoading}
                />
              </div>

              <Select
                icon="mdi:tag"
                name="course_type"
                dir="ltr"
                options={typeOptions}
                placeholder="Select Course Type"
                value={typeOptions.find(
                  (opt) => opt.value === formData.course_type
                )}
                onChange={(opt) => handleSelectChange("course_type", opt)}
                error={errors.course_type}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span>Continue to Pricing</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 2: Pricing & Discounts */}
        <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Pricing Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-emerald-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="price_available"
                    checked={formData.price_available}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Price Available
                    </span>
                    <p className="text-xs text-slate-500">
                      Display pricing information for this course
                    </p>
                  </div>
                </label>
                <Icon
                  icon="mdi:currency-usd"
                  className="w-6 h-6 text-emerald-500"
                />
              </div>

              {formData.price_available && (
                <Input
                  dir="ltr"
                  icon="mdi:currency-usd"
                  name="price"
                  type="number"
                  step="1"
                  placeholder="Price ($)"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  color="green"
                  required
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Discount Options
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_discount"
                    checked={formData.has_discount}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    disabled={isLoading}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Offer Discount
                    </span>
                    <p className="text-xs text-slate-500">
                      Provide special pricing for this course
                    </p>
                  </div>
                </label>
                <Icon icon="mdi:percent" className="w-6 h-6 text-orange-500" />
              </div>

              {formData.has_discount && (
                <div className="space-y-4">
                  <Input
                    dir="ltr"
                    icon="mdi:percent"
                    name="discount_percentage"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Discount Percentage (1-99)"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    error={errors.discount_percentage}
                    color="orange"
                    required
                    disabled={isLoading}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-200">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="discount_always_available"
                          checked={formData.discount_always_available}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          disabled={isLoading}
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            Always Available
                          </span>
                          <p className="text-xs text-slate-500">
                            Discount is always active
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-200">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="discount_requires_min_people"
                          checked={formData.discount_requires_min_people}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          disabled={isLoading}
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            Requires Minimum People
                          </span>
                          <p className="text-xs text-slate-500">
                            Discount only applies with minimum enrollments
                          </p>
                        </div>
                      </label>
                    </div>

                    {formData.discount_requires_min_people && (
                      <Input
                        dir="ltr"
                        icon="mdi:account-group"
                        name="discount_min_people"
                        type="number"
                        min="1"
                        placeholder="Minimum People Required"
                        value={formData.discount_min_people}
                        onChange={handleInputChange}
                        error={errors.discount_min_people}
                        color="orange"
                        required
                        disabled={isLoading}
                      />
                    )}
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
              <span>Continue to Content</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 3: Content & Media */}
        <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Certificate Options
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-purple-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_certificate"
                    checked={formData.has_certificate}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Offer Certificate
                    </span>
                    <p className="text-xs text-slate-500">
                      Provide a completion certificate for this course
                    </p>
                  </div>
                </label>
                <Icon
                  icon="mdi:certificate"
                  className="w-6 h-6 text-purple-500"
                />
              </div>

              {formData.has_certificate && (
                <Select
                  icon="mdi:medal"
                  name="certificate_type"
                  dir="ltr"
                  options={certificateOptions}
                  placeholder="Select Certificate Type"
                  value={certificateOptions.find(
                    (opt) => opt.value === formData.certificate_type
                  )}
                  onChange={(opt) =>
                    handleSelectChange("certificate_type", opt)
                  }
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Online Content
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-indigo-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_online_content"
                    checked={formData.has_online_content}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Include Online Content
                    </span>
                    <p className="text-xs text-slate-500">
                      Add digital materials like videos, PDFs, and quizzes
                    </p>
                  </div>
                </label>
                <Icon
                  icon="mdi:cloud-download"
                  className="w-6 h-6 text-indigo-500"
                />
              </div>

              {formData.has_online_content && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Course Content
                    </label>
                    <button
                      type="button"
                      onClick={addContent}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                      disabled={isLoading}
                    >
                      <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                      <span>Add Content</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formData.contents.map((content, index) => (
                      <div
                        key={index}
                        className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-sm font-medium text-slate-700">
                            Content Item {index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeContent(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                            disabled={isLoading}
                          >
                            <Icon icon="mdi:delete" className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Input
                            dir="ltr"
                            icon="mdi:format-title"
                            name={`content_title_${index}`}
                            type="text"
                            placeholder="Content Title"
                            value={content.title}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            color="indigo"
                            required
                            disabled={isLoading}
                          />

                          <textarea
                            name={`content_description_${index}`}
                            value={content.description}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Content description (optional)"
                            rows={2}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
                            disabled={isLoading}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <Select
                              icon="mdi:format-list-bulleted-type"
                              name={`content_type_${index}`}
                              dir="ltr"
                              options={contentTypeOptions}
                              placeholder="Content Type"
                              value={contentTypeOptions.find(
                                (opt) => opt.value === content.content_type
                              )}
                              onChange={(opt) =>
                                handleContentChange(
                                  index,
                                  "content_type",
                                  opt ? opt.value : ""
                                )
                              }
                              disabled={isLoading}
                            />

                            <Input
                              dir="ltr"
                              icon="mdi:link"
                              name={`content_url_${index}`}
                              type="url"
                              placeholder="Content URL"
                              value={content.content_url}
                              onChange={(e) =>
                                handleContentChange(
                                  index,
                                  "content_url",
                                  e.target.value
                                )
                              }
                              color="indigo"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.contents.length === 0 && (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                        <Icon
                          icon="mdi:book-open-page-variant"
                          className="w-12 h-12 text-slate-400 mx-auto mb-4"
                        />
                        <h4 className="text-lg font-medium text-slate-600 mb-2">
                          No content items yet
                        </h4>
                        <button
                          type="button"
                          onClick={addContent}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          disabled={isLoading}
                        >
                          Add First Content Item
                        </button>
                      </div>
                    )}
                  </div>

                  {errors.contents && (
                    <p className="text-sm text-red-600 flex items-center">
                      <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                      {errors.contents}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Media & Display Options
            </h3>
            <div className="bg-white rounded-xl p-4 border border-rose-200 mb-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_image_list"
                    checked={formData.is_image_list}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                    disabled={isLoading}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Display as List
                    </span>
                    <p className="text-xs text-slate-500">
                      Show images in a vertical list instead of a grid
                    </p>
                  </div>
                </label>
                <Icon
                  icon={
                    formData.is_image_list
                      ? "mdi:view-list"
                      : "mdi:view-gallery"
                  }
                  className="w-6 h-6 text-rose-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Course Images
              </label>
              <button
                type="button"
                onClick={addImage}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                disabled={isLoading}
              >
                <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            {/* Import Images from Another Course */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <Icon
                  icon="mdi:import"
                  className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">
                    Import Images from Another Course
                  </h4>
                  <p className="text-xs text-slate-600">
                    Select an existing course to import its images
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center py-4">
                    <Icon
                      icon="mdi:loading"
                      className="w-6 h-6 text-blue-500 animate-spin"
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      Loading courses...
                    </span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedCourseForImport || ""}
                      onChange={(e) =>
                        setSelectedCourseForImport(e.target.value)
                      }
                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isLoading || allCourses.length === 0}
                    >
                      <option value="">
                        {allCourses.length === 0
                          ? "No courses available"
                          : "Select a course to import from..."}
                      </option>
                      {allCourses.map((courseItem) => (
                        <option key={courseItem.id} value={courseItem.id}>
                          {courseItem.name} ({courseItem.images?.length || 0}{" "}
                          image
                          {courseItem.images?.length !== 1 ? "s" : ""})
                        </option>
                      ))}
                    </select>

                    {selectedCourseForImport && (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        {(() => {
                          const selectedCourse = allCourses.find(
                            (c) => c.id === parseInt(selectedCourseForImport)
                          );
                          return selectedCourse ? (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {selectedCourse.name}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    {selectedCourse.images?.length || 0}{" "}
                                    image(s) available
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleImportImages}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                                  disabled={
                                    isLoading ||
                                    !selectedCourse.images ||
                                    selectedCourse.images.length === 0
                                  }
                                >
                                  <Icon icon="mdi:import" className="w-4 h-4" />
                                  <span>Import Images</span>
                                </button>
                              </div>

                              {selectedCourse.images &&
                                selectedCourse.images.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    {selectedCourse.images
                                      .slice(0, 4)
                                      .map((img, idx) => (
                                        <div
                                          key={idx}
                                          className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200"
                                        >
                                          <img
                                            src={img}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.src =
                                                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path fill="%23ccc" d="M21,17H7V3A1,1 0 0,1 8,2H20A1,1 0 0,1 21,3V17M19,4H9V15H19V4M16,10.5L13.5,13.5L11.5,11L9,14H19M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6Z"/></svg>';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    {selectedCourse.images.length > 4 && (
                                      <div className="aspect-square rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                        <span className="text-xs font-medium text-slate-600">
                                          +{selectedCourse.images.length - 4}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Existing Images */}
            {formData.existing_images.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Current Images
                </h4>
                <div className="space-y-3">
                  {formData.existing_images.map((imageUrl, index) => (
                    <div
                      key={`existing-${index}`}
                      className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                          onError={(e) => {
                            e.target.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path fill="%23ccc" d="M21,17H7V3A1,1 0 0,1 8,2H20A1,1 0 0,1 21,3V17M19,4H9V15H19V4M16,10.5L13.5,13.5L11.5,11L9,14H19M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6Z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          Existing Image {index + 1}
                        </p>
                        <p className="text-xs text-slate-500 break-all">
                          {imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        disabled={isLoading}
                      >
                        <Icon icon="mdi:delete" className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Uploads */}
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div
                  key={`new-${index}`}
                  className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {image instanceof File ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
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

                    {/* File Input */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Validate file size (5MB limit)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Image size must be less than 5MB");
                              return;
                            }
                            handleImageChange(index, file);
                          }
                        }}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 file:cursor-pointer cursor-pointer"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        New Image {index + 1} • Max 5MB • JPEG, PNG, WebP
                      </p>
                      {image instanceof File && (
                        <p className="text-xs text-green-600 mt-1">
                          Selected: {image.name} (
                          {(image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
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

              {formData.images.length === 0 &&
                formData.existing_images.length === 0 && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                    <Icon
                      icon="mdi:image-multiple"
                      className="w-12 h-12 text-slate-400 mx-auto mb-4"
                    />
                    <h4 className="text-lg font-medium text-slate-600 mb-2">
                      No images yet
                    </h4>
                    <button
                      type="button"
                      onClick={addImage}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      disabled={isLoading}
                    >
                      Upload Your First Image
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
                    <span>{course ? "Update Course" : "Create Course"}</span>
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

export default CourseForm;

"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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

  // Updated state to match the new schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    course_level: "Beginner",
    course_duration: "",
    course_type: "Basic",
    has_certificate: false,
    certificate_type: "Standard",
    has_online_content: false,
    images: [],
    is_image_list: false,
    contents: [],
  });

  // Populate form if editing
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        description: course.description || "",
        price: course.price?.toString() || "",
        course_level: course.course_level || "Beginner",
        course_duration: course.course_duration?.toString() || "",
        course_type: course.course_type || "Basic",
        has_certificate: course.has_certificate || false,
        certificate_type: course.certificate_type || "Standard",
        has_online_content: course.has_online_content || false,
        images: course.images || [],
        is_image_list: course.is_image_list || false,
        contents: course.contents || [],
      });
    }
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
    if (!formData.price || formData.price < 0)
      newErrors.price = "Valid price is required";
    if (!formData.course_duration || formData.course_duration <= 0)
      newErrors.course_duration = "Duration in days is required";
    if (!formData.course_level)
      newErrors.course_level = "Please select a difficulty level";
    if (!formData.course_type)
      newErrors.course_type = "Please select a course type";

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
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price, 10),
        course_level: formData.course_level,
        course_duration: parseInt(formData.course_duration, 10),
        course_type: formData.course_type,
        has_certificate: formData.has_certificate,
        certificate_type: formData.certificate_type,
        has_online_content: formData.has_online_content,
        images: formData.images.filter((img) => img && img.trim()),
        is_image_list: formData.is_image_list,
        contents: formData.has_online_content
          ? formData.contents.filter((content) => content.title.trim())
          : [],
      };

      let result;
      if (course) {
        result = await CourseService.update(course.id, submitData);
        toast.success("🎉 Course updated successfully!");
      } else {
        result = await CourseService.create(submitData);
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

  // Updated to three steps
  const steps = [
    { id: 1, name: "Core Info", icon: "mdi:information-variant-circle" },
    { id: 2, name: "Content & Features", icon: "mdi:book-open-page-variant" },
    { id: 3, name: "Media & Display", icon: "mdi:image-multiple" },
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
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief, engaging description of the course..."
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
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Pricing & Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <Input
                dir="ltr"
                icon="mdi:clock-outline"
                name="course_duration"
                type="number"
                placeholder="Duration (in days)"
                value={formData.course_duration}
                onChange={handleInputChange}
                error={errors.course_duration}
                color="green"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mt-6">
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
              <span>Continue to Content</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 2: Content & Features */}
        <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
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
              <span>Continue to Media</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 3: Media & Display */}
        <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Media & Display Options
            </h3>
            <div className="bg-white rounded-xl p-4 border border-orange-200 mb-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_image_list"
                    checked={formData.is_image_list}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
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
                  className="w-6 h-6 text-orange-500"
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
                className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
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
                      color="orange"
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
                    icon="mdi:image-multiple"
                    className="w-12 h-12 text-slate-400 mx-auto mb-4"
                  />
                  <h4 className="text-lg font-medium text-slate-600 mb-2">
                    No images yet
                  </h4>
                  <button
                    type="button"
                    onClick={addImage}
                    className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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

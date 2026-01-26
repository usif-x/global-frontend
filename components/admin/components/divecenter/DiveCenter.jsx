"use client";

import Input from "@/components/ui/Input";
import DiveCenterService from "@/services/divecenterService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Helper: Format Date with enhanced formatting
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Show relative time for recent dates
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  // Show full date for older entries
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper: Validate Time Format
const isValidTime = (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

// Helper: Validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Component: Loading Spinner (Memoized)
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-12">
    <div className="relative">
      <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Component: Table Skeleton (Memoized)
const TableSkeleton = memo(({ rows = 5, cols = 6 }) => (
  <div className="p-6 space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-5 bg-gray-200 rounded"
            style={{ width: `${100 / cols}%` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
));
TableSkeleton.displayName = "TableSkeleton";

// Component: Modal Wrapper
const ModalWrapper = memo(({ children, onClose, visible }) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
});
ModalWrapper.displayName = "ModalWrapper";

// Component: Image Carousel (Optimized)
const ImageCarousel = memo(({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set());

  const validImages = useMemo(
    () => images?.filter((_, index) => !imageErrors.has(index)) || [],
    [images, imageErrors],
  );

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length,
    );
  }, [validImages.length]);

  const handleImageError = useCallback(
    (index) => {
      setImageErrors((prev) => new Set([...prev, index]));
      if (currentIndex >= validImages.length - 1) {
        setCurrentIndex(0);
      }
    },
    [currentIndex, validImages.length],
  );

  if (!validImages || validImages.length === 0) return null;

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
      <img
        src={validImages[currentIndex]}
        alt={`Dive center image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        onError={() => handleImageError(currentIndex)}
        loading="lazy"
      />
      {validImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});
ImageCarousel.displayName = "ImageCarousel";

// Component: Enhanced Working Hours Editor
const WorkingHoursEditor = memo(({ workingHours, onChange }) => {
  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const presetSchedules = {
    standard: {
      monday: { start: "09:00", end: "17:00", is_open: true },
      tuesday: { start: "09:00", end: "17:00", is_open: true },
      wednesday: { start: "09:00", end: "17:00", is_open: true },
      thursday: { start: "09:00", end: "17:00", is_open: true },
      friday: { start: "09:00", end: "17:00", is_open: true },
      saturday: { start: "10:00", end: "14:00", is_open: true },
      sunday: { start: "", end: "", is_open: false },
    },
    everyday: {
      monday: { start: "08:00", end: "18:00", is_open: true },
      tuesday: { start: "08:00", end: "18:00", is_open: true },
      wednesday: { start: "08:00", end: "18:00", is_open: true },
      thursday: { start: "08:00", end: "18:00", is_open: true },
      friday: { start: "08:00", end: "18:00", is_open: true },
      saturday: { start: "08:00", end: "18:00", is_open: true },
      sunday: { start: "08:00", end: "18:00", is_open: true },
    },
    weekendsOff: {
      monday: { start: "08:00", end: "17:00", is_open: true },
      tuesday: { start: "08:00", end: "17:00", is_open: true },
      wednesday: { start: "08:00", end: "17:00", is_open: true },
      thursday: { start: "08:00", end: "17:00", is_open: true },
      friday: { start: "08:00", end: "17:00", is_open: true },
      saturday: { start: "", end: "", is_open: false },
      sunday: { start: "", end: "", is_open: false },
    },
  };

  const applyPreset = (preset) => {
    onChange(presetSchedules[preset]);
    toast.success("Working hours preset applied!");
  };

  const copyToAll = (day) => {
    const dayData = workingHours[day];
    if (!dayData.is_open) return;

    const newSchedule = {};
    daysOfWeek.forEach(({ key }) => {
      newSchedule[key] = { ...dayData };
    });
    onChange(newSchedule);
    toast.success("Working hours copied to all days!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyPreset("standard")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Standard (Mon-Fri 9-5, Sat 10-2)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("everyday")}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          Every Day (8-6)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("weekendsOff")}
          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Weekends Off (Mon-Fri 8-5)
        </button>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map(({ key, label }) => {
          const dayData = workingHours?.[key] || {
            start: "",
            end: "",
            is_open: false,
          };

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={dayData.is_open}
                    onChange={(e) =>
                      onChange({
                        ...workingHours,
                        [key]: { ...dayData, is_open: e.target.checked },
                      })
                    }
                    className="h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <label className="font-medium text-gray-700">{label}</label>
                </div>
                {dayData.is_open && (
                  <button
                    type="button"
                    onClick={() => copyToAll(key)}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    title="Copy to all days"
                  >
                    Copy to all
                  </button>
                )}
              </div>

              {dayData.is_open && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={dayData.start || ""}
                      onChange={(e) =>
                        onChange({
                          ...workingHours,
                          [key]: { ...dayData, start: e.target.value },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={dayData.end || ""}
                      onChange={(e) =>
                        onChange({
                          ...workingHours,
                          [key]: { ...dayData, end: e.target.value },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {!dayData.is_open && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Closed
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
WorkingHoursEditor.displayName = "WorkingHoursEditor";

// Component: Dive Center Details Modal (Optimized)
const DiveCenterDetailsModal = memo(({ diveCenter, onClose }) => {
  if (!diveCenter) return null;

  const workingHoursDisplay = useMemo(() => {
    if (!diveCenter.working_hours) return null;

    return Object.entries(diveCenter.working_hours).map(([day, hours]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: hours.is_open ? `${hours.start} - ${hours.end}` : "Closed",
    }));
  }, [diveCenter.working_hours]);

  return (
    <ModalWrapper visible={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-800 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon icon="mdi:scuba-diving" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{diveCenter.name}</h2>
              <p className="text-cyan-100">{diveCenter.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {diveCenter.images && diveCenter.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Gallery
              </h3>
              <ImageCarousel images={diveCenter.images} />
            </div>
          )}

          {diveCenter.video && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Video
              </h3>
              <div className="rounded-xl overflow-hidden shadow-md">
                <video
                  src={diveCenter.video}
                  controls
                  className="w-full h-auto"
                  poster={diveCenter.images?.[0]}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {diveCenter.coordinates?.latitude &&
            diveCenter.coordinates?.longitude && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Location
                </h3>
                <div className="h-64 rounded-xl overflow-hidden shadow-md">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.985143178028!2d${diveCenter.coordinates.longitude}!3d${diveCenter.coordinates.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${diveCenter.coordinates.latitude}N+${diveCenter.coordinates.longitude}E!5e0!3m2!1sen!2sus!4v1635788491234!5m2!1sen!2sus`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title={`${diveCenter.name} Map`}
                  ></iframe>
                </div>
              </div>
            )}

          {diveCenter.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {diveCenter.description}
              </p>
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Icon icon="mdi:phone" className="w-5 h-5 text-cyan-600" />
              <p className="text-gray-700">{diveCenter.phone}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Icon icon="mdi:email" className="w-5 h-5 text-cyan-600" />
              <p className="text-gray-700">{diveCenter.email}</p>
            </div>
            {diveCenter.hotel_name && (
              <div className="flex items-center space-x-3">
                <Icon icon="mdi:hotel" className="w-5 h-5 text-cyan-600" />
                <p className="text-gray-700">{diveCenter.hotel_name}</p>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Icon
                icon="mdi:calendar-plus"
                className="w-5 h-5 text-cyan-600"
              />
              <p className="text-gray-700">
                {formatDate(diveCenter.created_at)}
              </p>
            </div>
          </div>

          {workingHoursDisplay && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Working Hours
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {workingHoursDisplay.map(({ day, hours }) => (
                  <div key={day} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-600">
                      {day}
                    </div>
                    <div className="text-sm text-gray-800 font-mono">
                      {hours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
});
DiveCenterDetailsModal.displayName = "DiveCenterDetailsModal";

// Component: Dive Center Form Modal (Enhanced)
const DiveCenterFormModal = memo(({ diveCenter, onClose, onSave }) => {
  const isEditMode = Boolean(diveCenter?.id);
  const [formData, setFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultWorkingHours = useMemo(
    () => ({
      monday: { start: "09:00", end: "17:00", is_open: true },
      tuesday: { start: "09:00", end: "17:00", is_open: true },
      wednesday: { start: "09:00", end: "17:00", is_open: true },
      thursday: { start: "09:00", end: "17:00", is_open: true },
      friday: { start: "09:00", end: "17:00", is_open: true },
      saturday: { start: "10:00", end: "14:00", is_open: true },
      sunday: { start: "", end: "", is_open: false },
    }),
    [],
  );

  useEffect(() => {
    const initialData = {
      name: diveCenter?.name || "",
      description: diveCenter?.description || "",
      location: diveCenter?.location || "",
      hotel_name: diveCenter?.hotel_name || "",
      phone: diveCenter?.phone || "",
      email: diveCenter?.email || "",
      coordinates: diveCenter?.coordinates || { latitude: "", longitude: "" },
      working_hours: diveCenter?.working_hours || defaultWorkingHours,
    };
    setFormData(initialData);
    setSelectedImages([]);
    setSelectedVideo(null);
  }, [diveCenter, defaultWorkingHours]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCoordinatesChange = useCallback((field, value) => {
    if (value === "" || !isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [field]: value },
      }));
    }
  }, []);

  const handleWorkingHoursChange = useCallback((newWorkingHours) => {
    setFormData((prev) => ({ ...prev, working_hours: newWorkingHours }));
  }, []);

  const handleImagesChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files[0];
    setSelectedVideo(file);
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const errors = [];

      // Validate working hours
      Object.entries(formData.working_hours).forEach(([day, hours]) => {
        if (
          hours.is_open &&
          (!isValidTime(hours.start) || !isValidTime(hours.end))
        ) {
          errors.push(`Invalid time format for ${day}. Use HH:MM (24-hour).`);
        }

        if (hours.is_open && hours.start >= hours.end) {
          errors.push(`End time must be after start time for ${day}.`);
        }
      });

      // Validate coordinates
      if (
        formData.coordinates.latitude &&
        formData.coordinates.longitude &&
        (isNaN(formData.coordinates.latitude) ||
          isNaN(formData.coordinates.longitude))
      ) {
        errors.push("Coordinates must be valid numbers.");
      }

      if (errors.length > 0) {
        toast.error(errors.join(" "));
        return;
      }

      // Prepare data as JSON with base64 for files
      const data = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        hotel_name: formData.hotel_name || "",
        phone: formData.phone,
        email: formData.email,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude) || 0,
          longitude: parseFloat(formData.coordinates.longitude) || 0,
        },
        working_hours: formData.working_hours,
      };

      // Convert images to base64
      if (selectedImages.length > 0) {
        data.images = await Promise.all(
          selectedImages.map((file) => convertToBase64(file)),
        );
      }

      // Convert video to base64
      if (selectedVideo) {
        data.video = await convertToBase64(selectedVideo);
      }

      await onSave(data, diveCenter?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper visible={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-800 text-white p-6">
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Edit Dive Center" : "Create Dive Center"}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: General Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  General Information
                </h3>
                <Input
                  placeholder="Name *"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="bg-white"
                />
                <Input
                  placeholder="Location *"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  required
                  className="bg-white"
                />
                <Input
                  placeholder="Hotel Name (Optional)"
                  name="hotel_name"
                  value={formData.hotel_name || ""}
                  onChange={handleChange}
                  className="bg-white"
                />
                <Input
                  placeholder="Phone *"
                  name="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  required
                  className="bg-white"
                />
                <Input
                  placeholder="Email *"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  required
                  className="bg-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.coordinates?.latitude || ""}
                    onChange={(e) =>
                      handleCoordinatesChange("latitude", e.target.value)
                    }
                    className="bg-white"
                  />
                  <Input
                    placeholder="Longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.coordinates?.longitude || ""}
                    onChange={(e) =>
                      handleCoordinatesChange("longitude", e.target.value)
                    }
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 bg-white"
                  />
                </div>
              </div>

              {/* Column 2: Working Hours */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Working Hours
                </h3>
                <WorkingHoursEditor
                  workingHours={formData.working_hours || defaultWorkingHours}
                  onChange={handleWorkingHoursChange}
                />
              </div>

              {/* Column 3: Media Files */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Media Files
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (multiple, max 10)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 bg-white"
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImages((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video (optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 bg-white"
                  />
                  {selectedVideo && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedVideo.name}
                      <button
                        type="button"
                        onClick={() => setSelectedVideo(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-800 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
              )}
              <span>{isEditMode ? "Save Changes" : "Create Center"}</span>
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
});
DiveCenterFormModal.displayName = "DiveCenterFormModal";

// Action buttons component for better performance
const ActionButtons = memo(({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => onView(row.original)}
      className="p-2 text-gray-500 rounded-full hover:bg-cyan-100 hover:text-cyan-600 transition-colors"
      title="View Details"
    >
      <Icon icon="mdi:eye-outline" width={18} />
    </button>
    <button
      onClick={() => onEdit(row.original)}
      className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
      title="Edit"
    >
      <Icon icon="mdi:pencil-outline" width={18} />
    </button>
    <button
      onClick={() => onDelete(row.original.id, row.original.name)}
      className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
      title="Delete"
    >
      <Icon icon="mdi:delete-outline" width={18} />
    </button>
  </div>
));
ActionButtons.displayName = "ActionButtons";

// Main Component
export default function DiveCenterManagementPage() {
  const [diveCenters, setDiveCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [viewingCenter, setViewingCenter] = useState(null);
  const [editingCenter, setEditingCenter] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { userType } = useAuthStore();
  const router = useRouter();

  // Authorization check
  useEffect(() => {
    if (userType && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [userType, router]);

  // Optimized fetch function with better error handling
  const fetchData = useCallback(async (page = 1, perPage = 10, search = "") => {
    setIsLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
      };

      const data = await DiveCenterService.getAll(params);

      if (Array.isArray(data)) {
        setDiveCenters(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
          total_pages: Math.ceil(data.length / perPage),
          page: 1,
        }));
      } else {
        setDiveCenters(data.items || []);
        setPagination({
          page: data.page || 1,
          per_page: data.per_page || perPage,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dive centers:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Unknown error";
      toast.error(`Failed to fetch dive centers: ${errorMessage}`);
      setDiveCenters([]);
      setPagination((prev) => ({ ...prev, total: 0, total_pages: 1 }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, pagination.per_page, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.per_page, fetchData]);

  // Pagination handler
  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage >= 1 &&
        newPage <= pagination.total_pages &&
        newPage !== pagination.page
      ) {
        fetchData(newPage, pagination.per_page, searchTerm);
      }
    },
    [
      pagination.total_pages,
      pagination.page,
      pagination.per_page,
      searchTerm,
      fetchData,
    ],
  );

  // Modal handlers
  const handleOpenForm = useCallback((center = null) => {
    setEditingCenter(center);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCenter(null);
  }, []);

  // Save handler with better error handling
  const handleSave = useCallback(
    async (formData, centerId) => {
      const action = centerId ? "update" : "create";
      try {
        if (centerId) {
          await DiveCenterService.update(centerId, formData);
        } else {
          await DiveCenterService.create(formData);
        }

        toast.success(`Dive center successfully ${action}d!`);
        handleCloseForm();
        await fetchData(pagination.page, pagination.per_page, searchTerm);
      } catch (error) {
        console.error(`Failed to ${action} dive center:`, error);
        const errorMessage =
          error.response?.data?.detail || error.message || "Unknown error";
        toast.error(`Failed to ${action} dive center: ${errorMessage}`);
      }
    },
    [
      handleCloseForm,
      fetchData,
      pagination.page,
      pagination.per_page,
      searchTerm,
    ],
  );

  // Delete handler with confirmation
  const handleDelete = useCallback(
    async (centerId, centerName) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete "${centerName}". This cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#2563eb",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          await DiveCenterService.delete(centerId);
          toast.success(`Dive Center "${centerName}" deleted successfully.`);
          await fetchData(pagination.page, pagination.per_page, searchTerm);
        } catch (error) {
          console.error("Failed to delete dive center:", error);
          const errorMessage =
            error.response?.data?.detail || error.message || "Unknown error";
          toast.error(`Failed to delete dive center: ${errorMessage}`);
        }
      }
    },
    [fetchData, pagination.page, pagination.per_page, searchTerm],
  );

  // Memoized columns for better performance
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name & Location",
        cell: ({ row }) => (
          <div>
            <div
              className="font-bold text-gray-800 truncate max-w-48"
              title={row.original.name}
            >
              {row.original.name}
            </div>
            <div
              className="text-xs text-gray-500 truncate max-w-48"
              title={row.original.location}
            >
              {row.original.location}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div>
            <div
              className="text-sm text-gray-800 truncate max-w-48"
              title={row.original.email}
            >
              {row.original.email}
            </div>
            <div className="text-xs text-gray-500">{row.original.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: "hotel_name",
        header: "Hotel",
        cell: ({ row }) => (
          <div
            className="text-sm text-gray-600 truncate max-w-32"
            title={row.original.hotel_name}
          >
            {row.original.hotel_name || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date Added",
        cell: ({ row }) => (
          <div
            className="text-sm text-gray-600"
            title={new Date(row.original.created_at).toLocaleString()}
          >
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionButtons
            row={row}
            onView={setViewingCenter}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleOpenForm, handleDelete],
  );

  // Memoized table instance
  const table = useReactTable({
    data: diveCenters,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200/50 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon
                  icon="mdi:office-building-location-outline"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Dive Center Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage dive centers with ease and precision.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2 shadow-lg"
            >
              <Icon icon="mdi:plus-circle-outline" width={20} />
              <span>Create New</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Icon icon="mdi:store" className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Centers</p>
                <p className="text-2xl font-bold text-gray-800">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon
                  icon="mdi:check-circle"
                  className="w-6 h-6 text-green-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    diveCenters.filter((center) => {
                      const today = new Date()
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toLowerCase();
                      return center.working_hours?.[today]?.is_open;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon icon="mdi:hotel" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">With Hotels</p>
                <p className="text-2xl font-bold text-gray-800">
                  {diveCenters.filter((center) => center.hotel_name).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="mdi:map-marker" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">With Coordinates</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    diveCenters.filter(
                      (center) =>
                        center.coordinates?.latitude &&
                        center.coordinates?.longitude,
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-cyan-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Input
                icon="mdi:magnify"
                type="text"
                placeholder="Search by name, location, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white max-w-md"
              />
              <div className="text-sm text-gray-500">
                Showing {diveCenters.length} of {pagination.total} dive centers
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:map-marker-off-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Dive Centers Found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? `No dive centers match "${searchTerm}". Try adjusting your search.`
                    : "Get started by creating your first dive center."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => handleOpenForm()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Your First Dive Center
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-cyan-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-cyan-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            <Icon
                              icon={
                                header.column.getIsSorted() === "asc"
                                  ? "mdi:arrow-up"
                                  : header.column.getIsSorted() === "desc"
                                    ? "mdi:arrow-down"
                                    : "mdi:unfold-more-horizontal"
                              }
                              className="text-gray-400 w-4 h-4"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-cyan-50/30 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading &&
            diveCenters.length > 0 &&
            pagination.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Page <strong>{pagination.page}</strong> of{" "}
                    <strong>{pagination.total_pages}</strong> (
                    <strong>{pagination.total}</strong> items)
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <Icon icon="mdi:chevron-double-left" width={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.total_pages)}
                      disabled={pagination.page === pagination.total_pages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <Icon icon="mdi:chevron-double-right" width={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Modals */}
        {viewingCenter && (
          <DiveCenterDetailsModal
            diveCenter={viewingCenter}
            onClose={() => setViewingCenter(null)}
          />
        )}
        {isFormOpen && (
          <DiveCenterFormModal
            diveCenter={editingCenter}
            onClose={handleCloseForm}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

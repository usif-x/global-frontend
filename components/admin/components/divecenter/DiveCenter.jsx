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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Helper: Format Date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

// Component: Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="relative">
      <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);

// Component: Table Skeleton
const TableSkeleton = ({ rows = 5, cols = 6 }) => (
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
);

// Component: Modal Wrapper
const ModalWrapper = ({ children, onClose, visible }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};

// Component: Image Carousel
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
      <img
        src={images[currentIndex]}
        alt={`Dive center image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

// Component: Dive Center Details Modal
const DiveCenterDetailsModal = ({ diveCenter, onClose }) => {
  if (!diveCenter) return null;

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
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
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
              <p className="text-gray-600">{diveCenter.description}</p>
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
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Working Hours
            </h3>
            <div className="space-y-2">
              {Object.entries(diveCenter.working_hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600 capitalize">
                    {day}
                  </span>
                  <span className="font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                    {hours.is_open ? `${hours.start} - ${hours.end}` : "Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// Component: Dive Center Form Modal
const DiveCenterFormModal = ({ diveCenter, onClose, onSave }) => {
  const isEditMode = Boolean(diveCenter?.id);
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const initialData = {
      name: diveCenter?.name || "",
      description: diveCenter?.description || "",
      location: diveCenter?.location || "",
      hotel_name: diveCenter?.hotel_name || "",
      phone: diveCenter?.phone || "",
      email: diveCenter?.email || "",
      images: diveCenter?.images?.join("\n") || "",
      coordinates: diveCenter?.coordinates || { latitude: "", longitude: "" },
      working_hours: diveCenter?.working_hours || {
        monday: { start: "09:00", end: "17:00", is_open: true },
        tuesday: { start: "09:00", end: "17:00", is_open: true },
        wednesday: { start: "09:00", end: "17:00", is_open: true },
        thursday: { start: "09:00", end: "17:00", is_open: true },
        friday: { start: "09:00", end: "17:00", is_open: true },
        saturday: { start: "10:00", end: "14:00", is_open: true },
        sunday: { start: "", end: "", is_open: false },
      },
    };
    setFormData(initialData);
    setImagePreviews(diveCenter?.images || []);
  }, [diveCenter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinatesChange = (field, value) => {
    if (!isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [field]: value },
      }));
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: { ...prev.working_hours[day], [field]: value },
      },
    }));
  };

  const handleImagesChange = (e) => {
    const urls = e.target.value.split("\n").filter((url) => url.trim() !== "");
    setFormData((prev) => ({ ...prev, images: e.target.value }));
    setImagePreviews(urls.filter(isValidUrl));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = [];

    // Validate working hours
    Object.entries(formData.working_hours).forEach(([day, hours]) => {
      if (
        hours.is_open &&
        (!isValidTime(hours.start) || !isValidTime(hours.end))
      ) {
        errors.push(`Invalid time format for ${day}. Use HH:MM (24-hour).`);
      }
    });

    // Validate image URLs
    const imageUrls = formData.images
      .split("\n")
      .filter((url) => url.trim() !== "");
    if (imageUrls.some((url) => !isValidUrl(url))) {
      errors.push("One or more image URLs are invalid.");
    }

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

    const finalData = {
      ...formData,
      images: imageUrls,
      coordinates: {
        latitude: parseFloat(formData.coordinates.latitude) || 0,
        longitude: parseFloat(formData.coordinates.longitude) || 0,
      },
    };
    onSave(finalData, diveCenter?.id);
  };

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <ModalWrapper visible={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-800 text-white p-6">
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Edit Dive Center" : "Create Dive Center"}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[80vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Column 1: General Info */}
            <div className="space-y-6">
              <Input
                placeholder="Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="bg-white"
              />
              <Input
                placeholder="Location"
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
                placeholder="Phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                required
                className="bg-white"
              />
              <Input
                placeholder="Email"
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

            {/* Column 2: Working Hours & Images */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Working Hours
                </h4>
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="grid grid-cols-4 items-center gap-2 mb-2"
                  >
                    <label className="capitalize text-sm font-medium text-gray-600">
                      {day}
                    </label>
                    <input
                      type="checkbox"
                      checked={formData.working_hours?.[day]?.is_open || false}
                      onChange={(e) =>
                        handleWorkingHoursChange(
                          day,
                          "is_open",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-cyan-600"
                    />
                    <input
                      type="time"
                      value={formData.working_hours?.[day]?.start || ""}
                      onChange={(e) =>
                        handleWorkingHoursChange(day, "start", e.target.value)
                      }
                      disabled={!formData.working_hours?.[day]?.is_open}
                      className="col-span-2 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                    />
                    <input
                      type="time"
                      value={formData.working_hours?.[day]?.end || ""}
                      onChange={(e) =>
                        handleWorkingHoursChange(day, "end", e.target.value)
                      }
                      disabled={!formData.working_hours?.[day]?.is_open}
                      className="col-span-2 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URLs (one per line)
                </label>
                <textarea
                  name="images"
                  value={formData.images || ""}
                  onChange={handleImagesChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg shadow-sm"
                        onError={() => {
                          setImagePreviews((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          toast.error(`Invalid image URL: ${url}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-800 text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              {isEditMode ? "Save Changes" : "Create Center"}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// Main Component
export default function DiveCenterManagementPage() {
  const [diveCenters, setDiveCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
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

  useEffect(() => {
    if (userType && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [userType, router]);

  const fetchData = useCallback(async (page = 1, perPage = 10, search = "") => {
    setIsLoading(true);
    try {
      const data = await DiveCenterService.getAll({
        page,
        per_page: perPage,
        search: search || null,
      });
      if (Array.isArray(data)) {
        setDiveCenters(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
          total_pages: 1,
          page: 1,
        }));
      } else {
        setDiveCenters(data.items || []);
        setPagination({
          page: data.page,
          per_page: data.per_page,
          total: data.total,
          total_pages: data.total_pages,
        });
      }
    } catch (error) {
      toast.error(
        `Failed to fetch dive centers: ${
          error.response?.data?.detail || error.message
        }`
      );
      setDiveCenters([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, pagination.per_page, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.per_page, fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchData(newPage, pagination.per_page, searchTerm);
    }
  };

  const handleOpenForm = (center = null) => {
    setEditingCenter(center);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCenter(null);
  };

  const handleSave = async (formData, centerId) => {
    const action = centerId ? "update" : "create";
    try {
      await (centerId
        ? DiveCenterService.update(centerId, formData)
        : DiveCenterService.create(formData));
      toast.success(`Dive center successfully ${action}d!`);
      handleCloseForm();
      fetchData(pagination.page, pagination.per_page, searchTerm);
    } catch (error) {
      toast.error(
        `Failed to ${action} dive center: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
  };

  const handleDelete = async (centerId, centerName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${centerName}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await DiveCenterService.delete(centerId);
        toast.success(`Dive Center "${centerName}" deleted.`);
        fetchData(pagination.page, pagination.per_page, searchTerm);
      } catch (error) {
        toast.error(
          `Failed to delete dive center: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-gray-800">{row.original.name}</div>
            <div className="text-xs text-gray-500">{row.original.location}</div>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "created_at",
        header: "Date Added",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewingCenter(row.original)}
              className="p-2 text-gray-500 rounded-full hover:bg-cyan-100 hover:text-cyan-600"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>
            <button
              onClick={() => handleOpenForm(row.original)}
              className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600"
              title="Edit"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id, row.original.name)}
              className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
              title="Delete"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

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
                <Icon icon="mdi:scuba-diving" className="w-8 h-8" />
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
              className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 flex items-center space-x-2"
            >
              <Icon icon="mdi:plus-circle-outline" width={20} />
              <span>Create New</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-cyan-50">
            <Input
              icon="mdi:magnify"
              type="text"
              placeholder="Search by name, location, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white max-w-md"
            />
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
                <p className="text-gray-500">
                  Try adjusting your search or create a new dive center.
                </p>
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
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-cyan-100/50"
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-cyan-50/30 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
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
                    {pagination.total} items)
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
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

"use client";

import Input from "@/components/ui/Input";
import GalleryService from "@/services/galleryService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// --- Thematic Loading Spinner ---
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);

// --- Table Skeleton Loader ---
const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-slate-200 rounded"
            style={{ width: `${100 / cols}%` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

// --- Format Date Helper ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- File Size Helper ---
const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

// --- Image Preview Component ---
const ImagePreview = ({ src, alt, className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg ${className}`}>
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
      onError={(e) => {
        e.target.src = "/placeholder-image.svg";
      }}
    />
  </div>
);

// --- Modal Wrapper ---
const ModalWrapper = ({ children, onClose, visible }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          ​
        </span>
        {children}
      </div>
    </div>
  );
};

// --- Image Details Modal ---
const ImageDetailsModal = ({ image, onClose }) => {
  if (!image) return null;

  const fullImageUrl = `${
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }${image.url}`;

  return (
    <ModalWrapper visible={!!image} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:image" className="w-8 h-8" />
            </div>
            <div>
              <h2 id="modal-title" className="text-2xl font-bold">
                {image.name}
              </h2>
              <p className="text-cyan-100 mt-1">
                Uploaded on {formatDate(image.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Image Preview
              </h3>
              <div className="bg-slate-100 rounded-xl p-4">
                <ImagePreview
                  src={fullImageUrl}
                  alt={image.name}
                  className="w-full h-64"
                />
              </div>
              <div className="mt-4 flex space-x-2">
                <a
                  href={fullImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Icon icon="mdi:open-in-new" className="w-4 h-4" />
                  <span>View Full Size</span>
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(fullImageUrl)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Icon icon="mdi:content-copy" className="w-4 h-4" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>

            {/* Image Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Image Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:identifier"
                    className="w-5 h-5 text-slate-400 mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-500">ID</p>
                    <p className="text-slate-700 font-mono">#{image.id}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:file-image"
                    className="w-5 h-5 text-slate-400 mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      File Name
                    </p>
                    <p className="text-slate-700">{image.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:link"
                    className="w-5 h-5 text-slate-400 mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      URL Path
                    </p>
                    <p className="text-slate-700 font-mono text-sm break-all">
                      {image.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:calendar"
                    className="w-5 h-5 text-slate-400 mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Created At
                    </p>
                    <p className="text-slate-700">
                      {formatDate(image.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- Upload Modal ---
const UploadModal = ({ visible, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setSelectedFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        // Validate file is actually a File object
        if (!(file instanceof File)) {
          throw new Error(`Invalid file: ${file.name || "Unknown"}`);
        }
        console.log(
          "Uploading file:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );
        await onUpload(file);
      }
      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!visible) return null;

  return (
    <ModalWrapper visible={visible} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Upload Images</h3>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-300 hover:border-cyan-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon
              icon="mdi:cloud-upload"
              className="w-12 h-12 text-slate-400 mx-auto mb-4"
            />
            <p className="text-slate-600 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-slate-400">
              Supports: JPG, PNG, GIF, WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-600 mb-2">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <span className="text-sm text-slate-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {uploading && <LoadingSpinner />}
              <span>{uploading ? "Uploading..." : "Upload"}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

//=================================================================
//  MAIN GALLERY MANAGEMENT COMPONENT
//=================================================================
export default function GalleryManagementPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { userType } = useAuthStore();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (userType && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [userType, router]);

  // Fetch images
  const fetchImages = async (page = 1, perPage = 12, search = "") => {
    setIsLoading(true);
    try {
      const response = await GalleryService.getAllImages({
        skip: (page - 1) * perPage,
        limit: perPage,
        search: search || null,
      });

      setImages(response.images || []);
      setPagination({
        page: page,
        per_page: perPage,
        total: response.total,
        total_pages: Math.ceil(response.total / perPage),
      });
    } catch (error) {
      toast.error(
        "Failed to fetch images. " +
          (error.response?.data?.detail || error.message)
      );
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and fetch on dependency change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImages(1, pagination.per_page, searchTerm);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.per_page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchImages(newPage, pagination.per_page, searchTerm);
    }
  };

  const handleUploadImage = async (file) => {
    try {
      await GalleryService.uploadImage(file);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleUploadComplete = () => {
    fetchImages(pagination.page, pagination.per_page, searchTerm);
  };

  const handleDeleteImage = async (imageId, imageName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this! This will permanently delete "${imageName}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await GalleryService.deleteImage(imageId);
        toast.success(`Image "${imageName}" has been deleted.`);
        fetchImages(pagination.page, pagination.per_page, searchTerm);
      } catch (error) {
        toast.error(
          "Failed to delete image. " +
            (error.response?.data?.detail || error.message)
        );
      }
    }
  };

  const handleDeleteAllImages = async () => {
    const result = await Swal.fire({
      title: "Delete All Images?",
      text: "This will permanently delete ALL images in the gallery. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
      input: "text",
      inputPlaceholder: "Type 'DELETE ALL' to confirm",
      inputValidator: (value) => {
        if (value !== "DELETE ALL") {
          return "Please type 'DELETE ALL' to confirm";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await GalleryService.deleteAllImages();
        toast.success(
          `Successfully deleted ${response.message || "all images"}.`
        );
        fetchImages(1, pagination.per_page, searchTerm);
      } catch (error) {
        toast.error(
          "Failed to delete all images. " +
            (error.response?.data?.detail || error.message)
        );
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            #{String(row.original.id).padStart(4, "0")}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Image",
        cell: ({ row }) => {
          const fullUrl = `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }${row.original.url}`;
          return (
            <div className="flex items-center space-x-3">
              <ImagePreview
                src={fullUrl}
                alt={row.original.name}
                className="w-12 h-12"
              />
              <div>
                <div className="font-medium text-slate-800 truncate max-w-48">
                  {row.original.name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {row.original.url.split("/").pop()}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-slate-600 truncate max-w-32">
              {row.original.url}
            </span>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                  }${row.original.url}`
                )
              }
              className="p-1 text-slate-400 hover:text-cyan-600 transition-colors"
              title="Copy full URL"
            >
              <Icon icon="mdi:content-copy" className="w-4 h-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Upload Date",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedImage(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>
            <a
              href={`${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
              }${row.original.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
              title="View Full Size"
            >
              <Icon icon="mdi:open-in-new" width={18} />
            </a>
            <button
              onClick={() =>
                handleDeleteImage(row.original.id, row.original.name)
              }
              className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Delete Image"
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
    data: images,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:image-multiple" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Gallery Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage and organize your image gallery.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setUploadModalVisible(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                <span>Upload Images</span>
              </button>
              {images.length > 0 && (
                <button
                  onClick={handleDeleteAllImages}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <Icon icon="mdi:delete-sweep" className="w-5 h-5" />
                  <span>Delete All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Total Images
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {pagination.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Icon
                  icon="mdi:image-multiple"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Current Page
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {pagination.page} / {pagination.total_pages}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <Icon
                  icon="mdi:file-document-multiple"
                  className="w-6 h-6 text-green-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Per Page</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {pagination.per_page}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Icon
                  icon="mdi:view-grid"
                  className="w-6 h-6 text-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  type="text"
                  placeholder="Search by image name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-600">
                Showing {images.length} of {pagination.total} images
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:image-off-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Images Found
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm
                    ? "No images match your search."
                    : "Your gallery is empty."}
                </p>
                <button
                  onClick={() => setUploadModalVisible(true)}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Upload Your First Image
                </button>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none hover:bg-cyan-100/50 transition-colors"
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
                              className="text-slate-400 w-4 h-4"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-cyan-50/30 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
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

          {/* Pagination */}
          {!isLoading && images.length > 0 && pagination.total_pages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page <strong>{pagination.page}</strong> of{" "}
                  <strong>{pagination.total_pages}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.total_pages)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedImage && (
        <ImageDetailsModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={async (file) => {
          await handleUploadImage(file);
          handleUploadComplete();
        }}
      />
    </div>
  );
}

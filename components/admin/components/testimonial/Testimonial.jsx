"use client";

import Input from "@/components/ui/Input";
import { getData } from "@/lib/axios";
import AdminService from "@/services/adminService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Enhanced Loading Spinner with Testimonial Theme
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-amber-500 animate-spin"></div>
    </div>
  </div>
);

// Enhanced Table Skeleton
const TableSkeleton = ({ rows = 5 }) => (
  <div className="p-4 space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-200"></div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 w-4 rounded bg-slate-200"></div>
              ))}
            </div>
            <div
              className={`h-4 rounded bg-slate-200 ${
                i % 2 === 0 ? "w-3/4" : "w-2/3"
              }`}
            ></div>
            <div className="h-3 rounded bg-slate-200 w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-16 rounded bg-slate-200"></div>
              <div className="h-8 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Format Date Helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Star Rating Display Component
const StarRating = ({ rating, size = "w-4 h-4" }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 !== 0;

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          icon={
            i < fullStars
              ? "mdi:star"
              : i === fullStars && hasHalfStar
              ? "mdi:star-half-full"
              : "mdi:star-outline"
          }
          className={`${size} ${
            i < fullStars || (i === fullStars && hasHalfStar)
              ? "text-amber-400"
              : "text-slate-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600">
        ({rating || 0}/5)
      </span>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ isAccepted, isRejected }) => {
  const getStatusConfig = (isAccepted) => {
    if (isAccepted === true) {
      return {
        color: "bg-green-100 text-green-700",
        icon: "mdi:check-circle",
        label: "Approved",
      };
    } else if (isAccepted === false && isRejected === false) {
      return {
        color: "bg-amber-100 text-amber-700",
        icon: "mdi:clock-outline",
        label: "Pending",
      };
    } else if (isAccepted === false && isRejected === true) {
      return {
        color: "bg-red-100 text-red-700",
        icon: "mdi:close-circle",
        label: "Rejected",
      };
    } else {
      return {
        color: "bg-red-100 text-red-700",
        icon: "mdi:close-circle",
        label: "Rejected",
      };
    }
  };

  const config = getStatusConfig(isAccepted);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Enhanced Modal Wrapper
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

// Testimonial Details Modal
const TestimonialDetailsModal = ({ testimonial, onClose }) => (
  <ModalWrapper visible={!!testimonial} onClose={onClose}>
    <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in fade-in-0 zoom-in-95">
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon icon="mdi:message-star" className="w-8 h-8" />
          </div>
          <div>
            <h2 id="modal-title" className="text-2xl font-bold">
              Testimonial Details
            </h2>
            <p className="text-amber-100 mt-1">
              From {testimonial?.user_name || "Anonymous User"}
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
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <StarRating rating={testimonial?.rating || 0} size="w-6 h-6" />
          <StatusBadge
            isAccepted={testimonial?.is_accepted}
            isRejected={testimonial?.is_rejected}
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
            <Icon
              icon="mdi:format-quote-open"
              className="w-5 h-5 mr-2 text-amber-500"
            />
            Testimonial Content
          </h3>
          <p className="text-slate-700 leading-relaxed italic">
            "{testimonial?.description || "No content available"}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Icon
              icon="mdi:account-circle"
              className="w-5 h-5 text-slate-400"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Customer Name
              </p>
              <p className="text-slate-600">
                {testimonial?.user_name || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:email" className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Email</p>
              <p className="text-slate-600">
                {testimonial?.user_email || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Submitted</p>
              <p className="text-slate-600">
                {formatDate(testimonial?.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:update" className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Last Updated</p>
              <p className="text-slate-600">
                {formatDate(testimonial?.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalWrapper>
);

// Bulk Actions Modal
const BulkActionsModal = ({ visible, onClose, onConfirm, action, count }) => {
  const [isLoading, setIsLoading] = useState(false);

  const actionConfigs = {
    deleteAll: {
      title: "Delete All Testimonials",
      message: `Are you sure you want to delete all ${count} testimonials? This action cannot be undone.`,
      confirmText: "Delete All",
      icon: "mdi:delete-sweep",
      color: "from-red-500 to-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    acceptAll: {
      title: "Accept All Pending",
      message: `Accept all ${count} pending testimonials?`,
      confirmText: "Accept All",
      icon: "mdi:check-all",
      color: "from-green-500 to-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    rejectAll: {
      title: "Reject All Pending",
      message: `Reject all ${count} pending testimonials?`,
      confirmText: "Reject All",
      icon: "mdi:close-circle-multiple",
      color: "from-red-500 to-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
  };

  const config = actionConfigs[action] || actionConfigs.deleteAll;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Bulk action error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div
          className={`relative bg-gradient-to-r ${config.color} text-white p-6`}
        >
          <div className="flex items-center space-x-3">
            <Icon icon={config.icon} className="w-7 h-7" />
            <h2 className="text-xl font-bold">{config.title}</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700 mb-6">{config.message}</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 ${config.buttonColor} text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center space-x-2`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Processing...</span>
                </>
              ) : (
                config.confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

//=================================================================
//  USER SERVICE TO FETCH USER INFO
//=================================================================
const UserService = {
  async getUserById(userId) {
    const response = await getData(`/users/${userId}`);
    return response;
  },
};

//=================================================================
//  MAIN TESTIMONIAL MANAGEMENT COMPONENT
//=================================================================
export default function TestimonialManagementPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [bulkAction, setBulkAction] = useState({
    visible: false,
    action: null,
    count: 0,
  });
  const [usersCache, setUsersCache] = useState({});

  const { token, userType } = useAuthStore();
  const router = useRouter();

  // Check admin access
  useEffect(() => {
    if (token && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [token, userType, router]);

  // Fetch user info and cache it
  const fetchUserInfo = async (userId) => {
    if (usersCache[userId]) {
      return usersCache[userId];
    }

    try {
      const userData = await UserService.getUserById(userId);
      const userInfo = {
        full_name: userData.full_name,
        email: userData.email,
      };

      setUsersCache((prev) => ({
        ...prev,
        [userId]: userInfo,
      }));

      return userInfo;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return {
        full_name: "Unknown User",
        email: "N/A",
      };
    }
  };

  // Fetch testimonials and enrich with user data
  const fetchTestimonials = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await AdminService.getAllTestimonials();
      const testimonialsArray = Array.isArray(data) ? data : [];

      // Enrich testimonials with user data
      const enrichedTestimonials = await Promise.all(
        testimonialsArray.map(async (testimonial) => {
          const userInfo = await fetchUserInfo(testimonial.user_id);
          return {
            ...testimonial,
            user_name: userInfo.full_name,
            user_email: userInfo.email,
            // Map API fields to component expectations
            content: testimonial.description,
            status:
              testimonial.is_accepted === true
                ? "approved"
                : testimonial.is_accepted === false
                ? "pending"
                : testimonial.is_rejected === true
                ? "rejected"
                : "unknown",
          };
        })
      );

      setTestimonials(enrichedTestimonials);
    } catch (error) {
      toast.error(error.message || "Failed to fetch testimonials");
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [token]);

  // Handle individual testimonial actions
  const handleTestimonialAction = async (id, action) => {
    try {
      switch (action) {
        case "accept":
          await AdminService.acceptTestimonial(id);
          toast.success("Testimonial accepted successfully");
          break;
        case "reject":
          await AdminService.rejectTestimonial(id);
          toast.success("Testimonial rejected successfully");
          break;
        case "delete":
          if (
            window.confirm("Are you sure you want to delete this testimonial?")
          ) {
            await AdminService.deleteTestimonial(id);
            toast.success("Testimonial deleted successfully");
          } else {
            return;
          }
          break;
      }
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} testimonial`);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case "deleteAll":
          await AdminService.deleteAllTestimonials();
          toast.success("All testimonials deleted successfully");
          break;
        // Note: You might want to add bulk accept/reject methods to your AdminService
        default:
          toast.info("Bulk action not implemented yet");
          return;
      }
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || "Failed to perform bulk action");
    }
  };

  // Filter testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimonial) => {
      const matchesSearch =
        testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimonial.user_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimonial.user_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" &&
          testimonial.is_accepted === false &&
          !testimonial.is_rejected) ||
        (statusFilter === "approved" &&
          testimonial.is_accepted === true &&
          !testimonial.is_rejected) ||
        (statusFilter === "rejected" &&
          testimonial.is_rejected === true &&
          testimonials.is_accepted == false);
      const matchesRating =
        ratingFilter === "all" ||
        Math.floor(testimonial.rating || 0) === parseInt(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [testimonials, searchTerm, statusFilter, ratingFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = testimonials.length;
    const accepted = testimonials.filter((t) => t.is_accepted === true).length;
    const pending = testimonials.filter((t) => t.is_accepted === false).length;
    const rejected = testimonials.filter((t) => t.is_rejected === true).length;
    const avgRating =
      testimonials.length > 0
        ? (
            testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) /
            testimonials.length
          ).toFixed(1)
        : 0;

    return { total, accepted, pending, rejected, avgRating };
  }, [testimonials]);

  // Handle modal for testimonial details
  const handleViewTestimonial = async (testimonial) => {
    // Ensure user data is loaded for the modal
    if (!testimonial.user_name) {
      const userInfo = await fetchUserInfo(testimonial.user_id);
      testimonial.user_name = userInfo.full_name;
      testimonial.user_email = userInfo.email;
    }
    setSelectedTestimonial(testimonial);
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "user_name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {(row.original.user_name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-slate-800">
                {row.original.user_name || "Loading..."}
              </div>
              <div className="text-xs text-slate-500">
                {row.original.user_email || "Loading..."}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => <StarRating rating={row.original.rating || 0} />,
      },
      {
        accessorKey: "description",
        header: "Testimonial",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="text-sm text-slate-700 truncate">
              {row.original.description || "No content"}
            </p>
            {row.original.description &&
              row.original.description.length > 50 && (
                <button
                  onClick={() => handleViewTestimonial(row.original)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
                >
                  Read more...
                </button>
              )}
          </div>
        ),
      },
      {
        accessorKey: "is_accepted",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            isAccepted={row.original.is_accepted}
            isRejected={row.original.is_rejected}
          />
        ),
      },
      {
        accessorKey: "created_at",
        header: "Submitted",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const testimonial = row.original;
          const isPending = testimonial.is_accepted === false;
          const isAccepted = testimonial.is_accepted === true;

          return (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleViewTestimonial(testimonial)}
                className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
                title="View Details"
              >
                <Icon icon="mdi:eye-outline" width={18} />
              </button>

              {isPending && (
                <>
                  <button
                    onClick={() =>
                      handleTestimonialAction(testimonial.id, "accept")
                    }
                    className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-green-100 hover:text-green-600"
                    title="Accept"
                  >
                    <Icon icon="mdi:check" width={18} />
                  </button>
                  <button
                    onClick={() =>
                      handleTestimonialAction(testimonial.id, "reject")
                    }
                    className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                    title="Reject"
                  >
                    <Icon icon="mdi:close" width={18} />
                  </button>
                </>
              )}

              {isAccepted && (
                <button
                  onClick={() =>
                    handleTestimonialAction(testimonial.id, "reject")
                  }
                  className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                  title="Reject"
                >
                  <Icon icon="mdi:close" width={18} />
                </button>
              )}

              <button
                onClick={() =>
                  handleTestimonialAction(testimonial.id, "delete")
                }
                className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                title="Delete"
              >
                <Icon icon="mdi:delete-outline" width={18} />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredTestimonials,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-amber-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:message-star" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Testimonial Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Review, approve, and manage customer testimonials
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setBulkAction({
                    visible: true,
                    action: "deleteAll",
                    count: testimonials.length,
                  })
                }
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={testimonials.length === 0}
              >
                <Icon icon="mdi:delete-sweep" className="w-5 h-5" />
                <span>Delete All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              title: "Total Testimonials",
              value: stats.total,
              icon: "mdi:message-text",
              color: "from-blue-500 to-cyan-500",
              bg: "bg-blue-50",
              text: "text-blue-700",
            },
            {
              title: "Approved",
              value: stats.accepted,
              icon: "mdi:check-circle",
              color: "from-green-500 to-emerald-500",
              bg: "bg-green-50",
              text: "text-green-700",
            },
            {
              title: "Pending Review",
              value: stats.pending,
              icon: "mdi:clock-outline",
              color: "from-amber-500 to-yellow-500",
              bg: "bg-amber-50",
              text: "text-amber-700",
            },
            {
              title: "Rejected",
              value: stats.rejected,
              icon: "mdi:close-circle",
              color: "from-red-500 to-pink-500",
              bg: "bg-red-50",
              text: "text-red-700",
            },
            {
              title: "Average Rating",
              value: `${stats.avgRating}★`,
              icon: "mdi:star",
              color: "from-purple-500 to-indigo-500",
              bg: "bg-purple-50",
              text: "text-purple-700",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon icon={stat.icon} className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Filters and Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  name="search"
                  type="text"
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="amber"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-600">
                    Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-600">
                    Rating:
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredTestimonials.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:message-outline"
                    className="w-10 h-10 text-amber-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Testimonials Found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  ratingFilter !== "all"
                    ? "No testimonials match your current filters."
                    : "No testimonials have been submitted yet."}
                </p>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  ratingFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setRatingFilter("all");
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto hover:shadow-lg transition-all"
                  >
                    <Icon icon="mdi:filter-remove" className="w-5 h-5" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-amber-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none hover:bg-amber-100/50 transition-colors"
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
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
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

          {/* Table Footer */}
          {!isLoading && filteredTestimonials.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredTestimonials.length} of{" "}
                    {testimonials.length} testimonials
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Approved: {stats.accepted}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs">Pending: {stats.pending}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Rejected: {stats.rejected}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        {testimonials.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Icon
                icon="mdi:lightning-bolt"
                className="w-5 h-5 mr-2 text-amber-500"
              />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-green-800">
                    Pending Testimonials
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    {stats.pending}
                  </span>
                </div>
                <p className="text-sm text-green-600 mb-3">
                  Review and approve pending customer feedback
                </p>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Review Pending
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-800">High Ratings</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {testimonials.filter((t) => (t.rating || 0) >= 4).length}
                  </span>
                </div>
                <p className="text-sm text-blue-600 mb-3">
                  View testimonials with 4+ star ratings
                </p>
                <button
                  onClick={() => {
                    setRatingFilter("4");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  View High Ratings
                </button>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-amber-800">
                    Recent Submissions
                  </h3>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                    {
                      testimonials.filter((t) => {
                        if (!t.created_at) return false;
                        const created = new Date(t.created_at);
                        const weekAgo = new Date(
                          Date.now() - 7 * 24 * 60 * 60 * 1000
                        );
                        return created > weekAgo;
                      }).length
                    }
                  </span>
                </div>
                <p className="text-sm text-amber-600 mb-3">
                  Testimonials submitted in the last 7 days
                </p>
                <button
                  onClick={() => {
                    // Sort by most recent
                    setSorting([{ id: "created_at", desc: true }]);
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  View Recent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export and Analytics Panel */}
        {testimonials.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Icon
                icon="mdi:chart-line"
                className="w-5 h-5 mr-2 text-purple-500"
              />
              Analytics & Export
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">
                  Rating Distribution
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = testimonials.filter(
                      (t) => Math.floor(t.rating || 0) === rating
                    ).length;
                    const percentage =
                      testimonials.length > 0
                        ? (count / testimonials.length) * 100
                        : 0;
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Icon
                            icon="mdi:star"
                            className="w-4 h-4 text-amber-400"
                          />
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 w-12">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Export Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Implement CSV export
                      const csvContent = testimonials
                        .map(
                          (t) =>
                            `"${t.user_name || ""}","${t.user_email || ""}","${
                              t.rating || ""
                            }","${(t.description || "").replace(
                              /"/g,
                              '""'
                            )}","${
                              t.is_accepted === true
                                ? "Approved"
                                : t.is_accepted === false
                                ? "Pending"
                                : "Rejected"
                            }","${t.created_at || ""}"`
                        )
                        .join("\n");
                      const header = "Name,Email,Rating,Content,Status,Date\n";
                      const blob = new Blob([header + csvContent], {
                        type: "text/csv",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "testimonials.csv";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Icon icon="mdi:file-excel" className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      // Implement approved testimonials export
                      const approvedTestimonials = testimonials.filter(
                        (t) => t.is_accepted === true
                      );
                      const csvContent = approvedTestimonials
                        .map(
                          (t) =>
                            `"${t.user_name || ""}","${t.rating || ""}","${(
                              t.description || ""
                            ).replace(/"/g, '""')}","${t.created_at || ""}"`
                        )
                        .join("\n");
                      const header = "Name,Rating,Content,Date\n";
                      const blob = new Blob([header + csvContent], {
                        type: "text/csv",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "approved-testimonials.csv";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Icon icon="mdi:check-circle" className="w-4 h-4" />
                    <span>Export Approved Only</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTestimonial && (
        <TestimonialDetailsModal
          testimonial={selectedTestimonial}
          onClose={() => setSelectedTestimonial(null)}
        />
      )}

      <BulkActionsModal
        visible={bulkAction.visible}
        onClose={() =>
          setBulkAction({ visible: false, action: null, count: 0 })
        }
        onConfirm={() => handleBulkAction(bulkAction.action)}
        action={bulkAction.action}
        count={bulkAction.count}
      />
    </div>
  );
}

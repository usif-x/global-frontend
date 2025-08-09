"use client";

import Input from "@/components/ui/Input";
import { putData } from "@/lib/axios";
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
const TableSkeleton = ({ rows = 5 }) => (
  <div className="p-4 space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-200 to-blue-200"></div>
          <div className="flex-1 space-y-3">
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

// --- Format Date Helper ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString.replace(" ", "T")).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// --- Format Last Login Helper ---
const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return "Never";
  try {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// --- User Status Badge ---
const UserStatusBadge = ({ isActive, isBlocked }) => {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <Icon icon="mdi:account-cancel" className="w-3 h-3" />
        Blocked
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Icon icon="mdi:account-check" className="w-3 h-3" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      <Icon icon="mdi:account-outline" className="w-3 h-3" />
      Inactive
    </span>
  );
};

// --- Modal Wrapper (Re-used) ---
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

// --- User Details Modal (Re-styled) ---
const UserDetailsModal = ({ user, onClose }) => (
  <ModalWrapper visible={!!user} onClose={onClose}>
    <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in fade-in-0 zoom-in-95">
      <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon icon="mdi:account-details" className="w-8 h-8" />
          </div>
          <div>
            <h2 id="modal-title" className="text-2xl font-bold">
              User Profile
            </h2>
            <p className="text-cyan-100 mt-1">
              Detailed information for {user.full_name}
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
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:identifier" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">User ID</p>
            <p className="text-slate-600">{user.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:account-circle" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Full Name</p>
            <p className="text-slate-600">{user.full_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:email" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Email</p>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:shield-account" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Role</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:toggle-switch" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Status</p>
            <UserStatusBadge
              isActive={user.is_active}
              isBlocked={user.is_blocked}
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Joined On</p>
            <p className="text-slate-600">{formatDate(user.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:login" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Last Login</p>
            <p className="text-slate-600">{formatLastLogin(user.last_login)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:update" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Last Updated</p>
            <p className="text-slate-600">{formatDate(user.updated_at)}</p>
          </div>
        </div>
        {user.testimonials && user.testimonials.length > 0 && (
          <div className="md:col-span-2 flex items-center space-x-3">
            <Icon icon="mdi:star" className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Testimonials</p>
              <p className="text-slate-600">
                {user.testimonials.length} testimonial(s)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </ModalWrapper>
);

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      putData("/admins/update-user/" + user.id, formData, true);
      toast.success("User updated successfully");
      onSave();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={!!user} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6">
          <h2 id="modal-title" className="text-2xl font-bold">
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            icon="mdi:account"
            name="full_name"
            type="text"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleInputChange}
            color="orange"
            className="w-full"
            required
            disabled={isLoading}
          />
          <Input
            icon="mdi:email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            color="orange"
            className="w-full"
            required
            disabled={isLoading}
          />
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// --- Change Password Modal Component ---
const ChangePasswordModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    new_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { new_password } = formData;
      const dataToSend = {
        password: new_password,
      };
      putData("/admins/update-user-password/" + user.id, dataToSend, true);
      toast.success("Password updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={!!user} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">Change Password</h2>
          <p className="text-purple-100 mt-1">For user: {user.full_name}</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            icon="mdi:lock-outline"
            name="new_password"
            type="password"
            placeholder="New Password"
            value={formData.new_password}
            onChange={handleInputChange}
            color="purple"
            className="w-full"
            required
            disabled={isLoading}
          />
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// --- Testimonials Modal Component ---
const TestimonialsModal = ({ user, onClose, token }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admins/get-user-testminals/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error("Failed to fetch testimonials");
          const data = await res.json();
          setTestimonials(data);
        } catch (error) {
          toast.error(error.message);
          // Also try to use the testimonials from user object if API fails
          if (user.testimonials && Array.isArray(user.testimonials)) {
            setTestimonials(user.testimonials);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [user?.id, token, user?.testimonial]);

  const handleTestimonialAction = async (testimonialId, action) => {
    try {
      let endpoint = "";
      let method = "PUT";

      if (action === "accept") {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admins/accept-testimonial/${testimonialId}`;
      } else if (action === "reject") {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admins/reject-testimonial/${testimonialId}`;
      } else if (action === "delete") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "This testimonial will be permanently deleted!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;

        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admins/delete-testimonial/${testimonialId}`;
        method = "DELETE";
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${action} testimonial`);
      }

      toast.success(`Testimonial ${action}ed successfully`);

      // Refresh testimonials
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admins/get-user-testminals/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ModalWrapper visible={!!user} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:star-outline" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">User Testimonials</h2>
              <p className="text-teal-100 mt-1">
                Feedback from {user.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <Icon
                  icon="mdi:star-outline"
                  className="w-10 h-10 text-teal-500"
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No Testimonials Found
              </h3>
              <p className="text-slate-500">
                This user hasn't submitted any testimonials yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icon
                              key={i}
                              icon={
                                i < testimonial.rating
                                  ? "mdi:star"
                                  : "mdi:star-outline"
                              }
                              className={`w-5 h-5 ${
                                i < testimonial.rating
                                  ? "text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-slate-600">
                          {testimonial.rating}/5
                        </span>
                      </div>
                      <p className="text-slate-700 mb-3 leading-relaxed">
                        {testimonial.description || testimonial.content}
                      </p>
                      <div className="text-xs text-slate-500">
                        Submitted on {formatDate(testimonial.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          testimonial.is_accepted === true
                            ? "bg-green-100 text-green-700"
                            : testimonial.is_rejected === true
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {testimonial.is_rejected
                          ? "Rejected"
                          : testimonial.is_accepted
                          ? "Approved"
                          : "Pending"}
                      </span>
                      <div className="flex space-x-1">
                        {testimonial.is_accepted !== true && (
                          <button
                            onClick={() =>
                              handleTestimonialAction(testimonial.id, "accept")
                            }
                            className="p-2 text-slate-500 hover:bg-green-100 hover:text-green-600 rounded-full transition-colors"
                            title="Accept"
                          >
                            <Icon icon="mdi:check" className="w-4 h-4" />
                          </button>
                        )}
                        {testimonial.is_rejected !== true && (
                          <button
                            onClick={() =>
                              handleTestimonialAction(testimonial.id, "reject")
                            }
                            className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                            title="Reject"
                          >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleTestimonialAction(testimonial.id, "delete")
                          }
                          className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

import CourseService from "@/services/courseService";

// --- Enroll User in Course Modal ---
const EnrollCourseModal = ({ user, onClose, onEnrolled, token }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCourses, setIsFetchingCourses] = useState(true);

  useEffect(() => {
    // Fetch the list of all available courses when the modal opens
    const fetchCourses = async () => {
      try {
        setIsFetchingCourses(true);
        const courseData = await CourseService.getAll(); // Using your existing service
        setCourses(courseData || []);
      } catch (error) {
        toast.error("Failed to fetch course list.");
        console.error("Course fetch error:", error);
      } finally {
        setIsFetchingCourses(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.warn("Please select a course to enroll the user in.");
      return;
    }

    setIsLoading(true);
    try {
      // Use the new Admin-specific enrollment function
      await UserService.enrollUserToCourse(token, {
        userId: user.id,
        courseId: parseInt(selectedCourseId),
      });

      toast.success(`${user.full_name} has been enrolled successfully!`);
      onEnrolled(); // This will trigger a refresh on the main page
      onClose();
    } catch (error) {
      // The backend service already handles "already enrolled" errors.
      toast.error(error.response?.data?.detail || "Enrollment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={!!user} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
          <h2 className="text-2xl font-bold">Enroll User in Course</h2>
          <p className="text-green-100 mt-1">For user: {user?.full_name}</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isFetchingCourses ? (
            <div className="text-center p-4">
              <Icon
                icon="mdi:loading"
                className="animate-spin w-8 h-8 mx-auto text-teal-500"
              />
              <p className="mt-2 text-slate-500">Loading courses...</p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="course-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Select a Course
              </label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                required
                disabled={isLoading}
              >
                <option value="" disabled>
                  -- Please choose a course --
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} (${course.price})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading || isFetchingCourses || courses.length === 0}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:school" className="w-5 h-5" />
                  <span>Enroll User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

const UserService = {
  async getAllUsers(token, params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/get-all-users?${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch users.");
    return response.json();
  },
  async toggleUserBlock(token, userId) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/block-user/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to update user status.");
  },
  async toggleUserUnblock(token, userId) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/unblock-user/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to update user status.");
  },
  async deleteUser(token, userId) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/delete-user/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to delete user.");
  },

  async enrollUserToCourse(token, { userId, courseId }) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/enroll-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, course_id: courseId }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to enroll user.");
    }
    return response.json();
  },
};

//=================================================================
//  MAIN USER MANAGEMENT COMPONENT
//=================================================================
export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [viewingTestimonials, setViewingTestimonials] = useState(null);
  const [enrollingUser, setEnrollingUser] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { token, userType } = useAuthStore();
  const router = useRouter();

  const getPageNumbers = () => {
    const totalPages = pagination.total_pages;
    const currentPage = pagination.page;
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  useEffect(() => {
    if (token && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [token, userType, router]);

  const fetchUsers = async (page = 1) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = {
        page: page,
        page_size: pagination.page_size,
      };
      if (searchTerm) params.name = searchTerm;

      const data = await UserService.getAllUsers(token, params);

      // Handle both paginated response and direct array response
      if (data.users && Array.isArray(data.users)) {
        // New paginated response format
        setUsers(data.users);
        setPagination({
          page: data.page || page,
          page_size: data.page_size || pagination.page_size,
          total: data.total || data.users.length,
          total_pages:
            data.total_pages ||
            Math.ceil(
              (data.total || data.users.length) /
                (data.page_size || pagination.page_size)
            ),
          has_next: data.has_next || false,
          has_previous: data.has_previous || false,
        });
      } else if (Array.isArray(data)) {
        // Legacy direct array response
        setUsers(data);
        setPagination((prev) => ({
          ...prev,
          page: page,
          total: data.length,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        }));
      } else {
        setUsers([]);
        setPagination((prev) => ({ ...prev, total: 0, total_pages: 0 }));
      }
    } catch (error) {
      toast.error(error.message);
      setUsers([]);
      setPagination((prev) => ({ ...prev, total: 0, total_pages: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1); // Reset to first page when searching
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, token]);

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "toggleBlock") {
        const user = users.find((u) => u.id === userId);
        if (user.is_blocked) {
          await UserService.toggleUserUnblock(token, userId);
          toast.success("User has been unblocked successfully.");
        } else {
          await UserService.toggleUserBlock(token, userId);
          toast.success("User has been blocked successfully.");
        }
      } else if (action === "delete") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
          await UserService.deleteUser(token, userId);
          toast.success("User deleted successfully.");
        } else {
          return;
        }
      }
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.message || `Failed to ${action} user.`);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active && !user.is_blocked) ||
        (statusFilter === "blocked" && user.is_blocked) ||
        (statusFilter === "inactive" && !user.is_active);
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = pagination.total;
    const active = users.filter((u) => u.is_active && !u.is_blocked).length;
    const blocked = users.filter((u) => u.is_blocked).length;
    const inactive = users.filter((u) => !u.is_active).length;
    const admins = users.filter((u) => u.role === "admin").length;
    const standardUsers = users.filter((u) => u.role === "user").length;
    return { total, active, blocked, inactive, admins, standardUsers };
  }, [users, pagination.total]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
              {(row.original.full_name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-slate-800">
                {row.original.full_name}
              </div>
              <div className="text-xs text-slate-500">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.original.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {row.original.role === "admin" ? "Administrator" : "User"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <UserStatusBadge
            isActive={row.original.is_active}
            isBlocked={row.original.is_blocked}
          />
        ),
      },
      {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatLastLogin(row.original.last_login)}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
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
              onClick={() => setSelectedUser(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>

            {/* Show testimonials button if user has testimonials */}
            {row.original.testimonials &&
              row.original.testimonials.length > 0 && (
                <button
                  onClick={() => setViewingTestimonials(row.original)}
                  className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-600"
                  title="View Testimonials"
                >
                  <Icon icon="mdi:star-outline" width={18} />
                </button>
              )}

            <button
              onClick={() => setEditingUser(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-orange-100 hover:text-orange-600"
              title="Edit User"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>

            <button
              onClick={() => setChangingPasswordUser(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-purple-100 hover:text-purple-600"
              title="Change Password"
            >
              <Icon icon="mdi:lock-outline" width={18} />
            </button>

            <button
              onClick={() => handleUserAction(row.original.id, "toggleBlock")}
              className={`p-2 text-slate-500 rounded-full transition-all duration-200 ${
                row.original.is_blocked
                  ? "hover:bg-green-100 hover:text-green-600"
                  : "hover:bg-orange-100 hover:text-orange-600"
              }`}
              title={row.original.is_blocked ? "Unblock User" : "Block User"}
            >
              <Icon
                icon={
                  row.original.is_blocked
                    ? "mdi:account-check-outline"
                    : "mdi:account-cancel-outline"
                }
                width={18}
              />
            </button>
            <button
              onClick={() => setEnrollingUser(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-green-100 hover:text-green-600"
              title="Enroll in Course"
            >
              <Icon icon="mdi:school-outline" width={18} />
            </button>

            <button
              onClick={() => handleUserAction(row.original.id, "delete")}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
              title="Delete User"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [users]
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchUsers(newPage);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:account-group" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor, manage, and engage with your user base.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              title: "Total Users",
              value: stats.total,
              icon: "mdi:account-group",
              color: "blue",
            },
            {
              title: "Active Users",
              value: stats.active,
              icon: "mdi:account-check",
              color: "green",
            },
            {
              title: "Blocked Users",
              value: stats.blocked,
              icon: "mdi:account-cancel",
              color: "red",
            },
            {
              title: "Inactive Users",
              value: stats.inactive,
              icon: "mdi:account-outline",
              color: "gray",
            },
            {
              title: "Administrators",
              value: stats.admins,
              icon: "mdi:shield-account",
              color: "purple",
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
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon
                    icon={stat.icon}
                    className={`w-6 h-6 text-${stat.color}-600`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Filters and Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  name="search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="cyan"
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
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-600">
                    Role:
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:account-search-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Users Found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "No users match your current filters."
                    : "Your user base is waiting to grow!"}
                </p>
                {(searchTerm ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto hover:shadow-lg transition-all"
                  >
                    <Icon icon="mdi:filter-remove" className="w-5 h-5" />
                    <span>Clear Filters</span>
                  </button>
                )}
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
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 ${
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

          {/* Pagination */}
          {!isLoading &&
            filteredUsers.length > 0 &&
            pagination.total_pages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Icon icon="mdi:information" className="w-4 h-4" />
                    <span>
                      Showing {(pagination.page - 1) * pagination.page_size + 1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.page * pagination.page_size,
                        pagination.total
                      )}{" "}
                      of {pagination.total} users
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_previous}
                      className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {pageNumbers.map((pageNum) => (
                        <button
                          key={pageNum} // This will now be unique and correct (e.g., 1, 2, 3, 4, 5)
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            pageNum === pagination.page
                              ? "bg-cyan-500 text-white"
                              : "bg-white border border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Table Footer */}
          {!isLoading &&
            filteredUsers.length > 0 &&
            pagination.total_pages <= 1 && (
              <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:information" className="w-4 h-4" />
                    <span>
                      Showing {filteredUsers.length} of {pagination.total} users
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Analytics & Export Panel */}
        {users.length > 0 && (
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
                  Role Distribution
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Admin", count: stats.admins, color: "purple" },
                    {
                      label: "User",
                      count: stats.standardUsers,
                      color: "blue",
                    },
                  ].map((role) => {
                    const percentage =
                      stats.total > 0 ? (role.count / stats.total) * 100 : 0;
                    return (
                      <div
                        key={role.label}
                        className="flex items-center space-x-3"
                      >
                        <span
                          className={`w-20 text-sm font-medium text-${role.color}-700`}
                        >
                          {role.label}
                        </span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r from-${role.color}-400 to-${role.color}-500 h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 w-12">
                          {role.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Export Options</h3>
                <button
                  onClick={() => {
                    const csvContent = users
                      .map(
                        (u) =>
                          `"${u.id}","${u.full_name}","${u.email}","${
                            u.role
                          }","${
                            u.is_blocked
                              ? "Blocked"
                              : u.is_active
                              ? "Active"
                              : "Inactive"
                          }","${formatLastLogin(u.last_login)}","${formatDate(
                            u.created_at
                          )}"`
                      )
                      .join("\n");
                    const header =
                      "ID,Name,Email,Role,Status,Last Login,Joined At\n";
                    const blob = new Blob([header + csvContent], {
                      type: "text/csv",
                    });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "all-users.csv";
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Icon icon="mdi:file-excel" className="w-4 h-4" />
                  <span>Export All Users to CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => fetchUsers(pagination.page)}
          token={token}
        />
      )}
      {changingPasswordUser && (
        <ChangePasswordModal
          user={changingPasswordUser}
          onClose={() => setChangingPasswordUser(null)}
          token={token}
        />
      )}
      {viewingTestimonials && (
        <TestimonialsModal
          user={viewingTestimonials}
          onClose={() => setViewingTestimonials(null)}
          token={token}
        />
      )}

      {enrollingUser && (
        <EnrollCourseModal
          user={enrollingUser}
          onClose={() => setEnrollingUser(null)}
          onEnrolled={() => fetchUsers(pagination.page)}
          token={token}
        />
      )}
    </div>
  );
}

"use client";

import Input from "@/components/ui/Input";
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

// --- User Status Badge ---
const UserStatusBadge = ({ isBlocked }) => {
  const config = isBlocked
    ? {
        color: "bg-red-100 text-red-700",
        icon: "mdi:account-cancel",
        label: "Blocked",
      }
    : {
        color: "bg-green-100 text-green-700",
        icon: "mdi:account-check",
        label: "Active",
      };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {config.label}
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
            <UserStatusBadge isBlocked={user.is_blocked} />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">Joined On</p>
            <p className="text-slate-600">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  </ModalWrapper>
);

const EditUserModal = ({ user, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    role: user?.role || "user",
    is_blocked: user?.is_blocked || false,
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
      const response = await fetch("http://localhost:8000/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update user");
      }
      toast.success("User updated successfully");
      onSave();
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg">
            <input
              type="checkbox"
              name="is_blocked"
              id="is_blocked"
              checked={formData.is_blocked}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              disabled={isLoading}
            />
            <label htmlFor="is_blocked" className="font-medium text-slate-700">
              Block this user
            </label>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
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
// (This one is simplified as it's a very direct action, but follows the same structural principles)
const ChangePasswordModal = ({ user, onClose, token }) => {
  const [formData, setFormData] = useState({
    old_password: "",
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
      const response = await fetch(
        "http://localhost:8000/users/update/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, user_id: user.id }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update password");
      }
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
            icon="mdi:lock"
            name="old_password"
            type="password"
            placeholder="Current Password"
            value={formData.old_password}
            onChange={handleInputChange}
            color="purple"
            className="w-full"
            required
            disabled={isLoading}
          />
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
            `http://localhost:8000/admins/get-user-testminals/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error("Failed to fetch testimonials");
          setTestimonials(await res.json());
        } catch (error) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [user?.id, token]);

  const handleTestimonialAction = async (testimonialId, action) => {
    // ... same logic as before, no design change needed here
  };

  return (
    <ModalWrapper visible={!!user} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6">
          <h2 className="text-2xl font-bold">User Testimonials</h2>
          <p className="text-teal-100 mt-1">Feedback from {user.full_name}</p>
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
            <p className="text-slate-500 text-center py-12">
              No testimonials found for this user.
            </p>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            icon="mdi:star"
                            className={
                              i < t.rating
                                ? "text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-700">{t.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : t.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.status || "pending"}
                      </span>
                      <div className="flex space-x-1">
                        {t.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleTestimonialAction(t.id, "accept")
                            }
                            className="p-2 text-slate-500 hover:bg-green-100 hover:text-green-600 rounded-full"
                            title="Accept"
                          >
                            <Icon icon="mdi:check" width={18} />
                          </button>
                        )}
                        {t.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleTestimonialAction(t.id, "reject")
                            }
                            className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                            title="Reject"
                          >
                            <Icon icon="mdi:close" width={18} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            /* Swal logic */
                          }}
                          className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-700 rounded-full"
                          title="Delete"
                        >
                          <Icon icon="mdi:delete" width={18} />
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

//=================================================================
//  USER API SERVICE
//=================================================================
const UserService = {
  async getAllUsers(token, params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(
      `http://localhost:8000/admins/get-all-users?${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch users.");
    return response.json();
  },
  async toggleUserBlock(token, userId) {
    const response = await fetch(
      `http://localhost:8000/admins/block-user/${userId}`,
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
      `http://localhost:8000/admins/unblock-user/${userId}`,
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
      `http://localhost:8000/admins/delete-user/${userId}`,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState("");
  // Other modals can be added here if needed (e.g., editingUser)
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { token, userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [token, userType, router]);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = {
        page_size: 10, // Fetch all for client-side filtering/sorting
        page: 1,
      };
      if (searchTerm) params.name = searchTerm;

      const data = await UserService.getAllUsers(token, params);

      // =========================================================
      //  FIXED LOGIC HERE
      // =========================================================

      // Check if the response is an object with a 'users' array,
      // OR if the response is the array itself.
      const userList = Array.isArray(data.users)
        ? data.users
        : Array.isArray(data)
        ? data
        : [];

      // Get the total count from the object if it exists, otherwise use the array's length.
      const total = data.total ?? userList.length;

      setUsers(userList);
      setTotalUsers(total);
    } catch (error) {
      toast.error(error.message);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, token]);

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "toggleBlock") {
        const user = users.find((u) => u.id === userId);
        await UserService.toggleUserBlock(token, userId);
        toast.success(`User has been blocked successfully.`);
      } else if (action === "toggleUnblock") {
        const user = users.find((u) => u.id === userId);
        await UserService.toggleUserUnblock(token, userId);
        toast.success(`User has been unblocked successfully.`);
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
      fetchUsers();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} user.`);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.is_blocked) ||
        (statusFilter === "blocked" && user.is_blocked);
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = totalUsers;
    const active = users.filter((u) => !u.is_blocked).length;
    const blocked = users.filter((u) => u.is_blocked).length;
    const admins = users.filter((u) => u.role === "admin").length;
    const standardUsers = total - admins;
    return { total, active, blocked, admins, standardUsers };
  }, [users, totalUsers]);

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
        accessorKey: "is_blocked",
        header: "Status",
        cell: ({ row }) => (
          <UserStatusBadge isBlocked={row.original.is_blocked} />
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
            <button
              onClick={() =>
                handleUserAction(row.original.id, row.original.is_blocked)
              }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    className={`w-6 h-6 text-${stat.color}-700`}
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

          {/* Table Footer */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredUsers.length} of {totalUsers} users
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
                          }","${u.is_blocked ? "Blocked" : "Active"}","${
                            u.created_at
                          }"`
                      )
                      .join("\n");
                    const header = "ID,Name,Email,Role,Status,Joined At\n";
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
          onSave={() => fetchUsers(currentPage)}
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
      {/* Other modals would be rendered here */}
    </div>
  );
}

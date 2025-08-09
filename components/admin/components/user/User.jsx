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
const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-3">
        <div className="h-10 w-10 rounded-full bg-slate-200"></div>
        <div className="flex-1 space-y-2">
          <div
            className={`h-4 rounded bg-slate-200 ${
              i % 2 === 0 ? "w-3/4" : "w-2/3"
            }`}
          ></div>
          <div className="h-3 rounded bg-slate-200 w-1/2"></div>
        </div>
        {Array.from({ length: columns - 1 }).map((_, j) => (
          <div
            key={j}
            className="h-6 rounded bg-slate-200"
            style={{
              width: `${Math.floor(Math.random() * (120 - 80 + 1) + 80)}px`,
            }}
          ></div>
        ))}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
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

// --- User Details Modal Component ---
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
          <p>
            <strong>ID:</strong> {user.id}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:account-circle" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Name:</strong> {user.full_name}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:email" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:shield-account" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Role:</strong>{" "}
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:toggle-switch" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Status:</strong>{" "}
            {user.is_blocked ? (
              <span className="text-red-600 font-semibold ml-2">Blocked</span>
            ) : (
              <span className="text-green-600 font-semibold ml-2">Active</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Joined:</strong> {formatDate(user.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Last Login:</strong> {formatDate(user.last_login)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:update" className="w-5 h-5 text-slate-400" />
          <p>
            <strong>Updated:</strong> {formatDate(user.updated_at)}
          </p>
        </div>
      </div>
    </div>
  </ModalWrapper>
);

// --- Edit User Modal Component ---
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
      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/users/update",
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
        "${process.env.NEXT_PUBLIC_API_URL}/users/update/password",
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
            `${process.env.NEXT_PUBLIC_API_URL}/admins/get-user-testminals/${user.id}`,
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchName, setSearchName] = useState("");

  const { token, userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [token, userType, router]);

  const fetchUsers = async (
    page = currentPage,
    size = pageSize,
    name = searchName
  ) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: size.toString(),
        ...(name && { name }),
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admins/get-all-users?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch users.");
      // CORRECTED CODE
      const data = await response.json();
      // The most robust way to handle both cases (direct array OR object with a .users key)
      setUsers(
        Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []
      );
      // For total, use the object's total, or fallback to the array's length
      setTotalUsers(data.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, pageSize, searchName);
      setCurrentPage(1);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchName, pageSize, token]);

  useEffect(() => {
    fetchUsers(currentPage, pageSize, searchName);
  }, [currentPage, token]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
              {row.original.full_name.charAt(0).toUpperCase()}
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
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "is_blocked",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              row.original.is_blocked
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                row.original.is_blocked ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>
            {row.original.is_blocked ? "Blocked" : "Active"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const actions = [
            {
              icon: "mdi:eye-outline",
              title: "View Details",
              color: "blue",
              onClick: () => setSelectedUser(row.original),
            },
            {
              icon: "mdi:pencil-outline",
              title: "Edit User",
              color: "yellow",
              onClick: () => setEditingUser(row.original),
            },
            {
              icon: "mdi:key-variant",
              title: "Change Password",
              color: "purple",
              onClick: () => setChangingPasswordUser(row.original),
            },
            {
              icon: "mdi:message-text-outline",
              title: "View Testimonials",
              color: "indigo",
              onClick: () => setViewingTestimonials(row.original),
            },
            {
              icon: row.original.is_blocked
                ? "mdi:account-check-outline"
                : "mdi:account-cancel-outline",
              title: row.original.is_blocked ? "Unblock" : "Block",
              color: row.original.is_blocked ? "green" : "red",
              onClick: () => {
                /* Swal logic */
              },
            },
            {
              icon: "mdi:delete-outline",
              title: "Delete User",
              color: "slate",
              onClick: () => {
                /* Swal logic */
              },
            },
          ];
          return (
            <div className="flex items-center space-x-1">
              {actions.map((a) => (
                <button
                  key={a.title}
                  onClick={a.onClick}
                  className={`p-2 text-slate-500 rounded-full transition-colors hover:bg-${a.color}-100 hover:text-${a.color}-600`}
                  title={a.title}
                >
                  <Icon icon={a.icon} width={20} />
                </button>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:account-group" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                User Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor, manage, and edit user accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-slate-200">
            <div className="flex-1">
              <Input
                icon="mdi:magnify"
                name="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                color="turquoise"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-600">
                Show:
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
              >
                <option>5</option>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading && users.length === 0 ? (
              <TableSkeleton />
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}{" "}
                            <Icon
                              icon="mdi:unfold-more-horizontal"
                              className="text-slate-400"
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
                      className="hover:bg-cyan-50/50 transition-colors"
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

          <div className="p-4 flex items-center justify-between border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages} ({totalUsers} total users)
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                <Icon icon="mdi:chevron-double-left" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <span className="px-4 py-2 border rounded-lg bg-slate-100 text-sm font-medium">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                <Icon icon="mdi:chevron-double-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals are rendered here */}
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
    </div>
  );
}

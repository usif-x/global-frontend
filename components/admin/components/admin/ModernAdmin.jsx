"use client";

import Input from "@/components/ui/Input";
import AdminService from "@/services/adminService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Enhanced Loading Spinner with Admin Theme
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
    </div>
  </div>
);

// Enhanced Table Skeleton with Admin Colors
const TableSkeleton = ({ rows = 5 }) => (
  <div className="p-4 space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200"></div>
          <div className="flex-1 space-y-3">
            <div className={`h-4 rounded bg-slate-200 ${i % 2 === 0 ? "w-3/4" : "w-2/3"}`}></div>
            <div className="h-3 rounded bg-slate-200 w-1/2"></div>
            <div className="flex space-x-2 pt-2">
              <div className="h-8 w-8 rounded-full bg-slate-200"></div>
              <div className="h-8 w-8 rounded-full bg-slate-200"></div>
              <div className="h-8 w-8 rounded-full bg-slate-200"></div>
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
    return new Date(dateString.replace(" ", "T")).toLocaleDateString("en-US", {
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

// Enhanced Modal Wrapper
const ModalWrapper = ({ children, onClose, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          ​
        </span>
        {children}
      </div>
    </div>
  );
};

// Admin Level Badge Component
const AdminLevelBadge = ({ level }) => {
  const getLevelConfig = (level) => {
    switch (level) {
      case 2:
        return {
          label: "Super Admin",
          color: "from-red-500 to-pink-600",
          bg: "bg-red-100",
          text: "text-red-700",
          icon: "mdi:crown",
        };
      case 1:
      default:
        return {
          label: "Senior Admin",
          color: "from-purple-500 to-indigo-600",
          bg: "bg-purple-100",
          text: "text-purple-700",
          icon: "mdi:shield-star",
        };
    }
  };

  const config = getLevelConfig(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Admin Details Modal Component
const CreateAdminModal = ({ onClose, onSave, visible }) => {
  // --- CHANGE 1: Initialize admin_level with an empty string ---
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    admin_level: "", // Changed from null to ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // --- CHANGE 2: Update the change handler ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Specifically handle the admin_level to ensure it's a number
    if (name === "admin_level") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10), // Always parse admin_level to an integer
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional: Add validation to ensure an admin level was selected
    if (!formData.admin_level) {
      toast.error("Please select an admin level.");
      return;
    }

    setIsLoading(true);
    try {
      await AdminService.registerAdmin(formData);
      console.log("Submitting form data:", formData); // For debugging
      toast.success("Admin created successfully");
      onSave();
      onClose();
      // --- CHANGE 3: Reset state with an empty string for consistency ---
      setFormData({
        full_name: "",
        username: "",
        email: "",
        password: "",
        admin_level: "", // Changed from null to ""
      });
    } catch (error) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:account-plus" className="w-7 h-7" />
            <h2 id="modal-title" className="text-2xl font-bold">
              Create New Admin
            </h2>
          </div>
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
            color="emerald"
            className="w-full"
            required
            disabled={isLoading}
          />
          <Input
            icon="mdi:account-circle"
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            color="emerald"
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
            color="emerald"
            className="w-full"
            required
            disabled={isLoading}
          />
          <Input
            icon="mdi:lock"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            color="emerald"
            className="w-full"
            required
            disabled={isLoading}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Admin Level</label>
            <select
              name="admin_level"
              value={formData.admin_level} // This will now correctly be "" initially
              onChange={handleInputChange}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isLoading}
              required // Add required to the select itself
            >
              {/* --- CHANGE 4: Add a disabled placeholder option --- */}
              <option value="" disabled>
                Select an admin level...
              </option>
              <option value={1}>Senior Admin (Level 1)</option>
              <option value={2}>Super Admin (Level 2 Full)</option>
            </select>
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
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:account-plus" className="w-5 h-5" />
                  <span>Create Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// Edit Admin Modal Component
const EditAdminModal = ({ admin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: admin?.full_name || "",
    username: admin?.username || "",
    email: admin?.email || "",
    admin_level: admin?.admin_level || 3,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AdminService.updateAdminById(admin.id, formData);
      toast.success("Admin updated successfully");
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={!!admin} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:pencil" className="w-7 h-7" />
            <h2 id="modal-title" className="text-2xl font-bold">
              Edit Administrator
            </h2>
          </div>
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
            icon="mdi:account-circle"
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
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
            <label className="block text-sm font-medium text-slate-700">Admin Level</label>
            <select
              name="admin_level"
              value={formData.admin_level}
              onChange={handleInputChange}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
            >
              <option value={1}>Senior Admin (Level 1)</option>
              <option value={2}>Super Admin (Level 2 Full)</option>
            </select>
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
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ admin, onClose }) => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await AdminService.updateAdminPasswordById(admin.id, {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      toast.success("Password updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper visible={!!admin} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:key-variant" className="w-7 h-7" />
            <div>
              <h2 className="text-2xl font-bold">Change Password</h2>
              <p className="text-rose-100 mt-1">For admin: {admin.full_name}</p>
            </div>
          </div>
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
            color="pink"
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
            color="pink"
            className="w-full"
            required
            disabled={isLoading}
          />
          <Input
            icon="mdi:lock-check"
            name="confirm_password"
            type="password"
            placeholder="Confirm New Password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            color="pink"
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
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-70 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:key-variant" className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// Note: Other modals (Create, Edit, ChangePassword) from the provided code can be used here.
// They already follow a good design pattern. For brevity, I'm omitting their code here but assuming they are present.
// The provided modal components are already excellent and will be used as-is.

//=================================================================
//  MAIN ADMIN MANAGEMENT COMPONENT
//=================================================================
export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { token, admin } = useAuthStore();
  const router = useRouter();

  // Check super admin access
  useEffect(() => {
    if (token && admin.admin_level !== 2) {
      toast.error("Access Denied. Super Admins only.");
      router.push("/admin");
    }
  }, [token, router, admin]);

  // Fetch admins
  const fetchAdmins = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await AdminService.getAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch admins");
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  // Handle admin deletion with SweetAlert2
  const handleDeleteAdmin = async (adminId, adminName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete admin "${adminName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AdminService.deleteAdmin(adminId);
          toast.success("Admin deleted successfully");
          fetchAdmins();
        } catch (error) {
          toast.error(error.message || "Failed to delete admin");
        }
      }
    });
  };

  // Filter admins based on search
  const filteredAdmins = useMemo(() => {
    if (!searchTerm) return admins;
    const lowercasedTerm = searchTerm.toLowerCase();
    return admins.filter(
      (admin) =>
        admin.full_name?.toLowerCase().includes(lowercasedTerm) ||
        admin.username?.toLowerCase().includes(lowercasedTerm) ||
        admin.email?.toLowerCase().includes(lowercasedTerm),
    );
  }, [admins, searchTerm]);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.is_active).length;
    const superAdmins = admins.filter((a) => a.admin_level === 2).length;
    const seniorAdmins = admins.filter((a) => a.admin_level === 1).length;
    return { total, active, superAdmins, seniorAdmins };
  }, [admins]);

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "Administrator",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {row.original.full_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{row.original.full_name}</div>
              <div className="text-xs text-slate-500">@{row.original.username}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "admin_level",
        header: "Level",
        cell: ({ row }) => <AdminLevelBadge level={row.original.admin_level} />,
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => <div className="text-sm text-slate-600">{row.original.email}</div>,
      },
      {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ row }) => <div className="text-sm text-slate-600">{formatDate(row.original.last_login)}</div>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setSelectedAdmin(row.original)}
                className={`p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-blue-100 hover:text-blue-600`}
                title="View Details"
              >
                <Icon icon="mdi:eye-outline" width={20} />
              </button>
              <button
                onClick={() => setEditingAdmin(row.original)}
                className={`p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-600`}
                title="Edit Admin"
              >
                <Icon icon="mdi:pencil-outline" width={20} />
              </button>
              <button
                onClick={() => setChangingPasswordAdmin(row.original)}
                className={`p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-purple-100 hover:text-purple-600`}
                title="Change Password"
              >
                <Icon icon="mdi:key-variant" width={20} />
              </button>
              <button
                onClick={() => handleDeleteAdmin(row.original.id, row.original.full_name)}
                className={`p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600`}
                title="Delete Admin"
              >
                <Icon icon="mdi:delete-outline" width={20} />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredAdmins,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:shield-crown" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Administrator Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage system administrators and their permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Icon icon="mdi:account-plus" className="w-5 h-5" />
              <span>Add New Admin</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Admins",
              value: stats.total,
              icon: "mdi:account-group",
              color: "blue",
            },
            {
              title: "Active Admins",
              value: stats.active,
              icon: "mdi:account-check",
              color: "green",
            },
            {
              title: "Super Admins",
              value: stats.superAdmins,
              icon: "mdi:crown",
              color: "red",
            },
            {
              title: "Senior Admins",
              value: stats.seniorAdmins,
              icon: "mdi:shield-star",
              color: "purple",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon icon={stat.icon} className={`w-6 h-6 text-${stat.color}-700`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50">
            <div className="flex-1 max-w-lg">
              <Input
                icon="mdi:magnify"
                name="search"
                type="text"
                placeholder="Search admins by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                color="purple"
                className="w-full"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredAdmins.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account-search-outline" className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Admins Found</h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm ? "No admins match your search criteria." : "No administrators have been created yet."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto hover:shadow-lg transition-all"
                  >
                    <Icon icon="mdi:account-plus" className="w-5 h-5" />
                    <span>Create First Admin</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none hover:bg-indigo-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                      className={`hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {!isLoading && filteredAdmins.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredAdmins.length} of {admins.length} administrators
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateAdminModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={fetchAdmins} />

      {selectedAdmin && <AdminDetailsModal admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />}

      {editingAdmin && (
        <EditAdminModal admin={editingAdmin} onClose={() => setEditingAdmin(null)} onSave={fetchAdmins} />
      )}

      {changingPasswordAdmin && (
        <ChangePasswordModal admin={changingPasswordAdmin} onClose={() => setChangingPasswordAdmin(null)} />
      )}
    </div>
  );
}

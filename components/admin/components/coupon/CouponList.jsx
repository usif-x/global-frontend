"use client";
import Input from "@/components/ui/Input";
import CouponService from "@/services/couponService";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Table Skeleton Loader
const TableSkeleton = () => (
  <div className="animate-pulse p-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 py-4 border-b border-slate-200"
      >
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "No expiration";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to check if coupon is expired
const isExpired = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

//=================================================================
//  MAIN COUPON LIST COMPONENT
//=================================================================
const CouponList = ({ onAdd, onEdit }) => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await CouponService.getAll();
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await CouponService.getUsageStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching coupon statistics:", error);
    }
  };

  const handleDelete = async (coupon) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete coupon "${coupon.code}"? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await CouponService.delete(coupon.id);
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
        fetchStats();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("Failed to delete coupon");
      }
    }
  };

  const filteredCoupons = useMemo(() => {
    let filtered = coupons;

    // Apply type filter
    if (filterType === "active") {
      filtered = filtered.filter(
        (c) => c.is_active && !isExpired(c.expire_date)
      );
    } else if (filterType === "inactive") {
      filtered = filtered.filter((c) => !c.is_active);
    } else if (filterType === "expired") {
      filtered = filtered.filter((c) => isExpired(c.expire_date));
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code?.toLowerCase().includes(search) ||
          c.activity?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [coupons, searchTerm, filterType]);

  const statsData = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(
      (c) => c.is_active && !isExpired(c.expire_date)
    ).length;
    const totalUsage = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
    const avgDiscount =
      coupons.length > 0
        ? (
            coupons.reduce((sum, c) => sum + (c.discount_percentage || 0), 0) /
            coupons.length
          ).toFixed(1)
        : 0;
    return { total, active, totalUsage, avgDiscount };
  }, [coupons]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Coupon Code",
        cell: ({ row }) => {
          const expired = isExpired(row.original.expire_date);
          const usagePercentage =
            (row.original.used_count / row.original.can_used_up_to) * 100 || 0;

          const getStatusColor = () => {
            if (!row.original.is_active) return "bg-slate-500";
            if (expired) return "bg-red-500";
            if (row.original.remaining <= 0) return "bg-orange-500";
            if (usagePercentage > 80) return "bg-yellow-500";
            return "bg-green-500";
          };

          const getActivityIcon = () => {
            switch (row.original.activity) {
              case "trip":
                return "mdi:airplane";
              case "course":
                return "mdi:school";
              default:
                return "mdi:star-circle";
            }
          };

          return (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                <Icon icon={getActivityIcon()} className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-800 tracking-wider">
                  {row.original.code}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} text-white`}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    {!row.original.is_active
                      ? "Inactive"
                      : expired
                      ? "Expired"
                      : row.original.remaining <= 0
                      ? "Used Up"
                      : usagePercentage > 80
                      ? "Low"
                      : "Active"}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {row.original.activity === "all"
                      ? "All"
                      : row.original.activity}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "discount_percentage",
        header: "Discount",
        cell: ({ row }) => (
          <div className="text-center">
            <div className="text-2xl font-black text-cyan-600">
              {row.original.discount_percentage}%
            </div>
            <div className="text-xs text-slate-500">OFF</div>
          </div>
        ),
      },
      {
        accessorKey: "usage",
        header: "Usage",
        cell: ({ row }) => {
          const usagePercentage =
            (row.original.used_count / row.original.can_used_up_to) * 100 || 0;
          return (
            <div className="min-w-[120px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">
                  {row.original.used_count} / {row.original.can_used_up_to}
                </span>
                <span className="text-xs text-slate-500">
                  {row.original.remaining} left
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${
                    usagePercentage > 80
                      ? "bg-gradient-to-r from-orange-500 to-red-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-600"
                  } transition-all duration-300`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "expire_date",
        header: "Expires",
        cell: ({ row }) => {
          const expired = isExpired(row.original.expire_date);
          return (
            <div className="text-sm">
              <div
                className={`font-medium ${
                  expired ? "text-red-600" : "text-slate-800"
                }`}
              >
                {formatDate(row.original.expire_date)}
              </div>
              {expired && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                  <Icon icon="mdi:alert-circle" className="w-3 h-3" />
                  Expired
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-orange-100 hover:text-orange-600"
              title="Edit Coupon"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
              title="Delete Coupon"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: filteredCoupons,
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
              <Icon icon="mdi:ticket-percent" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Coupon Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Create and manage discount coupons.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Coupons",
              value: statsData.total,
              icon: "mdi:ticket-percent",
              color: "cyan",
            },
            {
              title: "Active Coupons",
              value: statsData.active,
              icon: "mdi:check-circle",
              color: "green",
            },
            {
              title: "Total Uses",
              value: statsData.totalUsage,
              icon: "mdi:counter",
              color: "blue",
            },
            {
              title: "Avg Discount",
              value: `${statsData.avgDiscount}%`,
              icon: "mdi:percent",
              color: "orange",
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
                  placeholder="Search coupons by code or activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="cyan"
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="all">All Coupons</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
                <button
                  onClick={onAdd}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredCoupons.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:ticket-percent"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Coupons Found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || filterType !== "all"
                    ? "No coupons match your search criteria."
                    : "Create your first coupon to get started!"}
                </p>
                {(searchTerm || filterType !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
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
                        <td key={cell.id} className="px-6 py-4 text-sm">
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
          {!isLoading && filteredCoupons.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredCoupons.length} of {coupons.length} coupons
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponList;

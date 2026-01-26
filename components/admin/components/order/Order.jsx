"use client";
import Input from "@/components/ui/Input";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import OrderService from "../../../../services/orderService";

//=================================================================
//  HELPER & UI COMPONENTS (Copied from Invoices for consistency)
//=================================================================

const TableSkeleton = ({ rows = 5, cols = 7 }) => (
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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch (error) {
    return `${(amount || 0).toFixed(2)} EGP`;
  }
};

const StatusBadge = ({ status }) => {
  const safeStatus = (status || "pending").toLowerCase();
  const statusConfig = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "mdi:clock-outline",
    },
    paid: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "mdi:check-circle",
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "mdi:close-circle",
    },
  };
  const config = statusConfig[safeStatus] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

//=================================================================
//  MAIN ORDER MANAGEMENT COMPONENT
//=================================================================

const OrderManagement = () => {
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    activity: "",
    status: "",
    picked_up: null,
    user_id: "",
    buyer_email: "",
    invoice_type: "",
  });
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ count: 0, total_amount: 0 });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const nonEmptyFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      const response = await OrderService.filterOrders(nonEmptyFilters);
      setOrders(response.invoices || []);
      setSummary({
        count: response.count || 0,
        total_amount: response.total_amount || 0,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders. Please check your filters.");
      setOrders([]);
      setSummary({ count: 0, total_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      activity: "",
      status: "",
      picked_up: null,
      user_id: "",
      buyer_email: "",
      invoice_type: "",
    });
    // Refetch with empty filters after clearing
    setTimeout(handleSearch, 0);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            #{row.original.customer_reference}
          </span>
        ),
      },
      {
        accessorKey: "buyer_name",
        header: "Buyer",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-800">
              {row.original.buyer_name}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.buyer_email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "activity_name",
        header: "Activity",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {row.original.activity}
          </span>
        ),
      },
      {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "invoice_type",
        header: "Payment Type",
        cell: ({ row }) => {
          const invoiceType = row.original.invoice_type || "online";
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                invoiceType === "online"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <Icon
                icon={
                  invoiceType === "online"
                    ? "mdi:credit-card-outline"
                    : "mdi:cash"
                }
                className="w-3 h-3"
              />
              {invoiceType === "online" ? "Online" : "Cash"}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        accessorKey: "picked_up",
        header: "Picked Up",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Icon
              icon={
                row.original.picked_up ? "mdi:check-circle" : "mdi:close-circle"
              }
              className={`w-6 h-6 ${
                row.original.picked_up ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className=" min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:receipt-text-check-outline" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Filter, search, and manage all orders.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input
              placeholder="Start Date"
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
            <Input
              placeholder="End Date"
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Activity Type
              </label>
              <select
                name="activity"
                value={filters.activity}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All</option>
                <option value="trip">Trip</option>
                <option value="course">Course</option>
                <option value="package">Package</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Payment Type
              </label>
              <select
                name="invoice_type"
                value={filters.invoice_type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <Input
              label="User ID"
              type="number"
              name="user_id"
              placeholder="e.g., 12"
              value={filters.user_id}
              onChange={handleFilterChange}
            />
            <Input
              label="Buyer Email"
              type="text"
              name="buyer_email"
              placeholder="john.doe@example.com"
              value={filters.buyer_email}
              onChange={handleFilterChange}
            />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Picked Up?
              </label>
              <select
                name="picked_up"
                value={
                  filters.picked_up === null ? "" : String(filters.picked_up)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    picked_up: value === "" ? null : value === "true",
                  }));
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="col-span-full flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-slate-200">
            <button
              onClick={clearFilters}
              className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-300 flex items-center"
            >
              <Icon icon="mdi:search" className="w-5 h-5 mr-2" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Summary & Results */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-cyan-50">
            <h2 className="text-lg font-semibold text-slate-700">
              Results ({summary.count} orders)
            </h2>
            <div className="text-right">
              <p className="text-slate-500 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.total_amount)}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton />
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:file-search-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Orders Found
                </h3>
                <p className="text-slate-500">
                  No orders match your current filters.
                </p>
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
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

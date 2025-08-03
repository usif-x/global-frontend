"use client";

import Input from "@/components/ui/Input";
import InvoiceService from "@/services/invoiceServices";
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
//  HELPER & UI COMPONENTS (Adapted from InvoicesTab & UserManagement)
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
const TableSkeleton = ({ rows = 5, cols = 6 }) => (
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

// --- Format Currency Helper ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// --- Get Display Info Helpers ---
const getInvoiceForDisplay = (invoiceFor) => {
  const types = {
    course: { name: "Course", icon: "mdi:school", color: "text-blue-600" },
    trip: { name: "Trip", icon: "mdi:airplane", color: "text-green-600" },
    service: { name: "Service", icon: "mdi:tools", color: "text-purple-600" },
    other: {
      name: "Other",
      icon: "mdi:dots-horizontal",
      color: "text-gray-600",
    },
  };
  return (
    types[invoiceFor] || {
      name: invoiceFor,
      icon: "mdi:file",
      color: "text-gray-600",
    }
  );
};

// --- Status Badge ---
const StatusBadge = ({ status }) => {
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
    cancelled: { bg: "bg-gray-100", text: "text-gray-800", icon: "mdi:cancel" },
    expired: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "mdi:timer-off",
    },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
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

// --- Invoice Details Modal (Re-styled for Admin Theme) ---
const InvoiceDetailsModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const typeInfo = getInvoiceForDisplay(invoice.invoice_for);

  return (
    <ModalWrapper visible={!!invoice} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full animate-in fade-in-0 zoom-in-95">
        <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:file-document" className="w-8 h-8" />
            </div>
            <div>
              <h2 id="modal-title" className="text-2xl font-bold">
                Invoice #{String(invoice.id).padStart(5, "0")}
              </h2>
              <p className="text-cyan-100 mt-1">
                Issued on {formatDate(invoice.created_at)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Icon
                icon="mdi:receipt-text"
                className="w-6 h-6 text-slate-400 mt-1"
              />
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon icon="mdi:cash" className="w-6 h-6 text-slate-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Amount
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(invoice.amount)}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon
                icon={typeInfo.icon}
                className="w-6 h-6 text-slate-400 mt-1"
              />
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Invoice For
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  {typeInfo.name}
                </p>
              </div>
            </div>
          </div>

          {invoice.user && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Icon
                    icon="mdi:account-circle"
                    className="w-5 h-5 text-slate-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Name</p>
                    <p className="text-slate-700">{invoice.user.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon icon="mdi:email" className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <p className="text-slate-700">{invoice.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
              Invoice Items
            </h3>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-700">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-end items-center pt-4 mt-4 border-t-2 border-slate-200">
                  <span className="text-lg font-bold text-slate-800">
                    Total: {formatCurrency(invoice.amount)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">
                No items listed for this invoice.
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

//=================================================================
//  MAIN INVOICE MANAGEMENT COMPONENT
//=================================================================
export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { userType } = useAuthStore();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (userType && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [userType, router]);

  // Fetch data
  const fetchData = async (
    page = 1,
    perPage = 10,
    status = "all",
    search = ""
  ) => {
    setIsLoading(true);
    try {
      // Fetch summary (only on first load or when filters clear)
      if (!summary || (status === "all" && search === "")) {
        const summaryData = await InvoiceService.getInvoiceSummaryAdmin();
        setSummary(summaryData);
      }

      // Fetch invoices
      const invoiceData = await InvoiceService.getAllInvoicesAdmin({
        page,
        per_page: perPage,
        status: status === "all" ? null : status.toUpperCase(),
        search: search || null,
      });

      setInvoices(invoiceData.invoices || []);
      setPagination({
        page: invoiceData.page,
        per_page: invoiceData.per_page,
        total: invoiceData.total,
        total_pages: invoiceData.total_pages,
      });
    } catch (error) {
      toast.error(
        "Failed to fetch invoices. " +
          (error.response?.data?.detail || error.message)
      );
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and fetch on dependency change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, pagination.per_page, statusFilter, searchTerm);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, pagination.per_page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchData(newPage, pagination.per_page, statusFilter, searchTerm);
    }
  };

  const handleUpdateStatus = async (invoiceId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Invoice Status",
      input: "select",
      inputOptions: {
        paid: "Paid",
        failed: "Failed",
        cancelled: "Cancelled",
        pending: "Pending",
      },
      inputPlaceholder: "Select a status",
      showCancelButton: true,
      inputValue: currentStatus,
      confirmButtonText: "Update",
      customClass: {
        confirmButton: "bg-cyan-500 text-white",
      },
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        await InvoiceService.updateInvoiceStatusAdmin(
          invoiceId,
          newStatus.toUpperCase()
        );
        toast.success(`Invoice #${invoiceId} status updated to ${newStatus}.`);
        fetchData(
          pagination.page,
          pagination.per_page,
          statusFilter,
          searchTerm
        );
      } catch (error) {
        toast.error(
          "Failed to update status. " +
            (error.response?.data?.detail || error.message)
        );
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! This will permanently delete the invoice.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await InvoiceService.deleteInvoiceAdmin(invoiceId);
        toast.success(`Invoice #${invoiceId} has been deleted.`);
        fetchData(
          pagination.page,
          pagination.per_page,
          statusFilter,
          searchTerm
        );
      } catch (error) {
        toast.error(
          "Failed to delete invoice. " +
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
            #{String(row.original.id).padStart(5, "0")}
          </span>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-800">
              {row.original.user.full_name}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
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
        accessorKey: "invoice_for",
        header: "Type",
        cell: ({ row }) => {
          const typeInfo = getInvoiceForDisplay(row.original.invoice_for);
          return (
            <div
              className={`inline-flex items-center gap-1.5 font-medium ${typeInfo.color}`}
            >
              <Icon icon={typeInfo.icon} className="h-4 w-4" />
              {typeInfo.name}
            </div>
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedInvoice(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>
            <button
              onClick={() =>
                handleUpdateStatus(row.original.id, row.original.status)
              }
              className="p-2 text-slate-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600"
              title="Update Status"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>
            <button
              onClick={() => handleDeleteInvoice(row.original.id)}
              className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600"
              title="Delete Invoice"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [pagination.page, pagination.per_page, statusFilter, searchTerm]
  );

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:receipt-text" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Invoice Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Oversee all financial transactions and invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Invoices",
                value: summary.total_invoices,
                icon: "mdi:file-document-multiple",
                color: "blue",
              },
              {
                title: "Total Revenue",
                value: formatCurrency(summary.total_amount),
                icon: "mdi:currency-usd",
                color: "green",
              },
              {
                title: "Pending Invoices",
                value: summary.pending_invoices || 0,
                icon: "mdi:clock-outline",
                color: "yellow",
              },
              {
                title: "Failed/Cancelled",
                value: summary.failed_invoices || 0,
                icon: "mdi:alert-circle-outline",
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
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <Icon
                      icon={stat.icon}
                      className={`w-6 h-6 text-${stat.color}-600`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Filters and Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  type="text"
                  placeholder="Search by user name, email, or invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
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
                    icon="mdi:file-search-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Invoices Found
                </h3>
                <p className="text-slate-500">
                  No invoices match your current filters.
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
          {!isLoading && invoices.length > 0 && pagination.total_pages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page <strong>{pagination.page}</strong> of{" "}
                  <strong>{pagination.total_pages}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

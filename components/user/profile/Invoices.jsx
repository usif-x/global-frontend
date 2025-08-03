import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Change to EGP if needed
    minimumFractionDigits: 2,
  }).format(amount);
};

const getPaymentMethodDisplay = (method) => {
  const methods = {
    credit_card: { name: "Credit Card", icon: "mdi:credit-card" },
    fawry: { name: "Fawry", icon: "mdi:wallet" },
    bank_transfer: { name: "Bank Transfer", icon: "mdi:bank" },
    cash: { name: "Cash", icon: "mdi:cash" },
  };
  return methods[method] || { name: method, icon: "mdi:payment" };
};

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
    cancelled: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: "mdi:cancel",
    },
    expired: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "mdi:timer-off",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ItemsPopover = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) {
    return <span className="text-gray-400">No items</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-cyan-600 hover:text-cyan-800 inline-flex items-center gap-1 text-sm font-medium"
      >
        <Icon icon="mdi:package-variant" className="h-4 w-4" />
        {items.length} item{items.length > 1 ? "s" : ""}
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="h-4 w-4"
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Items:</h4>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center font-semibold text-sm">
                <span>Total:</span>
                <span>
                  {formatCurrency(
                    items.reduce((sum, item) => sum + item.price, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InvoiceModal = ({ invoice, isOpen, onClose }) => {
  if (!isOpen || !invoice) return null;

  const typeInfo = getInvoiceForDisplay(invoice.invoice_for);
  const methodInfo = getPaymentMethodDisplay(invoice.pay_method);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <Icon icon="mdi:close" className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Invoice #{String(invoice.id).padStart(4, "0")}
                  </h3>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(invoice.created_at)}
                </p>
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Invoice Type
                    </label>
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-medium ${typeInfo.color}`}
                    >
                      <Icon icon={typeInfo.icon} className="h-5 w-5" />
                      {typeInfo.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <Icon icon={methodInfo.icon} className="h-5 w-5" />
                      {methodInfo.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Total Amount
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Created At
                    </label>
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.updated_at)}
                    </div>
                  </div>

                  {invoice.pay_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Payment URL
                      </label>
                      <a
                        href={invoice.pay_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-600 hover:text-cyan-800 break-all"
                      >
                        {invoice.pay_url.length > 50
                          ? `${invoice.pay_url.substring(0, 50)}...`
                          : invoice.pay_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-3">
                  Invoice Items
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  {invoice.items && invoice.items.length > 0 ? (
                    <div className="space-y-3">
                      {invoice.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500">
                                {item.description}
                              </div>
                            )}
                            {item.quantity && (
                              <div className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            Total:
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No items found for this invoice
                    </div>
                  )}
                </div>
              </div>

              {/* User Info (if available) */}
              {invoice.user && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    Customer Information
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-cyan-100 rounded-full p-2">
                        <Icon
                          icon="mdi:account"
                          className="h-5 w-5 text-cyan-600"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {invoice.user.full_name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {invoice.status === "pending" && invoice.pay_url && (
                  <a
                    href={invoice.pay_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Icon icon="mdi:credit-card" className="h-4 w-4" />
                    Pay Now
                  </a>
                )}
                {invoice.status === "paid" && (
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    <Icon icon="mdi:download" className="h-4 w-4" />
                    Download Receipt
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Icon icon="mdi:close" className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState(false);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInvoice(null);
  };

  // State for TanStack Table features
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Invoice #",
        cell: (info) => (
          <div className="font-mono text-sm font-semibold">
            #{String(info.getValue()).padStart(4, "0")}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: (info) => (
          <div className="text-sm">{formatDate(info.getValue())}</div>
        ),
        size: 150,
      },
      {
        accessorKey: "invoice_for",
        header: "Type",
        cell: (info) => {
          const typeInfo = getInvoiceForDisplay(info.getValue());
          return (
            <div
              className={`inline-flex items-center gap-2 text-sm font-medium ${typeInfo.color}`}
            >
              <Icon icon={typeInfo.icon} className="h-4 w-4" />
              {typeInfo.name}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: (info) => <ItemsPopover items={info.getValue()} />,
        enableSorting: false,
        size: 150,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => (
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(info.getValue())}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "pay_method",
        header: "Payment Method",
        cell: (info) => {
          const methodInfo = getPaymentMethodDisplay(info.getValue());
          return (
            <div className="inline-flex items-center gap-2 text-sm text-gray-700">
              <Icon icon={methodInfo.icon} className="h-4 w-4" />
              {methodInfo.name}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
        size: 120,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="text-right space-x-2">
              {invoice.status === "pending" && invoice.pay_url && (
                <a
                  href={invoice.pay_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
                >
                  <Icon icon="mdi:credit-card" className="h-3 w-3" />
                  Pay Now
                </a>
              )}
              {invoice.status === "paid" && (
                <button className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-md transition-colors">
                  <Icon icon="mdi:download" className="h-3 w-3" />
                  Receipt
                </button>
              )}
              <button
                onClick={() => handleViewInvoice(invoice)}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Icon icon="mdi:eye" className="h-3 w-3" />
                View
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 200,
      },
    ],
    []
  );

  // Fetch data on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getData("/invoices/my", true);

        // Handle both direct array response and paginated response
        const invoicesData = response.invoices || response || [];
        setInvoices(invoicesData);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setError("Could not load your invoices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Create the table instance
  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    const pending = invoices.filter((inv) => inv.status === "pending").length;
    const paidAmount = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return { total, totalAmount, paid, pending, paidAmount };
  }, [invoices]);

  // Render logic for loading, error, and empty states
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
        <Icon
          icon="mdi:alert-circle"
          className="mx-auto h-12 w-12 mb-4 text-red-400"
        />
        <p className="font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-tight text-gray-900">
          My Invoices
        </h2>
        <div className="text-sm text-gray-500">
          {invoices.length} total invoice{invoices.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Summary Cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Icon
                icon="mdi:file-document-multiple"
                className="h-8 w-8 text-blue-500"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Invoices
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {summaryStats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Icon
                icon="mdi:currency-usd"
                className="h-8 w-8 text-green-500"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summaryStats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Icon
                icon="mdi:check-circle"
                className="h-8 w-8 text-green-500"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summaryStats.paid}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Icon
                icon="mdi:clock-outline"
                className="h-8 w-8 text-yellow-500"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summaryStats.pending}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Icon
            icon="mdi:file-document-outline"
            className="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No invoices found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any invoices yet. They will appear here once created.
          </p>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search invoices..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white shadow border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-1 hover:text-gray-700"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <Icon icon="mdi:arrow-up" className="h-4 w-4" />
                              ),
                              desc: (
                                <Icon
                                  icon="mdi:arrow-down"
                                  className="h-4 w-4"
                                />
                              ),
                            }[header.column.getIsSorted()] ??
                              (header.column.getCanSort() ? (
                                <Icon
                                  icon="mdi:unfold-more-horizontal"
                                  className="h-4 w-4 text-gray-400"
                                />
                              ) : null)}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No invoices match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-700">
                Page{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:page-first" className="h-5 w-5" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-2 inline-flex items-center gap-1 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:chevron-left" className="h-5 w-5" />
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-2 inline-flex items-center gap-1 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <Icon icon="mdi:chevron-right" className="h-5 w-5" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-2 inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:page-last" className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoicesTab;

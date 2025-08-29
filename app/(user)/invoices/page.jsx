"use client";

import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  PDF GENERATION HELPER (ADAPTED FOR YOUR DATA)
//=================================================================
const generateInvoicePDF = async (invoice, user) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF();
    const callAutoTable = (options) => autoTable(doc, options);
    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(123, 136, 151);
    doc.text("Top Divers Hurghada", 20, 25);
    doc.text("Aqua Joy sunrise resort, hurghada - egypt", 20, 30);
    doc.text("Website: topdivers.online", 20, 35);

    // --- Invoice Details ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text(`Invoice Ref: ${invoice.customer_reference}`, pageWidth - 20, 45, {
      align: "right",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date Issued: ${formatDate(invoice.created_at)}`,
      pageWidth - 20,
      50,
      { align: "right" }
    );
    doc.text(
      `Status: ${
        invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
      }`,
      pageWidth - 20,
      55,
      { align: "right" }
    );

    // --- Billed To Section ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text("Bill To:", 20, 75);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 95, 111);
    doc.text(`${invoice.buyer_name}`, 20, 80);
    doc.text(invoice.buyer_email, 20, 85);
    doc.text(invoice.buyer_phone, 20, 90);

    // --- FIX: Create a single table item from the invoice data ---
    const tableColumn = ["Item Name", "Description", "Total Price"];
    const tableRows = [
      [
        invoice.activity, // Use 'activity' as the item name
        "Booking Details", // A generic description
        formatCurrency(invoice.amount, invoice.currency), // Use the total amount
      ],
    ];

    callAutoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { font: "helvetica", fontSize: 10 },
    });

    let finalY = doc.lastAutoTable.finalY;

    // --- FIX: Add the full invoice_description below the table ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text("Booking Details:", 20, finalY + 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 95, 111);
    doc.text(invoice.invoice_description, 20, finalY + 22, {
      maxWidth: pageWidth - 40,
    });

    finalY = doc.lastAutoTable.finalY + 40; // Adjust finalY

    // --- Footer Notes ---
    if (invoice.status.toLowerCase() === "pending" && invoice.pay_url) {
      doc.setTextColor(41, 128, 185);
      doc.textWithLink(
        "A payment link is available. Click here to pay.",
        20,
        finalY + 10,
        { url: invoice.pay_url }
      );
    }

    doc.save(`Invoice-${invoice.customer_reference}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-20">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);
const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50"
      >
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-slate-200 rounded"
            style={{ width: `${(Math.random() * 20 + 80) / cols}%` }}
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
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatCurrency = (amount, currency = "EGP") => {
  const currencyCode = currency || "EGP"; // Fallback for null/empty currency
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // This catch block handles invalid currency codes
    return `${Number(amount).toFixed(2)} ${currencyCode}`;
  }
};
const StatusBadge = ({ status }) => {
  const safeStatus = (status || "pending").toLowerCase();
  const config = {
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
  }[safeStatus] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: "mdi:help-circle",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

const InfoBanner = ({ message }) => (
  <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg mb-8 flex items-start gap-4">
    <Icon
      icon="mdi:information-outline"
      className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-500"
    />
    <p className="text-sm">{message}</p>
  </div>
);

const InvoiceModal = ({ invoice, isOpen, onClose, onDownload }) => {
  if (!isOpen || !invoice) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in fade-in-0 zoom-in-95">
          <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <h2 id="modal-title" className="text-2xl font-bold">
              Invoice Ref: {invoice.customer_reference}
            </h2>
            <p className="text-cyan-100 mt-1">
              Created on {formatDate(invoice.created_at)}
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 text-right">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-slate-800 text-right">
                  {formatCurrency(invoice.amount, "EGP")}
                </p>
                <p className="text-sm font-medium text-slate-500 text-right">
                  Pay Currency
                </p>
                <p className="text-2xl font-bold text-slate-800 text-right">
                  {invoice.currency}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Booking Details
              </h3>
              <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded-md">
                {invoice.invoice_description}
              </pre>
            </div>
            <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3">
              {invoice.status.toLowerCase() === "pending" &&
                invoice.pay_url && (
                  <a
                    href={invoice.pay_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
                  >
                    <Icon icon="mdi:credit-card" className="w-5 h-5" />
                    <span>Pay Now</span>
                  </a>
                )}
              <button
                onClick={() => onDownload(invoice)}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
              >
                <Icon icon="mdi:file-pdf-box" className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//=================================================================
//  MAIN "MY INVOICES" PAGE COMPONENT
//=================================================================
export default function MyInvoicesPage() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("all");

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const [summaryData, invoiceData] = await Promise.all([
          InvoiceService.getMyInvoiceSummary(),
          InvoiceService.getMyInvoices(),
        ]);
        setSummary(summaryData);
        setAllInvoices(invoiceData || []);
      } catch (err) {
        setError("Could not load your invoices. Please try again later.");
        toast.error(err.response?.data?.detail || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    let invoicesToProcess = [...allInvoices];
    if (statusFilter !== "all") {
      invoicesToProcess = invoicesToProcess.filter(
        (invoice) => invoice.status.toLowerCase() === statusFilter
      );
    }
    setFilteredInvoices(invoicesToProcess);
    setCurrentPage(1);
  }, [allInvoices, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleDownloadPDF = async (invoice) => {
    if (!invoice || !user) return toast.error("Missing data to generate PDF.");
    const toastId = toast.loading("Generating your PDF...");
    try {
      await generateInvoicePDF(invoice, user);
      toast.update(toastId, {
        render: "PDF downloaded!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e) {
      toast.update(toastId, {
        render: "Could not generate PDF.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  // --- [THE FIX IS HERE] The columns definition is updated ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "customer_reference",
        header: "Reference",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {row.original.customer_reference}
          </span>
        ),
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
        accessorKey: "activity",
        header: "Activity",
        cell: ({ row }) => (
          <div className="font-medium text-slate-700">
            {row.original.activity}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount (EGP)", // Header explicitly states EGP
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {/* Always format the amount as EGP for this column */}
            {formatCurrency(row.original.amount, "EGP")}
          </span>
        ),
      },
      // --- [NEW] New column to show the original currency ---
      {
        accessorKey: "currency",
        header: "Pay Currency",
        cell: ({ row }) => (
          <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
            {row.original.currency || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedInvoice(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>
            {row.original.status.toLowerCase() === "pending" &&
              row.original.pay_url && (
                <a
                  href={row.original.pay_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-500 rounded-full hover:bg-green-100 hover:text-green-600"
                  title="Pay Now"
                >
                  <Icon icon="mdi:credit-card" width={18} />
                </a>
              )}
            <button
              onClick={() => handleDownloadPDF(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600"
              title="Download PDF"
            >
              <Icon icon="mdi:file-pdf-box" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [user]
  );

  const table = useReactTable({
    data: paginatedInvoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
  });

  const currencyNote =
    "Please note: All summary totals on this page are shown in Egyptian Pounds (EGP) for consistency. When you proceed to payment for a pending invoice, you will be charged in the currency you originally selected during booking (e.g., USD, EUR). The payment provider will handle the final conversion.";

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen pt-20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8">
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:receipt-text-outline" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                My Invoices
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review your transaction history and manage payments.
              </p>
            </div>
          </div>
        </div>

        <InfoBanner message={currencyNote} />

        {summary && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <p className="text-slate-500 text-sm font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.paid_amount_total, "EGP")}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.paid_invoices_count} Paid Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <p className="text-slate-500 text-sm font-medium">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(summary.pending_amount_total, "EGP")}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.pending_invoices_count} Pending Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <p className="text-slate-500 text-sm font-medium">
                Failed/Cancelled
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summary.failed_amount_total, "EGP")}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.failed_invoices_count} Failed Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <p className="text-slate-500 text-sm font-medium">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {summary.total_invoices}
              </p>
              <p className="text-xs text-slate-400 mt-2">Across all statuses</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600">
                  Filter by status:
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

          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="p-12 text-center text-red-600">{error}</div>
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
                  You don't have any invoices matching this filter.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-cyan-50/30">
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

          {!loading && filteredInvoices.length > 0 && totalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
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

      <InvoiceModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}

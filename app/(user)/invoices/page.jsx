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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. HELPER HOOK TO PREVENT HYDRATION ERRORS
//=================================================================
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
};

//=================================================================
//  2. PDF GENERATION HELPER (FIXED: Proper autoTable import)
//=================================================================
const generateInvoicePDF = async (invoice, user) => {
  try {
    // Import jsPDF first
    const { default: jsPDF } = await import("jspdf");

    // Import autoTable - it should be imported as a named export or default
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF();

    // Call autoTable as a standalone function with doc as first parameter
    const callAutoTable = (options) => {
      return autoTable(doc, options);
    };

    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // --- Add Logo ---
    try {
      // Create an image element to load the logo
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Add logo - positioned at top left
            const logoWidth = 25;
            const logoHeight = 25;
            doc.addImage(img, "PNG", 20, 15, logoWidth, logoHeight);
            resolve();
          } catch (error) {
            console.warn("Could not add logo to PDF:", error);
            resolve(); // Continue without logo
          }
        };
        img.onerror = () => {
          console.warn("Could not load logo image");
          resolve(); // Continue without logo
        };
        img.src = "/image/logo.png";
      });
    } catch (error) {
      console.warn("Logo loading failed:", error);
    }

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71); // Dark blue-gray
    doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(123, 136, 151); // Lighter gray
    // Company info positioned to the right of logo
    doc.text("Top Divers Hurghada", 50, 25);
    doc.text("Aqua Joy sunrise resort, hurghada - egypt", 50, 30);
    doc.text("Website: globaldivershurghada.com", 50, 35);

    // --- Invoice Details ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text(
      `Invoice #${String(invoice.id).padStart(5, "0")}`,
      pageWidth - 20,
      45,
      {
        align: "right",
      }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date Issued: ${formatDate(invoice.created_at)}`,
      pageWidth - 20,
      50,
      {
        align: "right",
      }
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
    if (user) {
      doc.text(`${user.full_name}`, 20, 80);
      doc.text(user.email, 20, 85);
    } else {
      doc.text("Valued Customer", 20, 80);
    }

    // --- Items Table ---
    const tableColumn = ["#", "Item Name", "Description", "Price"];
    const tableRows = [];
    invoice.items.forEach((item, index) => {
      const itemData = [
        index + 1,
        item.name,
        item.description || "N/A",
        formatCurrency(item.price, invoice.currency),
      ];
      tableRows.push(itemData);
    });

    callAutoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
      styles: { font: "helvetica", fontSize: 10 },
    });

    // --- Total Amount ---
    let finalY = doc.lastAutoTable?.finalY || 100 + tableRows.length * 10 + 30;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 55, 71);
    doc.text("Total:", pageWidth - 65, finalY + 15, { align: "right" });
    doc.text(
      formatCurrency(invoice.amount, invoice.currency),
      pageWidth - 20,
      finalY + 15,
      { align: "right" }
    );

    // --- Footer Notes ---
    if (pageHeight - finalY < 50) {
      // Add new page if not enough space for footer
      doc.addPage();
      finalY = 20;
    }
    doc.setFontSize(10);
    doc.setTextColor(123, 136, 151);
    doc.text("Payment Information", 20, finalY + 30);
    doc.setLineWidth(0.2);
    doc.line(20, finalY + 32, pageWidth - 20, finalY + 32);

    if (invoice.status === "pending" && invoice.pay_url) {
      doc.setFont("helvetica", "normal");
      doc.text(
        "To complete your payment, please visit the following secure link:",
        20,
        finalY + 40
      );
      doc.setTextColor(41, 128, 185);
      doc.textWithLink("Click here to pay online", 20, finalY + 45, {
        url: invoice.pay_url,
      });
    } else if (invoice.status === "paid") {
      doc.setFont("helvetica", "normal");
      doc.text(
        "This invoice has been paid in full. Thank you for your business!",
        20,
        finalY + 40
      );
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(
        "If you have any questions about this invoice, please contact support.",
        20,
        finalY + 40
      );
    }

    // --- Page Footer ---
    doc.setFontSize(8);
    doc.setTextColor(123, 136, 151);
    doc.text(
      `Invoice generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // --- Save File ---
    doc.save(`Invoice-${String(invoice.id).padStart(5, "0")}.pdf`);

    return true; // Success indicator
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error; // Re-throw to be handled by caller
  }
};

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// --- Thematic Loading Spinner ---
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-20">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);

// --- Table Skeleton Loader (FIXED FOR HYDRATION) ---
const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  const hasMounted = useHasMounted();

  return (
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
              style={{
                width: hasMounted
                  ? `${(Math.random() * 20 + 80) / cols}%`
                  : `${90 / cols}%`,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

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
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
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

// --- Invoice Details Modal ---
const InvoiceModal = ({ invoice, isOpen, onClose, onDownload }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          ​
        </span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in fade-in-0 zoom-in-95">
          <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <h2 id="modal-title" className="text-2xl font-bold">
              Invoice #{String(invoice.id).padStart(5, "0")}
            </h2>
            <p className="text-cyan-100 mt-1">
              Created on {formatDate(invoice.created_at)}
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
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
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
            </div>

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
                        <p className="font-medium text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.description}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-700">
                        {formatCurrency(item.price, invoice.currency)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-end items-center pt-4 mt-4 border-t-2 border-slate-200">
                    <span className="text-lg font-bold text-slate-800">
                      Total: {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No items listed for this invoice.
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3">
              {invoice.status === "pending" && invoice.pay_url && (
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
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [statusFilter, setStatusFilter] = useState("all");

  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, invoiceData] = await Promise.all([
          InvoiceService.getMyInvoiceSummary(),
          InvoiceService.getMyInvoices({
            page: pagination.page,
            per_page: pagination.per_page,
            status: statusFilter === "all" ? null : statusFilter.toUpperCase(),
          }),
        ]);

        setSummary(summaryData);
        setInvoices(invoiceData.invoices || []);
        setPagination({
          page: invoiceData.page,
          per_page: invoiceData.per_page,
          total: invoiceData.total,
          total_pages: invoiceData.total_pages,
        });
      } catch (err) {
        setError("Could not load your invoices. Please try again later.");
        toast.error(err.response?.data?.detail || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, statusFilter, pagination.page, pagination.per_page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 3. UPDATED PDF DOWNLOAD HANDLER (FIXED)
  const handleDownloadPDF = async (invoice) => {
    if (!invoice || !user) {
      toast.error("Missing data to generate PDF.");
      return;
    }

    const toastId = toast.loading("Generating your PDF...");

    try {
      await generateInvoicePDF(invoice, user);

      toast.update(toastId, {
        render: "PDF downloaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e) {
      console.error("PDF Generation Error: ", e);
      toast.update(toastId, {
        render: "Could not generate the PDF. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Invoice #",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            #{String(row.original.id).padStart(5, "0")}
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
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
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
            {row.original.status === "pending" && row.original.pay_url && (
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
    [user] // Add user as dependency because handleDownloadPDF uses it
  );

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen mt-20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
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

        {/* Stats Cards */}
        {summary && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Invoices",
                value: summary.total_invoices,
                icon: "mdi:file-document-multiple",
                color: "blue",
              },
              {
                title: "Total Paid",
                value: formatCurrency(summary.paid_amount),
                icon: "mdi:currency-usd",
                color: "green",
              },
              {
                title: "Pending Amount",
                value: formatCurrency(summary.pending_amount),
                icon: "mdi:clock-alert-outline",
                color: "yellow",
              },
              {
                title: "Total Amount",
                value: formatCurrency(summary.total_amount),
                icon: "mdi:currency-usd",
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

        {/* Main Table Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600">
                  Filter by status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setPagination((p) => ({ ...p, page: 1 }));
                    setStatusFilter(e.target.value);
                  }}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
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

          {/* Pagination */}
          {!loading && invoices.length > 0 && pagination.total_pages > 1 && (
            <div className="p-4 border-t border-slate-200">
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

      {/* Invoice Detail Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}

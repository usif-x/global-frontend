// components/InvoicesTab.jsx (or wherever you place this file)

"use client";

import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
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
import { toast } from "react-toastify";

//=================================================================
//  PDF GENERATION HELPER (ADAPTED FOR YOUR DATA)
//=================================================================
const generateInvoicePDF = async (invoice) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF();
    const callAutoTable = (options) => autoTable(doc, options);
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22).setFont("helvetica", "bold").setTextColor(40, 55, 71);
    doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });
    doc
      .setFontSize(10)
      .setFont("helvetica", "normal")
      .setTextColor(123, 136, 151);
    doc.text("Top Divers Hurghada", 20, 25);
    doc.text("Website: topdivers.online", 20, 30);

    // Invoice Details
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(40, 55, 71);
    doc.text(`Invoice Ref: ${invoice.customer_reference}`, pageWidth - 20, 45, {
      align: "right",
    });
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(
      `Date Issued: ${formatDate(invoice.created_at)}`,
      pageWidth - 20,
      50,
      { align: "right" }
    );
    doc.text(`Status: ${invoice.status}`, pageWidth - 20, 55, {
      align: "right",
    });

    // Billed To
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(40, 55, 71);
    doc.text("Bill To:", 20, 75);
    doc
      .setFontSize(10)
      .setFont("helvetica", "normal")
      .setTextColor(82, 95, 111);
    doc.text(invoice.buyer_name, 20, 80);
    doc.text(invoice.buyer_email, 20, 85);

    // Items Table
    const tableColumn = ["Item Name", "Total Price"];
    const tableRows = [
      [invoice.activity, formatCurrency(invoice.amount, invoice.currency)],
    ];
    callAutoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    let finalY = doc.lastAutoTable.finalY;

    // Booking Details
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(40, 55, 71);
    doc.text("Booking Details:", 20, finalY + 15);
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(82, 95, 111);
    doc.text(invoice.invoice_description, 20, finalY + 22, {
      maxWidth: pageWidth - 40,
    });

    doc.save(`Invoice-${invoice.customer_reference}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate PDF.");
    throw error;
  }
};

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

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
  const currencyCode = currency || "EGP";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
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
      className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="h-3 w-3" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

const InvoiceModal = ({ invoice, isOpen, onClose }) => {
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="relative bg-gray-50 p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Invoice Details</h3>
            <p className="text-sm text-gray-500">
              Reference: {invoice.customer_reference}
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <Icon icon="mdi:close" className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Issued</p>
                <p className="font-medium text-gray-800">
                  {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Booking Details
              </p>
              <pre className="w-full bg-gray-50 p-4 rounded-md border text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {invoice.invoice_description}
              </pre>
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {invoice.status.toLowerCase() === "pending" &&
                invoice.pay_url && (
                  <a
                    href={invoice.pay_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700"
                  >
                    Pay Now
                  </a>
                )}
              <button
                onClick={() => generateInvoicePDF(invoice)}
                className="flex-1 text-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
              >
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
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

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { isAuthenticated } = useAuthStore();

  // --- [FIX] The columns definition is updated here ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "customer_reference",
        header: "Reference",
        cell: (info) => (
          <div className="font-mono text-sm font-semibold">
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: (info) => (
          <div className="text-sm">{formatDate(info.getValue())}</div>
        ),
      },
      {
        accessorKey: "activity",
        header: "Activity",
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      },
      {
        accessorKey: "amount",
        header: "Amount (EGP)", // Header explicitly states EGP
        cell: (info) => (
          <div className="text-sm font-semibold">
            {/* Always format the amount as EGP, regardless of original currency */}
            {formatCurrency(info.getValue(), "EGP")}
          </div>
        ),
      },
      // --- [NEW] New column to show the original currency ---
      {
        accessorKey: "currency",
        header: "Currency",
        cell: (info) => (
          <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
            {info.getValue() || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <button
              onClick={() => setSelectedInvoice(row.original)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              View
            </button>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        setError(null);
        const [summaryData, invoicesData] = await Promise.all([
          InvoiceService.getMyInvoiceSummary(),
          InvoiceService.getMyInvoices(),
        ]);
        setSummary(summaryData);
        setInvoices(invoicesData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load your data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const table = useReactTable({
    data: invoices,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold leading-tight text-gray-900">
        My Invoices
      </h2>

      {summary && (
        <>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-sm text-blue-800">
              All summary totals below are shown in{" "}
              <strong>Egyptian Pounds (EGP)</strong> for consistency. When
              paying an invoice, you will be charged in the currency you
              originally selected.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.paid_amount_total, "EGP")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-500">
                Pending Amount
              </p>
              <p className="text-lg font-semibold text-yellow-600">
                {formatCurrency(summary.pending_amount_total, "EGP")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-500">
                Failed/Cancelled
              </p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(summary.failed_amount_total, "EGP")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-500">
                Total Invoices
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {summary.total_invoices}
              </p>
            </div>
          </div>
        </>
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
          <input
            type="text"
            placeholder="Search invoices by reference or activity..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full max-w-xs pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
          </div>
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
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-2 inline-flex items-center gap-1 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-2 inline-flex items-center gap-1 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoicesTab;

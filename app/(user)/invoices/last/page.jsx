// app/(user)/invoices/last/page.jsx

"use client";

import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER COMPONENTS (Re-used for consistent styling)
//=================================================================

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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-4 h-4" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

const LoadingState = () => (
  <div className="text-center">
    <Icon
      icon="lucide:loader-2"
      className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4"
    />
    <h2 className="text-xl font-semibold text-slate-700">
      Loading Your Invoice...
    </h2>
    <p className="text-slate-500">Please wait a moment.</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-200">
    <Icon
      icon="lucide:alert-circle"
      className="w-12 h-12 text-red-500 mx-auto mb-4"
    />
    <h2 className="text-xl font-semibold text-red-800">Invoice Not Found</h2>
    <p className="text-red-600 mb-6">{message}</p>
    <Link
      href="/invoices"
      className="inline-flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      <Icon icon="lucide:arrow-left" />
      <span>Back to All Invoices</span>
    </Link>
  </div>
);

//=================================================================
//  MAIN LAST INVOICE PAGE COMPONENT
//=================================================================
export default function LastInvoicePage() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const fetchLastInvoice = useCallback(async () => {
    setError(null);
    try {
      const data = await InvoiceService.getUserLastInvoice(); // Correctly using the service method
      setInvoice(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        "Could not load your last invoice. You may not have any invoices yet.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchLastInvoice().finally(() => setLoading(false));
    }
  }, [isAuthenticated, fetchLastInvoice]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLastInvoice();
    setIsRefreshing(false);
    toast.success("Invoice status has been updated.");
  };

  const renderCallToAction = () => {
    if (!invoice) return null;
    const status = invoice.status.toLowerCase();

    if (status === "pending" || (status === "new" && invoice.pay_url)) {
      return (
        <a
          href={invoice.pay_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg hover:scale-105 transition-transform"
        >
          <Icon icon="mdi:credit-card-check" className="w-6 h-6" />
          <span>Proceed to Secure Payment</span>
        </a>
      );
    }
    if (status === "paid") {
      return (
        <div className="text-center text-lg font-semibold text-green-600 bg-green-50 p-4 rounded-lg">
          This invoice has been successfully paid. Thank you!
        </div>
      );
    }
    if (status === "failed" && invoice.pay_url) {
      return (
        <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
          <p className="text-lg font-semibold text-red-700">
            There was an issue with this payment.
          </p>
          <a
            href={invoice.pay_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors transform hover:scale-105"
          >
            <Icon icon="mdi:reload" className="w-5 h-5" />
            <span>Try Again</span>
          </a>
        </div>
      );
    }
    return (
      <div className="text-center text-lg font-semibold text-slate-600 bg-slate-100 p-4 rounded-lg">
        This invoice cannot be paid at this time. Please contact support for
        assistance.
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden p-8 md:p-12">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            invoice && (
              <div className="space-y-8 animate-in fade-in-0 duration-500">
                {/* Header */}
                <div className="text-center">
                  <Icon
                    icon="mdi:receipt-text-check"
                    className="w-16 h-16 text-cyan-500 mx-auto mb-4"
                  />
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                    Your Booking is Confirmed!
                  </h1>
                  <p className="text-slate-500 mt-2">
                    Here are the details of your latest invoice. Please review
                    and proceed to payment if needed.
                  </p>
                </div>

                {/* Invoice Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Invoice Reference
                    </p>
                    <p className="text-lg font-semibold text-slate-800 font-mono">
                      {invoice.customer_reference}
                    </p>
                  </div>
                  <div className="text-left md:text-center">
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm font-medium text-slate-500">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      EGP {invoice.amount}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      Pay Currency
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {invoice.currency}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">
                    Booking Details
                  </h2>
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-lg border">
                    {invoice.invoice_description}
                  </pre>
                </div>

                {/* Footer and Actions */}
                <div className="pt-8 border-t space-y-4">
                  {renderCallToAction()}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 font-semibold disabled:opacity-50"
                    >
                      <Icon
                        icon="lucide:refresh-cw"
                        className={`w-4 h-4 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                      <span>
                        {isRefreshing ? "Checking..." : "Refresh Status"}
                      </span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <Link
                      href="/invoices"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 font-semibold"
                    >
                      <Icon icon="lucide:history" className="w-4 h-4" />
                      <span>View All Invoices</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

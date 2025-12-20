// app/(user)/pay/page.jsx

"use client";

import InvoiceService from "@/services/invoiceService";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

const formatCurrency = (amount, currency = "EGP") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${Number(amount).toFixed(2)} ${currency}`;
  }
};

const LoadingState = () => (
  <div className="text-center p-8">
    <Icon
      icon="lucide:loader-2"
      className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4"
    />
    <h2 className="text-xl font-semibold text-slate-700">
      Finalizing your transaction...
    </h2>
    <p className="text-slate-500">
      Please wait while we confirm the payment status.
    </p>
  </div>
);

const MismatchDisplay = ({ invoice }) => (
  <div className="text-center p-8 bg-orange-50 rounded-2xl border border-orange-200">
    <Icon
      icon="lucide:shield-alert"
      className="w-20 h-20 text-orange-500 mx-auto mb-4"
    />
    <h1 className="text-3xl font-extrabold text-orange-800">Status Mismatch</h1>
    <p className="text-orange-700 mt-2 mb-6">
      The status returned by the payment provider does not match our verified
      records. For your security, please check your official invoice page for
      the definitive status.
    </p>
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        href="/invoices"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
      >
        <Icon icon="lucide:history" />
        <span>Go to My Invoices</span>
      </Link>
      <Link
        href="/contact"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-orange-700 font-semibold px-6 py-3 rounded-lg hover:bg-orange-100 transition-colors"
      >
        <span>Contact Support</span>
        <Icon icon="lucide:mail" />
      </Link>
    </div>
  </div>
);

const SuccessDisplay = ({ invoice }) => (
  <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
    <Icon
      icon="lucide:check-circle-2"
      className="w-20 h-20 text-green-500 mx-auto mb-4"
    />
    <h1 className="text-3xl font-extrabold text-green-800">
      Payment Successful!
    </h1>
    <p className="text-green-700 mt-2 mb-6">
      Your payment has been confirmed. Thank you for your booking!
    </p>

    {/* Pickup Confirmation Notice */}
    {invoice.picked_up === false && (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 text-left rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon
            icon="lucide:info"
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
          />
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              Next Step: Confirm Your Trip
            </h3>
            <p className="text-blue-700 mb-3">
              Your payment was successful! Please contact us to confirm your
              trip details and provide any additional important information.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61579625321316"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Icon icon="mdi:facebook" className="w-5 h-5" />
                <span>Message on Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/topdivers.hurghada"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium"
              >
                <Icon icon="mdi:instagram" className="w-5 h-5" />
                <span>Message on Instagram</span>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=201070440861&text=Hello! I've completed payment for invoice {invoice.customer_reference}"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="bg-white p-6 rounded-lg border space-y-3 text-left">
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Invoice Ref:</span>
        <span className="font-semibold font-mono text-slate-800">
          {invoice.customer_reference}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Amount Paid:</span>
        <span className="font-bold text-lg text-slate-900">
          {formatCurrency(invoice.amount, invoice.currency)}
        </span>
      </div>
    </div>
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        href="/invoices"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Icon icon="lucide:history" />
        <span>View All Invoices</span>
      </Link>
      <Link
        href="/"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-100 transition-colors"
      >
        <span>Back to Home</span>
        <Icon icon="lucide:arrow-right" />
      </Link>
    </div>
  </div>
);

const FailedDisplay = ({ invoice, status }) => (
  <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
    <Icon
      icon="lucide:x-circle"
      className="w-20 h-20 text-red-500 mx-auto mb-4"
    />
    <h1 className="text-3xl font-extrabold text-red-800">
      Payment {status || "Failed"}
    </h1>
    <p className="text-red-700 mt-2 mb-6">
      Unfortunately, we could not process your payment at this time. Please try
      again or contact support.
    </p>
    {invoice && (
      <div className="bg-white p-6 rounded-lg border space-y-3 text-left mb-8">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Invoice Ref:</span>
          <span className="font-semibold font-mono text-slate-800">
            {invoice.customer_reference}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Amount:</span>
          <span className="font-bold text-lg text-slate-900">
            {formatCurrency(invoice.amount, invoice.currency)}
          </span>
        </div>
      </div>
    )}
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      {invoice?.pay_url ? (
        <a
          href={invoice.pay_url}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Icon icon="lucide:refresh-cw" />
          <span>Try Payment Again</span>
        </a>
      ) : (
        <Link
          href="/contact"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Icon icon="lucide:mail" />
          <span>Contact Support</span>
        </Link>
      )}
      <Link
        href="/invoices"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-red-700 font-semibold px-6 py-3 rounded-lg hover:bg-red-100 transition-colors"
      >
        <span>View All Invoices</span>
      </Link>
    </div>
  </div>
);

//=================================================================
//  MAIN PAGE LOGIC
//=================================================================

function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status")?.toUpperCase();
  const customerReference = searchParams.get("customerReference");

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerReference) {
      setError("No invoice reference was provided.");
      setLoading(false);
      return;
    }

    async function fetchInvoiceData() {
      try {
        const data = await InvoiceService.getInvoiceByReference(
          customerReference
        );
        setInvoice(data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Could not find the specified invoice."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInvoiceData();
  }, [customerReference]);

  // --- [REWRITTEN] The core rendering logic with verification ---
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error || !invoice) {
      // If the API call failed or returned no invoice, it's a hard failure.
      return <FailedDisplay invoice={null} status={error || "Error"} />;
    }

    // --- Verification Step ---
    const backendStatus = invoice.status.toUpperCase();

    // Normalize the URL status for comparison. 'SUCCESS' is often used interchangeably with 'PAID'.
    const isUrlSuccess = urlStatus === "PAID" || urlStatus === "SUCCESS";
    const isBackendSuccess = backendStatus === "PAID";

    // Check for a mismatch. This is the critical security check.
    if (isUrlSuccess !== isBackendSuccess) {
      return <MismatchDisplay invoice={invoice} />;
    }

    // If there's no mismatch, we can now trust the backend status to render the correct view.
    if (isBackendSuccess) {
      return <SuccessDisplay invoice={invoice} />;
    } else {
      // Use the backend status for a more accurate message (e.g., Failed, Expired, Cancelled)
      const displayStatus =
        backendStatus.charAt(0) + backendStatus.slice(1).toLowerCase();
      return <FailedDisplay invoice={invoice} status={displayStatus} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/60">
        {renderContent()}
      </div>
    </div>
  );
}

// Next.js requires a Suspense boundary for pages that use useSearchParams
export default function PaymentStatusPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentStatusPage />
    </Suspense>
  );
}

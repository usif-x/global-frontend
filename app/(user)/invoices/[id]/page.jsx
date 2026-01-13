// app/(user)/invoices/[id]/page.jsx

"use client";

import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
//  MAIN INVOICE DETAIL PAGE COMPONENT
//=================================================================
export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { id: invoiceId } = useParams(); // Get invoice ID from URL

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setError(null);
    try {
      const data = await InvoiceService.getInvoiceById(invoiceId); // Use the new service method
      setInvoice(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Could not load the specified invoice.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (isAuthenticated && invoiceId) {
      setLoading(true);
      fetchInvoice().finally(() => setLoading(false));
    }
  }, [isAuthenticated, invoiceId, fetchInvoice]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInvoice();
    setIsRefreshing(false);
    toast.success("Invoice status has been updated.");
  };

  const renderCallToAction = () => {
    if (!invoice) return null;
    const status = invoice.status.toLowerCase();
    const isOnlinePayment = invoice.invoice_type === "online";

    if (status === "pending" || (status === "new" && invoice.pay_url)) {
      if (isOnlinePayment) {
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
      } else {
        return (
          <div className="text-center bg-green-50 border border-green-200 p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-center gap-3 text-green-700">
              <Icon icon="mdi:cash" className="w-8 h-8" />
              <h3 className="text-xl font-bold">
                Cash Payment - Two Steps Required
              </h3>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
              <div className="text-blue-700 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">
                      FIRST: Confirm Your Activity Details
                    </p>
                    <p className="text-sm mt-1">
                      Please contact us first to confirm your trip details and
                      provide any additional important information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">
                      SECOND: Pay Using Cash at Center
                    </p>
                    <p className="text-sm mt-1">
                      Pay{" "}
                      <strong>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </strong>{" "}
                      in cash when you arrive at the diving center.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-100 p-4 rounded-lg text-sm text-green-700">
              <div className="flex items-start gap-2">
                <Icon
                  icon="mdi:information-outline"
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="font-medium mb-1">Important Reminders:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Contact us first to confirm your booking details</li>
                    <li>• Arrive 30 minutes before your scheduled trip time</li>
                    <li>• Bring the exact amount in cash</li>
                    <li>
                      • Show this invoice reference:{" "}
                      <strong>{invoice.customer_reference}</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact options for pending cash invoices */}
            <div className="pt-4">
              <p className="text-sm font-medium text-green-700 mb-3">
                Contact us to confirm your booking:
              </p>
              <div className="flex flex-wrap gap-3">
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
                  href={`https://api.whatsapp.com/send?phone=201070440861&text=Hello! I need to confirm my booking for invoice ${invoice.customer_reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                  <span>WhatsApp Us</span>
                </a>
                <button
                  onClick={() => {
                    if (window.$crisp) {
                      window.$crisp.push(["do", "chat:open"]);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                >
                  <Icon icon="mdi:message-text" className="w-5 h-5" />
                  <span>Live Chat</span>
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    if (status === "paid") {
      return (
        <>
          <div className="text-center text-lg font-semibold text-green-600 bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon icon="mdi:check-circle" className="w-6 h-6" />
              <span>Payment Completed Successfully!</span>
            </div>
            {!isOnlinePayment && (
              <p className="text-sm text-green-700 mt-2">
                Cash payment received at diving center. Thank you!
              </p>
            )}
          </div>

          {/* Status Messages */}
          <div className="mt-6">
            {invoice.picked_up ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon
                      icon="mdi:emoticon-happy-outline"
                      className="w-8 h-8 text-green-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">
                      Activity Completed Successfully
                    </h3>
                    <p className="text-green-700">
                      Your activity is successfully done. We wish you enjoyed
                      it!
                    </p>
                  </div>
                </div>
              </div>
            ) : invoice.is_confirmed ? (
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-100 rounded-full">
                    <Icon
                      icon="mdi:calendar-check"
                      className="w-8 h-8 text-cyan-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-800">
                      Booking Confirmed
                    </h3>
                    <p className="text-cyan-700">
                      Your booking is confirmed. Please wait in{" "}
                      {invoice.hotel_name
                        ? `your hotel (${invoice.hotel_name})`
                        : "your hotel"}{" "}
                      reception at 8:00 AM.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 text-left rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="lucide:info"
                    className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
                  />
                  <div>
                    {invoice.invoice_type === "cash" ? (
                      <>
                        <h3 className="text-lg font-bold text-blue-800 mb-2">
                          Two Required Steps to Complete Your Booking
                        </h3>
                        <div className="text-blue-700 mb-4">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                              1
                            </div>
                            <div>
                              <p className="font-bold">
                                FIRST: Confirm Your Activity Details
                              </p>
                              <p className="text-sm mt-1">
                                Contact us to confirm your trip details and
                                provide any additional important information.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                              2
                            </div>
                            <div>
                              <p className="font-bold">
                                SECOND: Pay Using Cash
                              </p>
                              <p className="text-sm mt-1">
                                Pay{" "}
                                <strong>
                                  {formatCurrency(
                                    invoice.amount,
                                    invoice.currency
                                  )}
                                </strong>{" "}
                                in cash when you arrive at the diving center.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-blue-800 mb-2">
                          Next Step: Confirm Your Trip
                        </h3>
                        <p className="text-blue-700 mb-3">
                          Your payment was successful! Please contact us to
                          confirm your trip details and provide any additional
                          important information.
                        </p>
                      </>
                    )}
                    <div className="flex flex-wrap gap-3">
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
                        href={`https://api.whatsapp.com/send?phone=201070440861&text=Hello! I've completed payment for invoice ${invoice.customer_reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                        <span>WhatsApp Us</span>
                      </a>
                      <button
                        onClick={() => {
                          if (window.$crisp) {
                            window.$crisp.push(["do", "chat:open"]);
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                      >
                        <Icon icon="mdi:message-text" className="w-5 h-5" />
                        <span>Live Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (status === "failed" && invoice.pay_url && isOnlinePayment) {
      return (
        <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
          <p className="text-lg font-semibold text-red-700">
            There was an issue with this online payment.
          </p>
          <a
            href={invoice.pay_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors transform hover:scale-105"
          >
            <Icon icon="mdi:reload" className="w-5 h-5" />
            <span>Try Payment Again</span>
          </a>
        </div>
      );
    }

    if (status === "failed" && !isOnlinePayment) {
      return (
        <div className="text-center bg-orange-50 p-6 rounded-xl border border-orange-200 space-y-4">
          <div className="flex items-center justify-center gap-2 text-orange-700">
            <Icon icon="mdi:alert-circle" className="w-6 h-6" />
            <p className="text-lg font-semibold">Cash Payment Issue</p>
          </div>
          <p className="text-orange-800">
            There was an issue with your cash payment. Please contact the diving
            center for assistance.
          </p>
          <div className="bg-orange-100 p-4 rounded-lg text-sm text-orange-700">
            <p className="font-medium">
              Reference: {invoice.customer_reference}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center text-lg font-semibold text-slate-600 bg-slate-100 p-4 rounded-lg">
        This invoice cannot be processed at this time. Please contact support
        for assistance.
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
                    Invoice Details
                  </h1>
                  <p className="text-slate-500 mt-2">
                    Here are the details of your invoice. Please review and
                    proceed to payment if needed.
                  </p>
                </div>

                {/* Invoice Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border">
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
                  <div className="text-left md:text-center">
                    <p className="text-sm font-medium text-slate-500">
                      Payment Type
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                          invoice.invoice_type === "online"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <Icon
                          icon={
                            invoice.invoice_type === "online"
                              ? "mdi:credit-card"
                              : "mdi:cash"
                          }
                          className="w-4 h-4"
                        />
                        {invoice.invoice_type === "online"
                          ? "Online Payment"
                          : "Cash at Center"}
                      </span>
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
                    <p className="text-lg font-bold text-slate-900">
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

                {/* Discount Breakdown */}
                {invoice.discount_breakdown && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">
                      Price Breakdown
                    </h2>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Price:</span>
                        <span className="font-semibold text-slate-800 text-lg">
                          EGP{" "}
                          {invoice.discount_breakdown.base_price?.toFixed(2)}
                        </span>
                      </div>

                      {invoice.discount_breakdown.group_discount && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-green-700 font-medium flex items-center gap-2">
                              <Icon
                                icon="mdi:account-group"
                                className="w-5 h-5"
                              />
                              Group Discount (
                              {
                                invoice.discount_breakdown.group_discount
                                  .percentage
                              }
                              %)
                            </span>
                            <span className="font-bold text-green-700 text-lg">
                              - EGP{" "}
                              {invoice.discount_breakdown.group_discount.amount?.toFixed(
                                2
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-green-600">
                            {
                              invoice.discount_breakdown.group_discount
                                .applied_because
                            }
                          </p>
                        </div>
                      )}

                      {invoice.discount_breakdown.promo_discount && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-purple-700 font-medium flex items-center gap-2">
                              <Icon
                                icon="mdi:ticket-percent"
                                className="w-5 h-5"
                              />
                              Promo Code (
                              {
                                invoice.discount_breakdown.promo_discount
                                  .percentage
                              }
                              %)
                            </span>
                            <span className="font-bold text-purple-700 text-lg">
                              - EGP{" "}
                              {invoice.discount_breakdown.promo_discount.amount?.toFixed(
                                2
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-purple-600 font-mono">
                            Code:{" "}
                            {invoice.discount_breakdown.promo_discount.code}
                          </p>
                        </div>
                      )}

                      {invoice.discount_breakdown.total_discount > 0 && (
                        <div className="flex justify-between border-t pt-3">
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <Icon icon="mdi:piggy-bank" className="w-5 h-5" />
                            Total Savings:
                          </span>
                          <span className="font-bold text-green-600 text-xl">
                            EGP{" "}
                            {invoice.discount_breakdown.total_discount?.toFixed(
                              2
                            )}
                          </span>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-blue-100 text-sm mb-1">
                              Final Amount
                            </p>
                            <p className="font-black text-3xl">
                              EGP{" "}
                              {invoice.discount_breakdown.final_price?.toFixed(
                                2
                              )}
                            </p>
                          </div>
                          {invoice.discount_breakdown.total_discount > 0 && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                              <p className="text-xs text-blue-100">You saved</p>
                              <p className="font-bold text-lg">
                                EGP{" "}
                                {invoice.discount_breakdown.total_discount?.toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {invoice.discount_breakdown.total_discount > 0 && (
                        <div className="text-center pt-2">
                          <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                            <Icon icon="mdi:check-circle" className="w-5 h-5" />
                            🎉 You saved{" "}
                            {Math.round(
                              (invoice.discount_breakdown.total_discount /
                                invoice.discount_breakdown.base_price) *
                                100
                            )}
                            % on this booking!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

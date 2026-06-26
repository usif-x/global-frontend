"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// ---- Status configuration: drives color, icon, and copy for the big status box ----
const STATUS_CONFIG = {
  PAID: {
    label: "Paid",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    icon: "noto:check-mark-button",
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    icon: "noto:hourglass-not-done",
  },
  FAILED: {
    label: "Failed",
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-700",
    icon: "noto:cross-mark",
  },
  CANCELED: {
    label: "Cancelled",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-600",
    icon: "noto:cross-mark",
  },
};
STATUS_CONFIG.CANCELLED = STATUS_CONFIG.CANCELED;

const DEFAULT_STATUS = {
  label: "Unknown",
  bg: "bg-sky-50",
  border: "border-sky-300",
  text: "text-sky-700",
  icon: "noto:question-mark",
};

const SESSION_KEY = "fastcheck_unlocked";

// Client-side gate. Set this via env var so it's not hardcoded in source,
// but remember: NEXT_PUBLIC_* vars are bundled and visible in devtools.
// This is a friction gate, not real security.
const FASTCHECK_PASSWORD =
  process.env.NEXT_PUBLIC_FASTCHECK_PASSWORD || "changeme";

export default function FastInvoiceChecker() {
  const [refNumber, setRefNumber] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pickupLoading, setPickupLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // ---- Gate state ----
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Restore unlock state for this browser tab/session
  useEffect(() => {
    const unlocked = sessionStorage.getItem(SESSION_KEY) === "true";
    setAuthenticated(unlocked);
    setCheckingSession(false);
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError("Please enter the password");
      return;
    }

    if (passwordInput === FASTCHECK_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setPasswordError("");
      setPasswordInput("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!refNumber.trim()) {
      setErrors({ refNumber: "Please enter a reference number" });
      return;
    }
    setErrors({});
    setLoading(true);
    setInvoice(null);

    try {
      const data = await getData(
        `/invoices/k9dj3nf8s2mxp7q1wb5c/fastcheck?ref_number=${refNumber.trim()}`,
      );
      setInvoice(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invoice not found or an error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setRefNumber("");
    setInvoice(null);
    setErrors({});
  };

  const handlePickupToggle = async (pickedUp) => {
    if (!invoice) return;

    setPickupLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/m7x4w9h2t6n8v3qp5r1k/fast-pickup?ref_number=${invoice.customer_reference}&picked_up=${pickedUp}`,
      );
      setInvoice({ ...invoice, picked_up: pickedUp });
      toast.success(
        pickedUp ? "Marked as picked up" : "Marked as not picked up",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update pickup status",
      );
    } finally {
      setPickupLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!invoice) return;

    setStatusLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/p8k5m2x9w4q7n3v6r1t/fast-pay?ref_number=${invoice.customer_reference}&status=${newStatus}`,
      );
      setInvoice({ ...invoice, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update invoice status",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EGP",
    }).format(amount);
  };

  const statusInfo = invoice
    ? STATUS_CONFIG[invoice.status] || DEFAULT_STATUS
    : DEFAULT_STATUS;
  const showFastPickup = invoice?.status === "PAID" && !invoice?.picked_up;

  // ---- Loading the session check (avoids a flash of the password screen) ----
  if (checkingSession) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <Icon
          icon="solar:loading-bold"
          className="text-3xl text-cyan-600 animate-spin"
        />
      </div>
    );
  }

  // ---- Password gate ----
  if (!authenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 py-10">
        <main className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Icon
              icon="solar:lock-keyhole-bold-duotone"
              className="text-4xl sm:text-5xl text-cyan-600 mx-auto mb-3"
            />
            <h1 className="mb-2 text-xl sm:text-2xl font-bold text-gray-800">
              Staff Access Required
            </h1>
            <p className="text-sm text-gray-500">
              Enter the password to use the Fast Invoice Checker.
            </p>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            noValidate
            className="space-y-4"
          >
            <Input
              icon={"solar:lock-password-bold-duotone"}
              dir="ltr"
              name="password"
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              error={passwordError}
              color="turquoise"
              className="w-full text-sm sm:text-base"
              required
              aria-label="Password"
            />
            <Button
              type="submit"
              color="cyan"
              full
              text="Unlock"
              className="py-3 sm:py-4 text-sm sm:text-base font-medium"
            />
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white px-4 py-10 sm:px-6 lg:py-16">
      <main className="w-full max-w-2xl">
        {/* Heading, same voice as the rest of the app */}
        <div className="text-center mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-4">
            <Icon
              icon="noto:ticket"
              className="text-2xl sm:text-3xl lg:text-4xl"
            />
            <span>Fast Invoice Checker</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500">
            Enter a reference number to pull up a booking instantly.
          </p>
        </div>

        {/* Search Form */}
        {!invoice && (
          <form
            onSubmit={handleCheck}
            noValidate
            className="space-y-4 sm:space-y-5"
          >
            <Input
              icon={"solar:ticket-bold-duotone"}
              dir="ltr"
              name="refNumber"
              type="text"
              placeholder="Reference Number"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              error={errors.refNumber}
              color="turquoise"
              className="w-full text-sm sm:text-base"
              required
              aria-label="Reference Number"
              disabled={loading}
            />
            <Button
              type="submit"
              color="cyan"
              full
              text={loading ? "Checking..." : "Check Invoice"}
              className="py-3 sm:py-4 text-sm sm:text-base font-medium"
              disabled={loading}
            />
          </form>
        )}

        {/* Invoice Details */}
        {invoice && (
          <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Invoice #{invoice.id}
                </h2>
                <p className="text-gray-300 font-mono text-sm tracking-wide">
                  REF {invoice.customer_reference}
                </p>
              </div>
              <button
                onClick={handleCheckAnother}
                className="text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-full px-4 py-2 transition-colors self-start sm:self-auto"
              >
                Check Another Invoice
              </button>
            </div>

            {/* BIG STATUS BOX, with a one-tap pickup shortcut right where you're already looking */}
            <div
              className={`px-6 py-8 sm:py-10 border-b-4 ${statusInfo.border} ${statusInfo.bg} text-center`}
            >
              <Icon
                icon={statusInfo.icon}
                className="text-6xl sm:text-7xl mx-auto mb-2"
              />
              <p
                className={`text-xs sm:text-sm font-bold uppercase tracking-[0.3em] ${statusInfo.text} opacity-70 mb-1`}
              >
                Invoice Status
              </p>
              <p
                className={`text-4xl sm:text-6xl font-black uppercase tracking-tight ${statusInfo.text}`}
              >
                {statusInfo.label}
              </p>

              {showFastPickup && (
                <button
                  onClick={() => handlePickupToggle(true)}
                  disabled={pickupLoading}
                  className="mt-5 inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 disabled:opacity-50 text-white font-bold text-base sm:text-lg px-7 py-3.5 rounded-full shadow-md transition-all"
                >
                  <Icon icon="noto:shopping-bags" className="text-2xl" />
                  {pickupLoading ? "Marking..." : "Mark as Picked Up"}
                </button>
              )}

              {invoice.status === "PAID" && invoice.picked_up && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <Icon icon="solar:check-circle-bold" className="text-lg" />
                  Already picked up
                </p>
              )}
            </div>

            {/* Full action set, for everything beyond the fast path above */}
            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50 space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Change Status
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusChange("PAID")}
                    disabled={statusLoading || invoice.status === "PAID"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:check-circle-bold" className="text-lg" />
                    {invoice.status === "PAID" ? "Paid" : "Mark as Paid"}
                  </button>
                  <button
                    onClick={() => handleStatusChange("PENDING")}
                    disabled={statusLoading || invoice.status === "PENDING"}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:clock-circle-bold" className="text-lg" />
                    {invoice.status === "PENDING"
                      ? "Pending"
                      : "Mark as Pending"}
                  </button>
                  <button
                    onClick={() => handleStatusChange("CANCELLED")}
                    disabled={statusLoading || invoice.status === "CANCELLED"}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:close-circle-bold" className="text-lg" />
                    {invoice.status === "CANCELLED"
                      ? "Cancelled"
                      : "Mark as Cancelled"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Pickup Status
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handlePickupToggle(true)}
                    disabled={pickupLoading || invoice.picked_up}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:bag-check-bold" className="text-lg" />
                    {invoice.picked_up ? "Picked Up" : "Mark as Picked Up"}
                  </button>
                  <button
                    onClick={() => handlePickupToggle(false)}
                    disabled={pickupLoading || !invoice.picked_up}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:bag-cross-bold" className="text-lg" />
                    {!invoice.picked_up
                      ? "Not Picked Up"
                      : "Mark as Not Picked Up"}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Customer Information */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  <Icon
                    icon="solar:user-bold-duotone"
                    className="text-cyan-600 text-lg"
                  />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {invoice.buyer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">
                      {invoice.buyer_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {invoice.buyer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {invoice.user_id}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Activity Information */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  <Icon
                    icon="solar:map-point-wave-bold-duotone"
                    className="text-cyan-600 text-lg"
                  />
                  Activity Details
                </h3>
                <p className="font-semibold text-gray-900 mb-4">
                  {invoice.activity}
                </p>

                {invoice.activity_details &&
                  invoice.activity_details.length > 0 && (
                    <div className="space-y-3">
                      {invoice.activity_details.map((detail, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Adults:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {detail.adults}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Children:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {detail.children}
                              </span>
                            </div>
                            {detail.hotel_name && (
                              <div>
                                <span className="text-gray-500">Hotel:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {detail.hotel_name}
                                </span>
                              </div>
                            )}
                            {detail.room_number && (
                              <div>
                                <span className="text-gray-500">Room:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {detail.room_number}
                                </span>
                              </div>
                            )}
                            {detail.activity_date && (
                              <div className="sm:col-span-2">
                                <span className="text-gray-500">Date:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {new Date(
                                    detail.activity_date,
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {detail.special_requests && (
                              <div className="sm:col-span-2">
                                <span className="text-gray-500">
                                  Special Requests:
                                </span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {detail.special_requests}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {invoice.invoice_description && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Full Description
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {invoice.invoice_description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Payment Information */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  <Icon
                    icon="solar:wallet-money-bold-duotone"
                    className="text-cyan-600 text-lg"
                  />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-3xl font-extrabold text-gray-900 font-mono">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Invoice Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {invoice.invoice_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Picked Up</p>
                    <p className="font-medium text-gray-900">
                      {invoice.picked_up ? "Yes" : "No"}
                    </p>
                  </div>
                  {invoice.easykash_reference && (
                    <div>
                      <p className="text-xs text-gray-500">
                        Easykash Reference
                      </p>
                      <p className="font-medium text-gray-900 font-mono">
                        {invoice.easykash_reference}
                      </p>
                    </div>
                  )}
                </div>

                {invoice.pay_url && (
                  <div className="mt-4">
                    <a
                      href={invoice.pay_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                    >
                      View Payment Link
                      <Icon
                        icon="solar:square-top-down-bold"
                        className="text-base"
                      />
                    </a>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Timestamps */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  <Icon
                    icon="solar:history-bold-duotone"
                    className="text-cyan-600 text-lg"
                  />
                  Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(invoice.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

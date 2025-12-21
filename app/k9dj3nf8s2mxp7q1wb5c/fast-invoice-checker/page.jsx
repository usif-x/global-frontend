"use client";

import { getData } from "@/lib/axios";
import axios from "axios";
import { useState } from "react";

export default function FastInvoiceChecker() {
  const [refNumber, setRefNumber] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickupLoading, setPickupLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!refNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setLoading(true);
    setError("");
    setInvoice(null);

    try {
      const data = await getData(
        `/invoices/k9dj3nf8s2mxp7q1wb5c/fastcheck?ref_number=${refNumber.trim()}`
      );
      setInvoice(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invoice not found or an error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setRefNumber("");
    setInvoice(null);
    setError("");
  };

  const handlePickupToggle = async (pickedUp) => {
    if (!invoice) return;

    setPickupLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/m7x4w9h2t6n8v3qp5r1k/fast-pickup?ref_number=${invoice.customer_reference}&picked_up=${pickedUp}`
      );

      // Update the invoice state with the new picked_up status
      setInvoice({ ...invoice, picked_up: pickedUp });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update pickup status");
    } finally {
      setPickupLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: "bg-green-100 text-green-800 border-green-300",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      FAILED: "bg-red-100 text-red-800 border-red-300",
      CANCELED: "bg-gray-100 text-gray-800 border-gray-300",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-blue-100 text-blue-800 border-blue-300";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Fast Invoice Checker
          </h1>
          <p className="text-gray-600">
            Enter a reference number to check invoice status
          </p>
        </div>

        {/* Search Form */}
        {!invoice && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label
                  htmlFor="refNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reference Number
                </label>
                <input
                  id="refNumber"
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="Enter invoice reference number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Checking...
                  </>
                ) : (
                  "Check Invoice"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Invoice Details */}
        {invoice && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with Status */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Invoice #{invoice.id}
                  </h2>
                  <p className="text-blue-100">
                    Ref: {invoice.customer_reference}
                  </p>
                </div>
                <div
                  className={`${getStatusColor(
                    invoice.status
                  )} px-4 py-2 rounded-lg font-semibold text-sm border inline-block`}
                >
                  {invoice.status}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 sm:p-8 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckAnother}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Check Another Invoice
                </button>
                <button
                  onClick={() => handlePickupToggle(true)}
                  disabled={pickupLoading || invoice.picked_up}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pickupLoading && invoice.picked_up === false ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      {invoice.picked_up ? "✓ Picked Up" : "Mark as Picked Up"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => handlePickupToggle(false)}
                  disabled={pickupLoading || !invoice.picked_up}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pickupLoading && invoice.picked_up === true ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      {!invoice.picked_up
                        ? "✓ Not Picked Up"
                        : "Mark as Not Picked Up"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Customer Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {invoice.buyer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">
                      {invoice.buyer_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {invoice.buyer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900">
                      {invoice.user_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Details
                </h3>
                <p className="font-medium text-gray-900 mb-4">
                  {invoice.activity}
                </p>

                {invoice.activity_details &&
                  invoice.activity_details.length > 0 && (
                    <div className="space-y-4">
                      {invoice.activity_details.map((detail, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
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
                                    detail.activity_date
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
                    <p className="text-sm text-gray-500 mb-2">
                      Full Description
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {invoice.invoice_description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {invoice.invoice_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Picked Up</p>
                    <p className="font-medium text-gray-900">
                      {invoice.picked_up ? "Yes" : "No"}
                    </p>
                  </div>
                  {invoice.easykash_reference && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Easykash Reference
                      </p>
                      <p className="font-medium text-gray-900">
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
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Payment Link
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(invoice.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

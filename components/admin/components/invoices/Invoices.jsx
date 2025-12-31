"use client";

import Input from "@/components/ui/Input";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

//=================================================================
//  HELPER & UI COMPONENTS (No changes needed here)
//=================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
  );
};

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

// --- FIX: The default currency is already EGP, this is correct. ---
const formatCurrency = (amount, currencyCode = "EGP") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP", // Hardcoding to EGP for consistency
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${amount.toFixed(2)} EGP`;
  }
};

const StatusBadge = ({ status }) => {
  const safeStatus = (status || "pending").toLowerCase();
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
  const config = statusConfig[safeStatus] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

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

const InvoiceDetailsModal = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoiceDetails = async () => {
      setLoading(true);
      try {
        const data = await InvoiceService.getInvoiceByIdAdmin(invoiceId);
        setInvoice(data);
      } catch (error) {
        toast.error(
          "Failed to fetch invoice details. " +
            (error.response?.data?.detail || error.message)
        );
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, onClose]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await InvoiceService.updateInvoiceAdmin(invoiceId, {
        notes: notesValue,
      });
      setInvoice({ ...invoice, notes: notesValue });
      setEditingNotes(false);
      toast.success("Notes updated successfully.");
    } catch (error) {
      toast.error(
        "Failed to update notes. " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setSavingNotes(false);
    }
  };

  const handleEditNotes = () => {
    setNotesValue(invoice.notes || "");
    setEditingNotes(true);
  };

  if (!invoiceId) return null;

  return (
    <ModalWrapper visible={!!invoiceId} onClose={onClose}>
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full animate-in fade-in-0 zoom-in-95">
        {loading ? (
          <LoadingSpinner />
        ) : invoice ? (
          <>
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon icon="mdi:file-document" className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 id="modal-title" className="text-2xl font-bold">
                      Invoice Ref: {invoice.customer_reference}
                    </h2>
                    <p className="text-cyan-100 mt-1">
                      Issued on {formatDate(invoice.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <StatusBadge status={invoice.status} />
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
                      : "Cash Payment"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Confirmation Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:check-decagram"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Confirmation Status
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">Status:</span>
                    {invoice.is_confirmed ?? true ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon icon="mdi:check-circle" className="w-4 h-4" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                        Unconfirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:note-text"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Admin Notes
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {editingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[100px]"
                        placeholder="Add notes about this customer or invoice..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingNotes ? (
                            <>
                              <Icon
                                icon="mdi:loading"
                                className="w-4 h-4 animate-spin"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Icon
                                icon="mdi:content-save"
                                className="w-4 h-4"
                              />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingNotes(false)}
                          disabled={savingNotes}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {invoice.notes ? (
                        <p className="text-slate-700 whitespace-pre-wrap mb-3">
                          {invoice.notes}
                        </p>
                      ) : (
                        <p className="text-slate-400 italic mb-3">
                          No notes added yet.
                        </p>
                      )}
                      <button
                        onClick={handleEditNotes}
                        className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium"
                      >
                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                        {invoice.notes ? "Edit Notes" : "Add Notes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:account-outline"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Customer Information
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Name:</span>
                      <p className="text-slate-800 font-semibold">
                        {invoice.buyer_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Email:</span>
                      <p className="text-slate-800">{invoice.buyer_email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Phone:</span>
                      <p className="text-slate-800">
                        {invoice.buyer_phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        User ID:
                      </span>
                      <p className="text-slate-800">#{invoice.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:cash-multiple"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Payment Information
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">
                        Amount:
                      </span>
                      <p className="text-slate-800 font-bold text-lg">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        Currency:
                      </span>
                      <p className="text-slate-800">{invoice.currency}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        Invoice ID:
                      </span>
                      <p className="text-slate-800">#{invoice.id}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        Picked Up:
                      </span>
                      <p className="text-slate-800">
                        {invoice.picked_up ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Icon icon="mdi:check-circle" className="w-4 h-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-600">
                            <Icon
                              icon="mdi:clock-outline"
                              className="w-4 h-4"
                            />
                            No
                          </span>
                        )}
                      </p>
                    </div>
                    {invoice.easykash_reference && (
                      <div className="col-span-2">
                        <span className="text-slate-500 font-medium">
                          EasyKash Reference:
                        </span>
                        <p className="text-slate-800 font-mono">
                          {invoice.easykash_reference}
                        </p>
                      </div>
                    )}
                    {invoice.pay_url && (
                      <div className="col-span-2">
                        <span className="text-slate-500 font-medium">
                          Payment URL:
                        </span>
                        <a
                          href={invoice.pay_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:text-cyan-700 underline break-all"
                        >
                          {invoice.pay_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {invoice.discount_breakdown && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon
                      icon="mdi:calculator"
                      className="w-5 h-5 text-cyan-600"
                    />
                    Price Breakdown
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 space-y-4 border border-blue-100">
                    {/* Base Price */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">
                        Base Price:
                      </span>
                      <span className="font-bold text-slate-800 text-lg">
                        EGP {invoice.discount_breakdown.base_price?.toFixed(2)}
                      </span>
                    </div>

                    {/* Group Discount */}
                    {invoice.discount_breakdown.group_discount && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Icon
                                icon="mdi:account-group"
                                className="w-5 h-5 text-green-600"
                              />
                            </div>
                            <div>
                              <p className="text-green-800 font-bold text-sm">
                                Group Discount
                              </p>
                              <p className="text-green-600 text-xs font-medium">
                                {
                                  invoice.discount_breakdown.group_discount
                                    .percentage
                                }
                                % off
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-green-700 text-lg">
                            - EGP{" "}
                            {invoice.discount_breakdown.group_discount.amount?.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-green-700 bg-green-100/50 px-2 py-1 rounded">
                          {
                            invoice.discount_breakdown.group_discount
                              .applied_because
                          }
                        </p>
                      </div>
                    )}

                    {/* Promo Discount */}
                    {invoice.discount_breakdown.promo_discount && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Icon
                                icon="mdi:ticket-percent"
                                className="w-5 h-5 text-purple-600"
                              />
                            </div>
                            <div>
                              <p className="text-purple-800 font-bold text-sm">
                                Promo Code Applied
                              </p>
                              <p className="text-purple-600 text-xs font-medium">
                                {
                                  invoice.discount_breakdown.promo_discount
                                    .percentage
                                }
                                % off
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-purple-700 text-lg">
                            - EGP{" "}
                            {invoice.discount_breakdown.promo_discount.amount?.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-purple-700 bg-purple-100/50 px-2 py-1 rounded font-mono">
                          Code: {invoice.discount_breakdown.promo_discount.code}
                        </p>
                      </div>
                    )}

                    {/* Total Savings */}
                    {invoice.discount_breakdown.total_discount > 0 && (
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-blue-200">
                        <span className="text-green-600 font-bold flex items-center gap-2">
                          <Icon icon="mdi:piggy-bank" className="w-5 h-5" />
                          Total Savings:
                        </span>
                        <span className="font-black text-green-600 text-lg">
                          EGP{" "}
                          {invoice.discount_breakdown.total_discount?.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    )}

                    {/* Final Price */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-4 mt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-blue-100 text-xs font-medium mb-1">
                            Final Amount
                          </p>
                          <p className="font-black text-3xl">
                            EGP{" "}
                            {invoice.discount_breakdown.final_price?.toFixed(2)}
                          </p>
                        </div>
                        {invoice.discount_breakdown.total_discount > 0 && (
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
                            <p className="text-xs text-blue-100 font-medium">
                              You Saved
                            </p>
                            <p className="text-lg font-black">
                              {(
                                (invoice.discount_breakdown.total_discount /
                                  invoice.discount_breakdown.base_price) *
                                100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:clock-outline"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Timeline
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">
                        Created:
                      </span>
                      <p className="text-slate-800">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        Last Updated:
                      </span>
                      <p className="text-slate-800">
                        {formatDate(invoice.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              {invoice.activity_details &&
                invoice.activity_details.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Icon
                        icon="mdi:calendar-check"
                        className="w-5 h-5 text-cyan-600"
                      />
                      Activity Details
                    </h3>
                    <div className="space-y-3">
                      {invoice.activity_details.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                        >
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500 font-medium">
                                Activity:
                              </span>
                              <p className="text-slate-800">{activity.name}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                Date:
                              </span>
                              <p className="text-slate-800">
                                {formatDate(activity.activity_date)}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                Hotel:
                              </span>
                              <p className="text-slate-800">
                                {activity.hotel_name}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                Room:
                              </span>
                              <p className="text-slate-800">
                                {activity.room_number}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                Adults:
                              </span>
                              <p className="text-slate-800">
                                {activity.adults}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                Children:
                              </span>
                              <p className="text-slate-800">
                                {activity.children}
                              </p>
                            </div>
                            {activity.special_requests && (
                              <div className="col-span-2">
                                <span className="text-slate-500 font-medium">
                                  Special Requests:
                                </span>
                                <p className="text-slate-800">
                                  {activity.special_requests}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Full Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:text-box-outline"
                    className="w-5 h-5 text-cyan-600"
                  />
                  Full Description
                </h3>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-sans border border-slate-200">
                  {invoice.invoice_description}
                </pre>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ModalWrapper>
  );
};

//=================================================================
//  MAIN INVOICE MANAGEMENT COMPONENT
//=================================================================
export default function InvoiceManagementPage() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    hasMore: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmationFilter, setConfirmationFilter] = useState("all");

  const { userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (userType && userType !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/admin/login");
    }
  }, [userType, router]);

  // --- FIX: Centralized data fetching logic ---
  const fetchData = useCallback(
    async (page, perPage, search) => {
      setIsLoading(true);
      try {
        // Fetch summary only on the very first load or when search is cleared
        if (!summary || (search === "" && page === 1)) {
          const summaryData = await InvoiceService.getInvoiceSummaryAdmin();
          setSummary(summaryData);
        }

        const invoiceData = await InvoiceService.getAllInvoicesAdmin({
          page,
          per_page: perPage,
          search: search || null,
        });

        const fetchedInvoices = invoiceData || [];
        setAllInvoices(fetchedInvoices);
        setPagination((prev) => ({
          ...prev,
          page,
          hasMore: fetchedInvoices.length === perPage,
        }));
      } catch (error) {
        toast.error(
          "Failed to fetch invoices. " +
            (error.response?.data?.detail || error.message)
        );
        setAllInvoices([]);
      } finally {
        setIsLoading(false);
      }
    },
    // --- FIX: The dependency array is now empty. ---
    // This makes the fetchData function "stable" and prevents it from
    // being recreated on every render, thus stopping the infinite loop.
    []
  );

  // Effect for client-side filtering
  useEffect(() => {
    let invoicesToDisplay = [...allInvoices];
    if (statusFilter !== "all") {
      invoicesToDisplay = invoicesToDisplay.filter(
        (invoice) => invoice.status.toLowerCase() === statusFilter
      );
    }
    if (confirmationFilter !== "all") {
      invoicesToDisplay = invoicesToDisplay.filter((invoice) => {
        if (confirmationFilter === "confirmed") return invoice.is_confirmed;
        if (confirmationFilter === "unconfirmed") return !invoice.is_confirmed;
        return true;
      });
    }
    setFilteredInvoices(invoicesToDisplay);
  }, [allInvoices, statusFilter, confirmationFilter]);

  // Effect for debounced search and initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, pagination.per_page, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.per_page, fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      fetchData(newPage, pagination.per_page, searchTerm);
    }
  };

  // The rest of the functions are correct and need no changes
  const handleUpdateStatus = async (invoiceId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Invoice Status",
      input: "select",
      inputOptions: {
        PAID: "Paid",
        FAILED: "Failed",
        CANCELLED: "Cancelled",
        PENDING: "Pending",
      },
      inputPlaceholder: "Select a status",
      showCancelButton: true,
      inputValue: currentStatus.toUpperCase(),
      confirmButtonText: "Update",
      customClass: { confirmButton: "bg-cyan-500 text-white" },
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        await InvoiceService.updateInvoiceAdmin(invoiceId, {
          status: newStatus,
        });
        toast.success(`Invoice status updated to ${newStatus}.`);
        fetchData(pagination.page, pagination.per_page, searchTerm);
      } catch (error) {
        toast.error(
          "Failed to update status. " +
            (error.response?.data?.detail || error.message)
        );
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId, ref) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to permanently delete invoice <strong>${ref}</strong>.<br/>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await InvoiceService.deleteInvoiceAdmin(invoiceId);
        toast.success(`Invoice #${ref} has been deleted.`);
        fetchData(pagination.page, pagination.per_page, searchTerm);
      } catch (error) {
        toast.error(
          "Failed to delete invoice. " +
            (error.response?.data?.detail || error.message)
        );
      }
    }
  };

  const handleTogglePickedUp = async (invoiceId, currentPickedUpStatus) => {
    const newPickedUpStatus = !currentPickedUpStatus;

    // Optimistically update the UI for a faster user experience
    setAllInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, picked_up: newPickedUpStatus } : inv
      )
    );

    try {
      await InvoiceService.updateInvoicePickedUp(invoiceId, newPickedUpStatus);
      toast.success(
        `Invoice #${invoiceId} marked as ${
          newPickedUpStatus ? "Picked Up" : "Not Picked Up"
        }.`
      );
      // No need to refetch, the UI is already updated.
    } catch (error) {
      toast.error("Failed to update status. Reverting change.");
      // If the API call fails, revert the optimistic update
      setAllInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, picked_up: currentPickedUpStatus }
            : inv
        )
      );
    }
  };

  const handleToggleConfirmed = async (invoiceId, currentConfirmedStatus) => {
    const newConfirmedStatus = !currentConfirmedStatus;

    // Optimistically update the UI
    setAllInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, is_confirmed: newConfirmedStatus }
          : inv
      )
    );

    try {
      await InvoiceService.updateInvoiceAdmin(invoiceId, {
        is_confirmed: newConfirmedStatus,
      });
      toast.success(
        `Invoice #${invoiceId} marked as ${
          newConfirmedStatus ? "Confirmed" : "Unconfirmed"
        }.`
      );
    } catch (error) {
      toast.error("Failed to update confirmation status. Reverting change.");
      // Revert the optimistic update
      setAllInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, is_confirmed: currentConfirmedStatus }
            : inv
        )
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "customer_reference",
        header: "Invoice Ref",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {row.original.customer_reference}
          </span>
        ),
      },
      {
        accessorKey: "buyer_name",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-800">
              {row.original.buyer_name}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.buyer_email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      }, // Note: we pass the original currency here for potential future use, but our helper defaults to EGP.
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "invoice_type",
        header: "Payment Type",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              row.original.invoice_type === "online"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <Icon
              icon={
                row.original.invoice_type === "online"
                  ? "mdi:credit-card"
                  : "mdi:cash"
              }
              className="w-3 h-3"
            />
            {row.original.invoice_type === "online" ? "Online" : "Cash"}
          </span>
        ),
      },
      {
        accessorKey: "picked_up",
        header: "Picked Up",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <ToggleSwitch
              checked={invoice.picked_up}
              onChange={() =>
                handleTogglePickedUp(invoice.id, invoice.picked_up)
              }
            />
          );
        },
      },
      {
        accessorKey: "is_confirmed",
        header: "Confirmed",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <ToggleSwitch
              checked={invoice.is_confirmed ?? true}
              onChange={() =>
                handleToggleConfirmed(invoice.id, invoice.is_confirmed ?? true)
              }
            />
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const notes = row.original.notes;
          if (!notes) {
            return (
              <span className="text-slate-400 text-xs italic">No notes</span>
            );
          }
          const truncated =
            notes.length > 30 ? notes.substring(0, 30) + "..." : notes;
          return (
            <span className="text-xs text-slate-600" title={notes}>
              {truncated}
            </span>
          );
        },
      },
      {
        accessorKey: "activity",
        header: "Type",
        cell: ({ row }) => (
          <div
            className={`inline-flex items-center gap-1.5 font-medium text-slate-700`}
          >
            <Icon icon="mdi:tag-outline" className="h-4 w-4 text-slate-400" />
            {row.original.activity_details
              .map((activity) => activity.name)
              .join(", ")}
          </div>
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedInvoiceId(row.original.id)}
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
              onClick={() =>
                handleDeleteInvoice(
                  row.original.id,
                  row.original.customer_reference
                )
              }
              className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600"
              title="Delete Invoice"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
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
            <div className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all">
              <p className="text-slate-500 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.total_revenue)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.paid_count} Paid Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all">
              <p className="text-slate-500 text-sm font-medium">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(summary.pending_amount_total)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.pending_count} Pending Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all">
              <p className="text-slate-500 text-sm font-medium">
                Failed/Cancelled
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summary.failed_amount_total)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {summary.failed_count} Failed Invoices
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all">
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
          {/* Filters and Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Input
                  icon="mdi:magnify"
                  type="text"
                  placeholder="Search by Invoice Ref..."
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
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-600">
                    Confirmation:
                  </label>
                  <select
                    value={confirmationFilter}
                    onChange={(e) => setConfirmationFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="unconfirmed">Unconfirmed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
          {!isLoading && allInvoices.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page <strong>{pagination.page}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedInvoiceId && (
        <InvoiceDetailsModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
}

"use client";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getData, postData } from "/lib/axios";

const InvoiceDetailPage = () => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const printRef = useRef();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await getData(`/invoices/${invoiceId}`);
        setInvoice(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "canceled":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "mdi:check-circle";
      case "pending":
        return "mdi:clock-outline";
      case "overdue":
        return "mdi:alert-circle";
      case "draft":
        return "mdi:file-document-outline";
      case "canceled":
        return "mdi:cancel";
      default:
        return "mdi:information";
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    try {
      // You can implement PDF generation here
      // For now, we'll use the browser's print to PDF
      window.print();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    try {
      const response = await postData(`/invoices/${invoiceId}/pay`, {
        payment_method: "stripe", // or whatever payment method
      });

      if (response.payment_url) {
        window.location.href = response.payment_url;
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Pay Invoice</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Invoice #{invoice?.invoice_number || invoice?.id}
                </span>
                <span className="font-bold text-lg">
                  {formatCurrency(invoice?.total_amount, invoice?.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center"
            >
              <Icon
                icon="mdi:credit-card"
                className="mr-2"
                width={20}
                height={20}
              />
              Pay with Card
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-96">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading invoice...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <Icon
                icon="mdi:file-document-remove"
                className="text-red-500 mx-auto mb-4"
                width={64}
                height={64}
              />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Invoice Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || "The invoice you're looking for doesn't exist."}
              </p>
              <button
                onClick={() => router.push("/invoices")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen my-20 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:arrow-left" width={24} height={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Invoice #{invoice.invoice_number || invoice.id}
              </h1>
              <p className="text-gray-600">View and manage invoice details</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {invoice.status !== "paid" && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <Icon icon="mdi:credit-card" width={18} height={18} />
                <span>Pay Now</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
            >
              <Icon icon="mdi:printer" width={18} height={18} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
            >
              <Icon icon="mdi:download" width={18} height={18} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          ref={printRef}
          className="bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none"
        >
          {/* Invoice Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  INVOICE
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p>Invoice #: {invoice.invoice_number || invoice.id}</p>
                  <p>Date: {formatDate(invoice.created_at)}</p>
                  <p>Due Date: {formatDate(invoice.due_date)}</p>
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  <Icon
                    icon={getStatusIcon(invoice.status)}
                    className="mr-2"
                    width={16}
                    height={16}
                  />
                  <span className="capitalize">
                    {invoice.status || "pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* From */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  From:
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p className="font-medium">
                    {invoice.company_name || "Your Company"}
                  </p>
                  <p>{invoice.company_address || "Company Address"}</p>
                  <p>
                    {invoice.company_city || "City"},{" "}
                    {invoice.company_state || "State"}{" "}
                    {invoice.company_zip || "ZIP"}
                  </p>
                  <p>{invoice.company_email || "contact@company.com"}</p>
                  <p>{invoice.company_phone || "+1 (555) 123-4567"}</p>
                </div>
              </div>

              {/* To */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Bill To:
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p className="font-medium">
                    {invoice.customer_name || "Customer Name"}
                  </p>
                  <p>{invoice.customer_email || "customer@email.com"}</p>
                  {invoice.customer_address && (
                    <p>{invoice.customer_address}</p>
                  )}
                  {invoice.customer_city && (
                    <p>
                      {invoice.customer_city}, {invoice.customer_state}{" "}
                      {invoice.customer_zip}
                    </p>
                  )}
                  {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-800">
                      Description
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-800">
                      Qty
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-800">
                      Rate
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-800">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name || item.description}
                            </p>
                            {item.description && item.name && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center text-gray-600">
                          {item.quantity || 1}
                        </td>
                        <td className="py-4 px-2 text-right text-gray-600">
                          {formatCurrency(
                            item.rate || item.price,
                            invoice.currency
                          )}
                        </td>
                        <td className="py-4 px-2 text-right font-medium text-gray-800">
                          {formatCurrency(
                            (item.quantity || 1) *
                              (item.rate || item.price || 0),
                            invoice.currency
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-500"
                      >
                        No items in this invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(
                      invoice.subtotal_amount || invoice.total_amount,
                      invoice.currency
                    )}
                  </span>
                </div>

                {invoice.tax_amount && invoice.tax_amount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      Tax ({invoice.tax_rate || 0}%):
                    </span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(invoice.tax_amount, invoice.currency)}
                    </span>
                  </div>
                )}

                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">
                      -
                      {formatCurrency(
                        invoice.discount_amount,
                        invoice.currency
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Notes:
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Payment Terms */}
            {invoice.payment_terms && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Payment Terms:
                </h3>
                <p className="text-gray-600">{invoice.payment_terms}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center text-gray-500 text-sm">
                <p>Thank you for your business!</p>
                {invoice.company_website && (
                  <p className="mt-2">Visit us at: {invoice.company_website}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        {invoice.payment_history && invoice.payment_history.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 print:hidden">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Icon
                icon="mdi:history"
                className="mr-2"
                width={24}
                height={24}
              />
              Payment History
            </h3>
            <div className="space-y-4">
              {invoice.payment_history.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      payment.status === "completed"
                        ? "bg-green-500"
                        : payment.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {formatCurrency(payment.amount, invoice.currency)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(payment.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {payment.method} • {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal />

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetailPage;

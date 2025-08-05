"use client";
import Alert from "@/components/ui/Alert";
import InvoiceService from "@/services/invoiceService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const PaymentsContent = () => {
  const [paymentStats, setPaymentStats] = useState({
    total_amount: 0,
    paid_amount: 0,
    pending_amount: 0,
    failed_amount: 0,
    total_invoices: 0,
    paid_invoices: 0,
    pending_invoices: 0,
    failed_invoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const invoiceData = await InvoiceService.getInvoiceSummaryAdmin();
      if (invoiceData) {
        setPaymentStats(invoiceData);
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const paymentCards = [
    {
      title: "Total Revenue",
      value: `${(paymentStats.total_amount || 0).toLocaleString()}`,
      icon: "mdi:cash-multiple",
      color: "bg-green-500",
      description: `From ${paymentStats.total_invoices || 0} total invoices`,
    },
    {
      title: "Collected Payments",
      value: `${(paymentStats.paid_amount || 0).toLocaleString()}`,
      icon: "mdi:cash-check",
      color: "bg-blue-500",
      description: `${paymentStats.paid_invoices || 0} successful payments`,
    },
    {
      title: "Pending Payments",
      value: `${(paymentStats.pending_amount || 0).toLocaleString()}`,
      icon: "mdi:clock-outline",
      color: "bg-orange-500",
      description: `${paymentStats.pending_invoices || 0} awaiting payment`,
    },
    {
      title: "Failed Payments",
      value: `${(paymentStats.failed_amount || 0).toLocaleString()}`,
      icon: "mdi:alert-circle-outline",
      color: "bg-red-500",
      description: `${paymentStats.failed_invoices || 0} failed transactions`,
    },
  ];

  const conversionRate =
    paymentStats.total_amount > 0
      ? ((paymentStats.paid_amount / paymentStats.total_amount) * 100).toFixed(
          1
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payments Management
            </h2>
            <p className="text-gray-600">
              Monitor payments, refunds, and financial transactions across your
              platform.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <a
              href="#" // Replace with your payment gateway provider URL
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              <Icon icon="mdi:external-link" className="w-4 h-4 mr-2" />
              Payment Gateway
            </a>
            <button
              onClick={() => loadPaymentData()}
              className="inline-flex items-center justify-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <Icon icon="mdi:refresh" className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {conversionRate}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ${(paymentStats.paid_amount || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {paymentStats.pending_invoices || 0}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {paymentStats.failed_invoices || 0}
            </p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>
      </div>

      {/* Payment Stats Cards */}

      <Alert type="info">
        <strong>Note:</strong> This data is retrieved from the site database and
        may not be 100% accurate. For the most reliable information, please
        refer to the payment gateway provider’s dashboard.{" "}
        <a
          href="https://yourprovider.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:text-cyan-600 transition-colors"
        >
          Click here
        </a>{" "}
        to visit the provider dashboard.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon icon={card.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {card.value}
            </p>
            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Payment Actions & Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="#" // Replace with your payment gateway dashboard URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <Icon
                icon="mdi:view-dashboard"
                className="w-5 h-5 text-blue-600 mr-3"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Payment Dashboard
                </p>
                <p className="text-xs text-blue-600">
                  View detailed payment analytics
                </p>
              </div>
              <Icon
                icon="mdi:external-link"
                className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>

            <a
              href="#" // Replace with your payment gateway transactions URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <Icon
                icon="mdi:format-list-bulleted"
                className="w-5 h-5 text-green-600 mr-3"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Transaction History
                </p>
                <p className="text-xs text-green-600">
                  View all payment transactions
                </p>
              </div>
              <Icon
                icon="mdi:external-link"
                className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>

            <a
              href="#" // Replace with your payment gateway refunds URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
              <Icon
                icon="mdi:cash-refund"
                className="w-5 h-5 text-orange-600 mr-3"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Process Refunds
                </p>
                <p className="text-xs text-orange-600">
                  Handle refund requests
                </p>
              </div>
              <Icon
                icon="mdi:external-link"
                className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>

            <a
              href="#" // Replace with your payment gateway settings URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <Icon icon="mdi:cog" className="w-5 h-5 text-purple-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  Payment Settings
                </p>
                <p className="text-xs text-purple-600">
                  Configure payment methods
                </p>
              </div>
              <Icon
                icon="mdi:external-link"
                className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>

        {/* Payment Provider Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Provider
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Icon
                  icon="mdi:shield-check"
                  className="w-5 h-5 text-green-500 mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Payment Gateway Status
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Active
              </span>
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <Icon
                icon="mdi:bank"
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600 mb-3">
                Connect to your payment gateway provider for advanced features
              </p>
              <a
                href="#" // Replace with your payment gateway provider main URL
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200"
              >
                <Icon icon="mdi:launch" className="w-4 h-4 mr-2" />
                Open Payment Gateway
              </a>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Secure payment processing</p>
              <p>• Multiple payment methods supported</p>
              <p>• Real-time transaction monitoring</p>
              <p>• Automated refund processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start">
          <Icon
            icon="mdi:information"
            className="w-5 h-5 text-blue-500 mr-3 mt-0.5"
          />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Payment Information
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              For detailed payment management, transaction history, and advanced
              features, please use the payment gateway provider dashboard.
            </p>
            <a
              href="#" // Replace with your payment gateway help/docs URL
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Learn more about payment management
              <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsContent;

"use client";

import AnalyticsService from "@/services/analyticsService";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const AnalyticsContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const exportRef = useRef();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await AnalyticsService.getAll();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportPDF = async () => {
    if (!exportRef.current || !isClient) return;

    try {
      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import("html2pdf.js")).default;

      const element = exportRef.current;

      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: "dashboard-analytics.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon
            icon="mdi:alert-circle"
            className="w-16 h-16 text-red-500 mx-auto mb-4"
          />
          <p className="text-red-500 text-lg font-medium">
            Failed to load data
          </p>
          <p className="text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const userStats = [
    {
      title: "Total Users",
      value: stats.users_count,
      icon: "mdi:account-group",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: stats.active_users_count,
      icon: "mdi:account-check",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users_count,
      icon: "mdi:account-off",
      color: "bg-gradient-to-r from-gray-500 to-gray-600",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    {
      title: "Blocked Users",
      value: stats.blocked_users_count,
      icon: "mdi:account-lock",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
  ];

  const contentStats = [
    {
      title: "Trips",
      value: stats.trips_count,
      icon: "mdi:airplane",
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Packages",
      value: stats.packages_count,
      icon: "mdi:package-variant",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
    },
    {
      title: "Courses",
      value: stats.courses_count,
      icon: "mdi:book-open-page-variant",
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50",
    },
  ];

  const testimonialStats = [
    {
      title: "Total Testimonials",
      value: stats.testimonials_count,
      icon: "mdi:comment-text",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
    },
    {
      title: "Accepted",
      value: stats.accepted_testimonials_count,
      icon: "mdi:comment-check",
      color: "bg-gradient-to-r from-green-600 to-green-700",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: stats.unaccepted_testimonials_count,
      icon: "mdi:comment-remove",
      color: "bg-gradient-to-r from-amber-500 to-amber-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
    },
  ];

  const invoiceStats = [
    {
      title: "Total Invoices",
      value: stats.invoices_count,
      icon: "mdi:file-document",
      color: "bg-gradient-to-r from-slate-500 to-slate-600",
      textColor: "text-slate-700",
      bgColor: "bg-slate-50",
    },
    {
      title: "Paid Revenue",
      value: stats.total_invoice_revenue 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(stats.total_invoice_revenue)
        : "EGP 0.00",
      icon: "mdi:cash-multiple",
      color: "bg-gradient-to-r from-green-600 to-green-700",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Revenue",
      value: stats.pending_invoice_revenue
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(stats.pending_invoice_revenue)
        : "EGP 0.00",
      icon: "mdi:cash-clock",
      color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Confirmed",
      value: `${stats.confirmed_invoices_count || 0} / ${stats.invoices_count || 0}`,
      icon: "mdi:check-decagram",
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    {
      title: "Picked Up",
      value: `${stats.picked_up_invoices_count || 0} / ${stats.paid_invoices_count || 0}`,
      icon: "mdi:bag-checked",
      color: "bg-gradient-to-r from-purple-600 to-purple-700",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
    },
  ];

  const StatCard = ({ stat, className = "" }) => (
    <div
      className={`${stat.bgColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
          <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>
            {stat.value?.toLocaleString() || 0}
          </p>
        </div>
        <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
          <Icon icon={stat.icon} className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, description }) => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive overview of your platform statistics
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={!isClient}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Icon icon="mdi:file-pdf-box" className="w-5 h-5" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* Dashboard to Export */}
      <div ref={exportRef} className="space-y-8">
        {/* Users Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <SectionHeader
            title="User Management"
            description="Overview of user registrations and account statuses"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <SectionHeader
            title="Content Statistics"
            description="Track your platform's content across different categories"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <SectionHeader
            title="Testimonial Management"
            description="Monitor customer testimonials and their approval status"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <SectionHeader
            title="Invoice Overview"
            description="Financial tracking with detailed invoice status breakdown"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {invoiceStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">User Engagement</h3>
              <Icon icon="mdi:chart-line" className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {((stats.active_users_count / stats.users_count) * 100).toFixed(
                1
              )}
              %
            </p>
            <p className="text-blue-100">Active user rate</p>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Invoice Success Rate</h3>
              <Icon icon="mdi:currency-usd" className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {stats.invoices_count > 0
                ? (
                    (stats.paid_invoices_count / stats.invoices_count) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
            <p className="text-green-100">Payment completion rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;

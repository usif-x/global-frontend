"use client";

import AnalyticsService from "@/services/analyticsService";
import InvoiceService from "@/services/invoiceService";
import { Icon } from "@iconify/react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper components for charts/visualizations
const ProgressBar = ({
  label,
  value,
  total,
  color = "bg-cyan-500",
  subLabel,
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600 font-semibold">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
  bgColor,
  textColor,
}) => (
  <div
    className={`${
      bgColor || "bg-white"
    } rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p
          className={`${
            textColor
              ? textColor.replace("text-", "text-gray")
              : "text-slate-500"
          } text-sm font-medium mb-1`}
        >
          {title}
        </p>
        <h3
          className={`${textColor || "text-slate-800"} text-2xl font-bold mb-1`}
        >
          {value}
        </h3>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon
          icon={icon}
          className={`w-6 h-6 ${color.replace("bg-", "text-")}`}
        />
      </div>
    </div>
  </div>
);

// Chart.js Bar Chart for Sales Over Time
const SalesBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const chartData = {
    labels: data.map((d) => d.date || `${d.month}/${d.year}`),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        backgroundColor: "#06b6d4",
      },
      {
        label: "Count",
        data: data.map((d) => d.count),
        backgroundColor: "#818cf8",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: false, beginAtZero: true },
    },
  };
  return <Bar data={chartData} options={options} height={180} />;
};

// Chart.js Pie Chart for Distribution
const DistributionPieChart = ({ data, label }) => {
  if (!data || data.length === 0) return null;
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: [
          "#06b6d4",
          "#f472b6",
          "#facc15",
          "#818cf8",
          "#34d399",
          "#f87171",
        ],
      },
    ],
  };
  return (
    <Pie
      data={chartData}
      options={{ plugins: { legend: { position: "bottom" } } }}
    />
  );
};

export default function ComprehensiveAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [allStats, setAllStats] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const exportRef = useRef();

  // Filtering State
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let detailedSummary, dashboardData, allAnalyticsData;

      if (selectedMonth && selectedYear) {
        // For monthly view, fetch monthly analytics
        [detailedSummary, dashboardData, allAnalyticsData] = await Promise.all([
          InvoiceService.getMonthlyAnalytics(selectedYear, selectedMonth),
          AnalyticsService.getDashboardSummary(selectedMonth, selectedYear),
          AnalyticsService.getAll(),
        ]);
      } else {
        // For overall view, fetch detailed summary
        [detailedSummary, dashboardData, allAnalyticsData] = await Promise.all([
          InvoiceService.getDetailedSummaryAdmin(),
          AnalyticsService.getDashboardSummary(selectedMonth, selectedYear),
          AnalyticsService.getAll(),
        ]);
      }

      // Merge the data from both sources
      const mergedData = {
        ...dashboardData,
        detailed: detailedSummary,
      };

      setData(mergedData);
      setAllStats(allAnalyticsData);
    } catch (error) {
      console.error("Error fetching analytics dashboard:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleExportPDF = async () => {
    if (!exportRef.current || !isClient) return;

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = exportRef.current;

      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: "comprehensive-analytics.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Helpers for Dropdowns
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-96 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  const isFiltered = selectedMonth && selectedYear;
  const timeLabel = isFiltered
    ? `${months.find((m) => m.value == selectedMonth)?.label} ${selectedYear}`
    : "Today";

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <Icon icon="mdi:chart-line" className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Comprehensive Analytics
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Real-time insights, financial reports & platform statistics
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Month Filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Current Period</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {/* Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedMonth}
                  className={`px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                    !selectedMonth ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchData}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  title="Refresh Data"
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" />
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={!isClient || !data}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                >
                  <Icon icon="mdi:file-pdf-box" className="w-5 h-5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {data && allStats && (
          <>
            {/* ===== SECTION 1: USER MANAGEMENT ===== */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:account-group" className="text-blue-600" />
                  User Management
                </h2>
                <p className="text-slate-600">
                  Overview of user registrations and account statuses
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={allStats.users_count || 0}
                  subValue={`Active: ${allStats.active_users_count || 0}`}
                  icon="mdi:account-group"
                  color="bg-blue-500"
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                />
                <StatCard
                  title="Active Users"
                  value={allStats.active_users_count || 0}
                  subValue={`${
                    allStats.users_count > 0
                      ? (
                          (allStats.active_users_count / allStats.users_count) *
                          100
                        ).toFixed(1)
                      : 0
                  }% Rate`}
                  icon="mdi:account-check"
                  color="bg-green-500"
                  bgColor="bg-green-50"
                  textColor="text-green-700"
                />
                <StatCard
                  title="Inactive Users"
                  value={allStats.inactive_users_count || 0}
                  icon="mdi:account-off"
                  color="bg-gray-500"
                  bgColor="bg-gray-50"
                  textColor="text-gray-700"
                />
                <StatCard
                  title="Blocked Users"
                  value={allStats.blocked_users_count || 0}
                  icon="mdi:account-lock"
                  color="bg-red-500"
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                />
              </div>
            </div>

            {/* ===== SECTION 2: CONTENT STATISTICS ===== */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Icon
                    icon="mdi:folder-multiple"
                    className="text-purple-600"
                  />
                  Content Statistics
                </h2>
                <p className="text-slate-600">
                  Track your platform's content across different categories
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Trips"
                  value={allStats.trips_count || 0}
                  icon="mdi:airplane"
                  color="bg-yellow-500"
                  bgColor="bg-yellow-50"
                  textColor="text-yellow-700"
                />
                <StatCard
                  title="Packages"
                  value={allStats.packages_count || 0}
                  icon="mdi:package-variant"
                  color="bg-purple-500"
                  bgColor="bg-purple-50"
                  textColor="text-purple-700"
                />
                <StatCard
                  title="Courses"
                  value={allStats.courses_count || 0}
                  icon="mdi:book-open-page-variant"
                  color="bg-indigo-500"
                  bgColor="bg-indigo-50"
                  textColor="text-indigo-700"
                />
              </div>
            </div>

            {/* ===== SECTION 3: TESTIMONIALS MANAGEMENT ===== */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:comment-quote" className="text-orange-600" />
                  Testimonial Management
                </h2>
                <p className="text-slate-600">
                  Monitor customer testimonials and their approval status
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Testimonials"
                  value={allStats.testimonials_count || 0}
                  icon="mdi:comment-text"
                  color="bg-orange-500"
                  bgColor="bg-orange-50"
                  textColor="text-orange-700"
                />
                <StatCard
                  title="Accepted"
                  value={allStats.accepted_testimonials_count || 0}
                  subValue={`${
                    allStats.testimonials_count > 0
                      ? (
                          (allStats.accepted_testimonials_count /
                            allStats.testimonials_count) *
                          100
                        ).toFixed(1)
                      : 0
                  }% Approved`}
                  icon="mdi:comment-check"
                  color="bg-green-600"
                  bgColor="bg-green-50"
                  textColor="text-green-700"
                />
                <StatCard
                  title="Pending"
                  value={allStats.unaccepted_testimonials_count || 0}
                  icon="mdi:comment-remove"
                  color="bg-amber-500"
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                />
              </div>
            </div>

            {/* ===== SECTION 4: INVOICE OVERVIEW ===== */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:file-document" className="text-slate-600" />
                  Invoice Overview
                </h2>
                <p className="text-slate-600">
                  Financial tracking with detailed invoice status breakdown
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Total Invoices"
                  value={allStats.invoices_count || 0}
                  icon="mdi:file-document"
                  color="bg-slate-500"
                  bgColor="bg-slate-50"
                  textColor="text-slate-700"
                />
                <StatCard
                  title="Paid Revenue"
                  value={formatCurrency(allStats.total_invoice_revenue || 0)}
                  icon="mdi:cash-multiple"
                  color="bg-green-600"
                  bgColor="bg-green-50"
                  textColor="text-green-700"
                />
                <StatCard
                  title="Pending Revenue"
                  value={formatCurrency(allStats.pending_invoice_revenue || 0)}
                  icon="mdi:cash-clock"
                  color="bg-yellow-600"
                  bgColor="bg-yellow-50"
                  textColor="text-yellow-700"
                />
                <StatCard
                  title="Confirmed"
                  value={`${allStats.confirmed_invoices_count || 0} / ${
                    allStats.invoices_count || 0
                  }`}
                  icon="mdi:check-decagram"
                  color="bg-blue-600"
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                />
                <StatCard
                  title="Picked Up"
                  value={`${allStats.picked_up_invoices_count || 0} / ${
                    allStats.paid_invoices_count || 0
                  }`}
                  icon="mdi:bag-checked"
                  color="bg-purple-600"
                  bgColor="bg-purple-50"
                  textColor="text-purple-700"
                />
              </div>
            </div>

            {/* ===== SECTION 5: KEY FINANCIAL METRICS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={`Sales ${timeLabel}`}
                value={formatCurrency(data.stats?.revenue)}
                subValue={`${data.stats?.sales_count} Invoices`}
                icon="mdi:cash-register"
                color="bg-green-500"
                bgColor="bg-green-50"
                textColor="text-green-700"
              />
              <StatCard
                title={`Pending ${timeLabel}`}
                value={data.stats?.pending_invoices}
                subValue="Action Items"
                icon="mdi:clock-alert-outline"
                color="bg-yellow-500"
                bgColor="bg-yellow-50"
                textColor="text-yellow-700"
              />
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(data.stats?.average_order_value)}
                subValue="Per Paid Invoice"
                icon="mdi:cart-outline"
                color="bg-blue-500"
                bgColor="bg-blue-50"
                textColor="text-blue-700"
              />
              <StatCard
                title="Total Discounts"
                value={formatCurrency(data.stats?.total_discount_given)}
                subValue={`Given ${timeLabel}`}
                icon="mdi:sale"
                color="bg-red-400"
                bgColor="bg-red-50"
                textColor="text-red-700"
              />
            </div>

            {/* ===== SECTION 6: DETAILED INVOICE METRICS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Invoices"
                value={data.detailed?.total_invoices}
                subValue={`Confirmed: ${data.detailed?.confirmed_invoices}`}
                icon="mdi:file-document-multiple"
                color="bg-blue-600"
                bgColor="bg-blue-50"
                textColor="text-blue-700"
              />
              <StatCard
                title="Paid Invoices"
                value={data.detailed?.paid_count}
                subValue={`${formatCurrency(data.detailed?.total_revenue)}`}
                icon="mdi:check-circle"
                color="bg-green-600"
                bgColor="bg-green-50"
                textColor="text-green-700"
              />
              <StatCard
                title="Pending Invoices"
                value={data.detailed?.pending_count}
                subValue={`${formatCurrency(data.detailed?.pending_amount)}`}
                icon="mdi:clock-outline"
                color="bg-yellow-600"
                bgColor="bg-yellow-50"
                textColor="text-yellow-700"
              />
              <StatCard
                title="Failed Invoices"
                value={data.detailed?.failed_count}
                subValue={`${formatCurrency(data.detailed?.failed_amount)}`}
                icon="mdi:alert-circle"
                color="bg-red-600"
                bgColor="bg-red-50"
                textColor="text-red-700"
              />
            </div>

            {/* ===== SECTION 7: SUCCESS RATES & KEY PERCENTAGES ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Conversion Rate"
                value={`${data.detailed?.conversion_rate?.toFixed(1) || 0}%`}
                subValue="Pending to Paid"
                icon="mdi:trending-up"
                color="bg-teal-500"
                bgColor="bg-teal-50"
                textColor="text-teal-700"
              />
              <StatCard
                title="Payment Success Rate"
                value={`${
                  data.detailed?.payment_success_rate?.toFixed(1) || 0
                }%`}
                subValue="Overall Success"
                icon="mdi:check-decagram"
                color="bg-emerald-500"
                bgColor="bg-emerald-50"
                textColor="text-emerald-700"
              />
              <StatCard
                title="User Engagement"
                value={`${
                  allStats.users_count > 0
                    ? (
                        (allStats.active_users_count / allStats.users_count) *
                        100
                      ).toFixed(1)
                    : 0
                }%`}
                subValue="Active Users"
                icon="mdi:chart-line"
                color="bg-cyan-500"
                bgColor="bg-cyan-50"
                textColor="text-cyan-700"
              />
              <StatCard
                title="Invoice Success"
                value={`${
                  allStats.invoices_count > 0
                    ? (
                        (allStats.paid_invoices_count /
                          allStats.invoices_count) *
                        100
                      ).toFixed(1)
                    : 0
                }%`}
                subValue="Payment Completion"
                icon="mdi:currency-usd"
                color="bg-green-500"
                bgColor="bg-green-50"
                textColor="text-green-700"
              />
            </div>

            {/* ===== SECTION 8: CHARTS & VISUALIZATIONS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Over Time */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Icon
                    icon="mdi:chart-timeline-variant"
                    className="text-cyan-600"
                  />
                  Sales Trend ({isFiltered ? `${timeLabel}` : "Last 30 Days"})
                </h2>
                <SalesBarChart data={data.charts?.sales_over_time} />
              </div>

              {/* Activity Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Icon icon="mdi:pie-chart" className="text-purple-600" />
                  Activity Mix
                </h2>
                <DistributionPieChart
                  data={data.charts?.activity_distribution}
                  label="Activity"
                />
              </div>
            </div>

            {/* Payment Methods & Invoice Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Icon
                    icon="mdi:credit-card-settings-outline"
                    className="text-orange-600"
                  />
                  Payment Methods
                </h2>
                <DistributionPieChart
                  data={data.charts?.payment_method_distribution}
                  label="Payment"
                />
              </div>

              {/* Detailed Stats */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Icon
                    icon="mdi:information-outline"
                    className="text-blue-600"
                  />
                  Quick Stats
                </h2>
                <div className="space-y-3">
                  <ProgressBar
                    label="Payment Success"
                    value={data.detailed?.paid_count || 0}
                    total={data.detailed?.total_invoices || 1}
                    color="bg-green-500"
                  />
                  <ProgressBar
                    label="Pending Invoices"
                    value={data.detailed?.pending_count || 0}
                    total={data.detailed?.total_invoices || 1}
                    color="bg-yellow-500"
                  />
                  <ProgressBar
                    label="Failed Transactions"
                    value={data.detailed?.failed_count || 0}
                    total={data.detailed?.total_invoices || 1}
                    color="bg-red-500"
                  />
                  <ProgressBar
                    label="Active Users"
                    value={allStats.active_users_count || 0}
                    total={allStats.users_count || 1}
                    color="bg-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* ===== SECTION 9: EXPORTABLE DASHBOARD CONTENT ===== */}
            <div ref={exportRef} className="space-y-8">
              {/* Activity Breakdown Table */}
              {data.detailed?.activity_breakdown && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Icon icon="mdi:chart-bar" className="text-indigo-600" />
                    Activity Breakdown
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                            Activity
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Total
                          </th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                            Revenue
                          </th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                            Avg Amount
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Paid
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Pending
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Failed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.detailed?.activity_breakdown?.map(
                          (activity, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-2">
                                <span className="font-medium text-sm text-slate-800">
                                  {activity.activity}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center text-sm">
                                {activity.count}
                              </td>
                              <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                                {formatCurrency(activity.total_revenue)}
                              </td>
                              <td className="py-3 px-2 text-right text-sm text-slate-600">
                                {formatCurrency(activity.average_amount)}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                  {activity.paid_count}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                  {activity.pending_count}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                                  {activity.failed_count}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Method Breakdown */}
              {data.detailed?.payment_method_breakdown && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Icon
                      icon="mdi:credit-card-multiple"
                      className="text-cyan-600"
                    />
                    Payment Method Details
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                            Method
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Count
                          </th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                            Revenue
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Success Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.detailed?.payment_method_breakdown?.map(
                          (method, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-2">
                                <span className="font-medium text-sm text-slate-800 capitalize">
                                  {method.payment_method}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center text-sm">
                                {method.count}
                              </td>
                              <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                                {formatCurrency(method.total_revenue)}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                  {method.success_rate.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Customers */}
              {data.top_customers && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Icon icon="mdi:account-star" className="text-yellow-600" />
                    Top Customers
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                            Name
                          </th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                            Spent
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Orders
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.top_customers?.map((customer, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-slate-800">
                                  {customer.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {customer.email}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                              {formatCurrency(customer.total_spent)}
                            </td>
                            <td className="py-3 px-2 text-center text-sm">
                              {customer.order_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              {data.recent_transactions && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Icon icon="mdi:history" className="text-blue-600" />
                    Recent Transactions
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                            ID
                          </th>
                          <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                            Buyer
                          </th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                            Amount
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.recent_transactions?.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-2 text-xs text-slate-500">
                              #{tx.id}
                            </td>
                            <td className="py-3 px-2 text-sm text-slate-800">
                              {tx.buyer}
                            </td>
                            <td className="py-3 px-2 text-right font-medium text-slate-800 text-sm">
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span
                                className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                  tx.status === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

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
import { useEffect, useState } from "react";
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

const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && <p className="text-sm text-slate-400 mt-1">{subValue}</p>}
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

export default function InvoiceAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filtering State
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let result;
      if (selectedMonth && selectedYear) {
        result = await InvoiceService.getMonthlyAnalytics(
          selectedYear,
          selectedMonth
        );
      } else {
        result = await InvoiceService.getDetailedSummaryAdmin();
      }
      setData(result);
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
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const isFiltered = selectedMonth && selectedYear;
  const timeLabel = isFiltered
    ? `${months.find((m) => m.value == selectedMonth)?.label} ${selectedYear}`
    : "Today";

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500">
            Real-time snapshots and historical trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-cyan-500 focus:outline-none bg-slate-50"
          >
            <option value="">Current (Today)</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Filter (only show if month is selected for better UX, or always show) */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedMonth}
            className={`px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-cyan-500 focus:outline-none bg-slate-50 ${
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
            className="p-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-colors"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metrics - Row 1: Sales Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={`Sales ${timeLabel}`}
              value={formatCurrency(data.stats?.revenue)}
              subValue={`${data.stats?.sales_count} Invoices | Trips: ${data.stats?.trips_booked}`}
              icon="mdi:cash-register"
              color="bg-green-500"
            />
            <StatCard
              title={`Pending ${timeLabel}`}
              value={data.stats?.pending_invoices}
              subValue="Action Items"
              icon="mdi:clock-alert-outline"
              color="bg-yellow-500"
            />
            <StatCard
              title="Avg Order Value"
              value={formatCurrency(data.stats?.average_order_value)}
              subValue="Per Paid Invoice"
              icon="mdi:cart-outline"
              color="bg-blue-500"
            />
            <StatCard
              title="Total Discounts"
              value={formatCurrency(data.stats?.total_discount_given)}
              subValue={`Given ${timeLabel}`}
              icon="mdi:sale"
              color="bg-red-400"
            />
          </div>

          {/* Row 2: Operational & Potential */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Potential Revenue"
              value={formatCurrency(data.stats?.potential_revenue)}
              subValue="Locked in Pending"
              icon="mdi:cash-lock"
              color="bg-indigo-500"
            />
            <StatCard
              title="Confirmation Rate"
              value={`${data.stats?.confirmation_rate}%`}
              subValue="Of Invoices"
              icon="mdi:check-decagram"
              color="bg-teal-500"
            />
            <StatCard
              title="Best Selling Month"
              value={data.stats?.best_selling_month}
              subValue="All Time"
              icon="mdi:trophy"
              color="bg-yellow-400"
            />
          </div>

          {/* Row 3: Users, Testimonials, Content, Invoices breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={data.users?.total}
              subValue={`Active: ${data.users?.active} | Inactive: ${data.users?.inactive}`}
              icon="mdi:account-group"
              color="bg-cyan-500"
            />
            <StatCard
              title="Testimonials"
              value={data.testimonials?.total}
              subValue={`Accepted: ${data.testimonials?.accepted} | Unaccepted: ${data.testimonials?.unaccepted}`}
              icon="mdi:comment-quote"
              color="bg-purple-500"
            />
            <StatCard
              title="Content"
              value={`Trips: ${data.content?.trips}`}
              subValue={`Packages: ${data.content?.packages} | Courses: ${data.content?.courses}`}
              icon="mdi:folder-multiple"
              color="bg-blue-400"
            />
            <StatCard
              title="Invoices"
              value={data.invoices?.total}
              subValue={`Paid: ${data.invoices?.paid} | Pending: ${data.invoices?.pending}`}
              icon="mdi:file-document"
              color="bg-green-400"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Over Time */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon
                  icon="mdi:chart-timeline-variant"
                  className="text-cyan-600"
                />
                Sales Trend ({isFiltered ? `${timeLabel}` : "Last 30 Days"})
              </h2>
              <SalesBarChart data={data.charts?.sales_over_time} />
            </div>

            {/* Distribution Charts */}
            <div className="space-y-8">
              {/* Activity Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Icon icon="mdi:pie-chart" className="text-purple-600" />
                  Activity Mix
                </h2>
                <DistributionPieChart
                  data={data.charts?.activity_distribution}
                  label="Activity"
                />
              </div>

              {/* Payment Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
            </div>
          </div>

          {/* Top Courses & Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Courses */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon
                  icon="mdi:book-open-page-variant"
                  className="text-blue-600"
                />
                Top Courses
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                        Course
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                        Revenue
                      </th>
                      <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.top_courses?.map((course, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-2">
                          <span className="font-medium text-sm text-slate-800">
                            {course.name}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                          {formatCurrency(course.revenue)}
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          {course.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Activities */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon icon="mdi:run-fast" className="text-pink-600" />
                Top Activities
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                        Activity
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-slate-600">
                        Revenue
                      </th>
                      <th className="text-center py-3 px-2 text-xs font-semibold text-slate-600">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.top_activities?.map((activity, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-2">
                          <span className="font-medium text-sm text-slate-800">
                            {activity.name}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">
                          {formatCurrency(activity.revenue)}
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          {activity.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Customers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
          </div>
        </>
      )}
    </div>
  );
}

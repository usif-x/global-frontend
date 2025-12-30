"use client";

import InvoiceService from "@/services/invoiceService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Helper components for charts/visualizations
const ProgressBar = ({ label, value, total, color = "bg-cyan-500", subLabel }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600 font-semibold">{value} ({percentage.toFixed(1)}%)</span>
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
        <Icon icon={icon} className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
    </div>
  </div>
);

export default function InvoiceAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("all"); // 'all' or 'monthly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    fetchData();
    fetchTopCustomers();
  }, [period, selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let result;
      if (period === "all") {
        result = await InvoiceService.getDetailedSummaryAdmin();
      } else {
        result = await InvoiceService.getMonthlyAnalytics(selectedYear, selectedMonth);
      }
      setData(result);
    } catch (error) {
      console.error("Error fetching invoice analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const customers = await InvoiceService.getTopCustomers(10);
      setTopCustomers(customers || []);
    } catch (error) {
      console.error("Error fetching top customers:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  
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

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoice Analytics</h1>
          <p className="text-slate-500">Detailed financial insights and reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="all">All Time</option>
            <option value="monthly">Monthly</option>
          </select>

          {period === "monthly" && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}
          
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(data.total_revenue)}
              subValue={`${data.paid_count} paid invoices`}
              icon="mdi:cash-multiple"
              color="bg-green-500"
            />
            <StatCard
              title="Pending Amount"
              value={formatCurrency(data.pending_amount)}
              subValue={`${data.pending_count} pending invoices`}
              icon="mdi:cash-clock"
              color="bg-yellow-500"
            />
            <StatCard
              title="Avg Invoice Value"
              value={formatCurrency(data.average_invoice_amount)}
              subValue="Based on paid invoices"
              icon="mdi:chart-areaspline"
              color="bg-blue-500"
            />
            <StatCard
              title="Conversion Rate"
              value={`${data.conversion_rate || 0}%`}
              subValue={`${data.payment_success_rate || 0}% payment success`}
              icon="mdi:percent"
              color="bg-purple-500"
            />
          </div>

          {/* Breakdowns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon icon="mdi:airplane" className="text-cyan-600" />
                Revenue by Activity
              </h2>
              <div className="space-y-6">
                {data.activity_breakdown?.map((item) => (
                  <ProgressBar
                    key={item.activity}
                    label={item.activity_details?.[0]?.name || item.activity}
                    value={item.count}
                    total={data.total_invoices}
                    color={item.activity === 'Trip' ? 'bg-cyan-500' : 'bg-indigo-500'}
                    subLabel={`Revenue: ${formatCurrency(item.total_revenue)}`}
                  />
                ))}
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon icon="mdi:credit-card-outline" className="text-green-600" />
                Payment Methods
              </h2>
              <div className="space-y-6">
                {data.payment_method_breakdown?.map((item) => (
                  <ProgressBar
                    key={item.payment_method}
                    label={item.payment_method}
                    value={item.count}
                    total={data.total_invoices}
                    color="bg-green-500"
                    subLabel={`Success Rate: ${item.success_rate}%`}
                  />
                ))}
              </div>
            </div>

            {/* Invoice Type Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon icon="mdi:file-compare" className="text-orange-600" />
                Invoice Types
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {data.invoice_type_breakdown?.map((item) => (
                  <div key={item.invoice_type} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon 
                        icon={item.invoice_type === 'online' ? 'mdi:web' : 'mdi:cash'} 
                        className="text-slate-500"
                      />
                      <span className="font-semibold text-slate-700 capitalize">{item.invoice_type}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{item.count}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(item.total_revenue)}</p>
                    <div className="mt-2 text-xs text-slate-400">
                      {item.paid_count} Paid • {item.pending_count} Pending
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup & Confirmation Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon icon="mdi:checkbox-marked-circle-outline" className="text-pink-600" />
                Operational Status
              </h2>
              <div className="space-y-6">
                {/* Confirmation Status */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">Confirmed Invoices</span>
                    <span className="text-slate-600 font-bold">
                      {data.confirmed_invoices} / {data.total_invoices}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-500"
                      style={{ width: `${(data.confirmed_invoices / data.total_invoices) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pickup Status */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">Picked Up (Paid)</span>
                    <span className="text-slate-600 font-bold">
                      {data.picked_up_count} / {data.paid_count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-green-500"
                      style={{ width: data.paid_count > 0 ? `${(data.picked_up_count / data.paid_count) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div> 
        </>
      )}

      {/* Top Customers Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Icon icon="mdi:account-star" className="text-yellow-600" />
          Top Customers
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Invoices</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topCustomers.map((customer, idx) => (
                <tr key={customer.user_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800">{customer.buyer_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{customer.buyer_email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                      {customer.paid_invoices} Paid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {formatCurrency(customer.total_spent)}
                  </td>
                </tr>
              ))}
              {topCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No customer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

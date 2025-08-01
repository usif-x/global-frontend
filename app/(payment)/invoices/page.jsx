"use client";
import Input from "@/components/ui/Input";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getData } from "/lib/axios";

const InvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const router = useRouter();

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await getData("/invoices");
        setInvoices(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter and sort invoices
  const filteredAndSortedInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customer_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customer_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "amount_desc":
          return (b.total_amount || 0) - (a.total_amount || 0);
        case "amount_asc":
          return (a.total_amount || 0) - (b.total_amount || 0);
        default:
          return 0;
      }
    });

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
      month: "short",
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

  // Invoice Card Component
  const InvoiceCard = ({ invoice }) => (
    <div
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
      onClick={() => router.push(`/invoices/${invoice.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            #{invoice.invoice_number || invoice.id}
          </h3>
          <p className="text-gray-600 text-sm">
            {invoice.customer_name || "Customer"}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            invoice.status
          )}`}
        >
          <div className="flex items-center space-x-1">
            <Icon icon={getStatusIcon(invoice.status)} width={12} height={12} />
            <span className="capitalize">{invoice.status || "pending"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm flex items-center">
            <Icon icon="mdi:calendar" className="mr-2" width={16} height={16} />
            {formatDate(invoice.created_at)}
          </span>
          <span className="text-gray-600 text-sm flex items-center">
            <Icon
              icon="mdi:calendar-clock"
              className="mr-2"
              width={16}
              height={16}
            />
            Due: {formatDate(invoice.due_date)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-gray-600 text-sm">Total Amount</span>
          <span className="text-xl font-bold text-gray-800">
            {formatCurrency(invoice.total_amount, invoice.currency)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-gray-500 text-xs">
          {invoice.items_count || 0} item
          {(invoice.items_count || 0) !== 1 ? "s" : ""}
        </span>
        <Icon
          icon="mdi:chevron-right"
          className="text-gray-400"
          width={20}
          height={20}
        />
      </div>
    </div>
  );

  // Summary Stats Component
  const SummaryStats = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "pending"
    ).length;
    const totalAmount = invoices.reduce(
      (sum, inv) => sum + (inv.total_amount || 0),
      0
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalInvoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Icon
                icon="mdi:file-document-multiple"
                className="text-blue-600"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {paidInvoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Icon
                icon="mdi:check-circle"
                className="text-green-600"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingInvoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Icon
                icon="mdi:clock-outline"
                className="text-yellow-600"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Icon
                icon="mdi:currency-usd"
                className="text-purple-600"
                width={24}
                height={24}
              />
            </div>
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
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <Icon
                icon="mdi:alert-circle"
                className="text-red-500 mx-auto mb-4"
                width={48}
                height={48}
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Invoices
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Invoices
              </h1>
              <p className="text-gray-600">Manage and track your invoices</p>
            </div>
            <button
              onClick={() => router.push("/invoices/create")}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <Icon icon="mdi:plus" width={20} height={20} />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* Summary Stats */}
          <SummaryStats />

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  icon="mdi:magnify"
                  name="search"
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="blue"
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Highest Amount</option>
                  <option value="amount_asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Grid */}
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-16">
            <Icon
              icon="mdi:file-document-outline"
              className="text-gray-400 mx-auto mb-4"
              width={64}
              height={64}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No invoices found"
                : "No invoices yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first invoice to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => router.push("/invoices/create")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
              >
                Create Your First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesListPage;

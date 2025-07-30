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
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-center text-red-500">Failed to load data.</p>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.users_count,
      icon: "mdi:account-group",
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats.active_users_count,
      icon: "mdi:account-check",
      color: "bg-green-500",
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users_count,
      icon: "mdi:account-off",
      color: "bg-gray-500",
    },
    {
      title: "Blocked Users",
      value: stats.blocked_users_count,
      icon: "mdi:account-lock",
      color: "bg-red-500",
    },
    {
      title: "Unblocked Users",
      value: stats.unblocked_users_count,
      icon: "mdi:account-arrow-up",
      color: "bg-blue-400",
    },
    {
      title: "Trips Count",
      value: stats.trips_count,
      icon: "mdi:airplane",
      color: "bg-yellow-500",
    },
    {
      title: "Packages Count",
      value: stats.packages_count,
      icon: "mdi:package-variant",
      color: "bg-purple-500",
    },
    {
      title: "Courses Count",
      value: stats.courses_count,
      icon: "mdi:book-open-page-variant",
      color: "bg-indigo-500",
    },
    {
      title: "Testimonials",
      value: stats.testimonials_count,
      icon: "mdi:comment-text",
      color: "bg-orange-400",
    },
    {
      title: "Accepted Testimonials",
      value: stats.accepted_testimonials_count,
      icon: "mdi:comment-check",
      color: "bg-green-600",
    },
    {
      title: "Unaccepted Testimonials",
      value: stats.unaccepted_testimonials_count,
      icon: "mdi:comment-remove",
      color: "bg-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportPDF}
          disabled={!isClient}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <Icon icon="mdi:file-pdf-box" className="inline-block w-5 h-5 mr-2" />
          Export as PDF
        </button>
      </div>

      {/* Dashboard to Export */}
      <div ref={exportRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;

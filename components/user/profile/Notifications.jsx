import { getData, postData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

// Icon mapping for different notification types
const NOTIFICATION_ICONS = {
  default: "mdi:bell-outline",
  new_invoice: "mdi:file-document-outline",
  course_update: "mdi:school-outline",
  new_message: "mdi:email-outline",
  payment_success: "mdi:check-decagram-outline",
};

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getData("users/me/notifications", true);
        setNotifications(response || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Could not load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Handler to mark a single notification as read
  const handleMarkAsRead = async (id) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.is_read) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await postData(`/notifications/${id}/read`, {}, true);
    } catch (err) {
      toast.error("Failed to update notification status.");
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: "icon",
        header: "",
        cell: ({ row }) => {
          const type = row.original.type;
          const IconComponent =
            NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
          return (
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                !row.original.is_read ? "bg-cyan-100" : "bg-gray-100"
              }`}
            >
              <Icon icon={IconComponent} className="h-5 w-5 text-cyan-600" />
            </div>
          );
        },
        size: 20,
      },
      {
        accessorKey: "message",
        header: "Notification",
        cell: ({ row }) => {
          const { link, message, created_at, is_read } = row.original;
          const timeAgo = formatDistanceToNow(new Date(created_at), {
            addSuffix: true,
          });
          return (
            <Link href={link || "#"} passHref>
              <span
                onClick={() => handleMarkAsRead(row.original.id)}
                className="cursor-pointer group"
              >
                <p
                  className={`text-sm group-hover:text-cyan-600 ${
                    is_read ? "text-gray-600" : "font-semibold text-gray-900"
                  }`}
                >
                  {message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
              </span>
            </Link>
          );
        },
      },
      {
        id: "status",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            {!row.original.is_read && (
              <div
                className="h-2.5 w-2.5 rounded-full bg-cyan-500"
                title="Unread"
              ></div>
            )}
          </div>
        ),
        size: 20,
      },
    ],
    []
  );

  // Create the table instance
  const table = useReactTable({
    data: notifications,
    columns,
    state: {
      globalFilter: filter === "unread" ? false : undefined, // Custom filter logic
    },
    // Custom row filtering logic
    getFilteredRowModel: getFilteredRowModel(),
    // We filter manually before passing data to the table for 'unread'
    globalFilterFn: (row, columnId, filterValue) => {
      if (filterValue === "unread") {
        return !row.original.is_read;
      }
      return true;
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Apply the 'unread' filter manually
  useEffect(() => {
    const filteredData =
      filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications;
    table.setPageSize(10);
    table.reset(); // Reset pagination and state
    // Tanstack table doesn't have a setData method, so we manage data externally
    // This is a common pattern for server-side or complex filtering
  }, [filter, notifications, table]);

  // The data to render depends on the active filter
  const filteredData = useMemo(() => {
    return filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;
  }, [filter, notifications]);

  // We need to re-initialize the table instance when the data changes
  const tableInstance = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-12 px-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <Icon
            icon="mdi:alert-circle"
            className="mx-auto h-12 w-12 text-red-500 mb-3"
          />
          <p className="font-medium">{error}</p>
        </div>
      );
    }
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl border border-slate-200">
          <Icon
            icon="mdi:bell-check-outline"
            className="mx-auto h-16 w-16 text-slate-400 mb-4"
          />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="text-sm text-slate-500">
            {filter === "unread"
              ? "You are all caught up!"
              : "We'll notify you here about important updates."}
          </p>
        </div>
      );
    }
    return (
      <div className="shadow-lg border border-slate-200/60 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <tbody className="bg-white divide-y divide-slate-100">
            {tableInstance.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`${
                  !row.original.is_read ? "bg-cyan-50/50" : ""
                } hover:bg-slate-50 transition-all duration-200`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
              <Icon icon="mdi:bell" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Notifications
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with your latest activities
              </p>
            </div>
          </div>
          {/* Filter buttons */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                filter === "unread"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {renderContent()}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-600">
            Page{" "}
            <strong className="text-slate-900">
              {tableInstance.getState().pagination.pageIndex + 1} of{" "}
              {tableInstance.getPageCount()}
            </strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => tableInstance.previousPage()}
              disabled={!tableInstance.getCanPreviousPage()}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon icon="mdi:chevron-left" className="w-5 h-5" />
            </button>
            <button
              onClick={() => tableInstance.nextPage()}
              disabled={!tableInstance.getCanNextPage()}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon icon="mdi:chevron-right" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;

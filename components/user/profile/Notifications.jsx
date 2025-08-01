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
        <div className="flex justify-center items-center py-20">...Loading</div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      );
    }
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Icon
            icon="mdi:bell-check-outline"
            className="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "unread"
              ? "You are all caught up!"
              : "We'll notify you here about important updates."}
          </p>
        </div>
      );
    }
    return (
      <div className="shadow border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {tableInstance.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`${
                  !row.original.is_read ? "bg-cyan-50" : ""
                } hover:bg-gray-50 transition-colors`}
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold leading-tight text-gray-900">
          Notifications
        </h2>
        {/* Filter buttons */}
        <div className="flex p-1 bg-gray-200 rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1 text-sm font-medium rounded-md ${
              filter === "all" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1 text-sm font-medium rounded-md ${
              filter === "unread" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {renderContent()}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-700">
            Page{" "}
            <strong>
              {tableInstance.getState().pagination.pageIndex + 1} of{" "}
              {tableInstance.getPageCount()}
            </strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => tableInstance.previousPage()}
              disabled={!tableInstance.getCanPreviousPage()}
              className="p-1 border rounded disabled:opacity-50"
            >
              <Icon icon="mdi:chevron-left" />
            </button>
            <button
              onClick={() => tableInstance.nextPage()}
              disabled={!tableInstance.getCanNextPage()}
              className="p-1 border rounded disabled:opacity-50"
            >
              <Icon icon="mdi:chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;

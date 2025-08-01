import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString.replace(" ", "T")).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for TanStack Table features
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // initial page index
    pageSize: 5, // initial page size
  });

  // Define table columns using TanStack Table's columnDef format
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Invoice ID",
        cell: (info) => `#${info.getValue()}`,
      },
      {
        accessorKey: "issue_date",
        header: "Date",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusClass =
            status === "paid"
              ? "bg-green-100 text-green-800"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800";
          return (
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <a
              href={row.original.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-900 inline-flex items-center gap-1 font-medium"
            >
              <Icon icon="mdi:download-circle-outline" className="h-5 w-5" />
              Download
            </a>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  // Fetch data on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await getData("/users/me/invoices", true);
        setInvoices(response || []);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setError("Could not load your invoices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Create the table instance
  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Render logic for loading, error, and empty states
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-6">
        My Invoices
      </h2>

      {invoices.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Icon
            icon="mdi:file-document-outline"
            className="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No invoices found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You do not have any invoices yet.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-1"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <Icon icon="mdi:arrow-up" className="h-4 w-4" />
                              ),
                              desc: (
                                <Icon
                                  icon="mdi:arrow-down"
                                  className="h-4 w-4"
                                />
                              ),
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            <div className="text-sm text-gray-700">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <Icon icon="mdi:page-first" />
              </button>
              <button
                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <button
                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button
                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <Icon icon="mdi:page-last" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="p-1 border rounded text-sm"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoicesTab;

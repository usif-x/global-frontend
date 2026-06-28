"use client";
import Input from "@/components/ui/Input";
import tripService from "@/services/tripService"; // your trip service
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

//-----------------------------------------------------------------
//  SKELETON LOADER
//-----------------------------------------------------------------
const TableSkeleton = () => (
  <div className="animate-pulse p-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 py-4 border-b border-slate-200"
      >
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

//-----------------------------------------------------------------
//  MAIN COMPONENT
//-----------------------------------------------------------------
const TransferZoneList = ({ onAdd, onEdit }) => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const data = await tripService.getTransferZones();
      setZones(data || []);
    } catch (error) {
      console.error("Error fetching transfer zones:", error);
      toast.error("Failed to load transfer zones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (zone) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete zone "${zone.name}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await tripService.deleteTransferZone(zone.id);
        toast.success("Zone deleted successfully!");
        fetchZones();
      } catch (error) {
        console.error("Error deleting zone:", error);
        toast.error("Failed to delete zone");
      }
    }
  };

  // Extract unique regions for filter dropdown
  const regionOptions = useMemo(() => {
    const regions = zones
      .map((z) => z.region)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return regions;
  }, [zones]);

  // Filter + search
  const filteredZones = useMemo(() => {
    let result = zones;

    if (filterRegion !== "all") {
      result = result.filter((z) => z.region === filterRegion);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (z) =>
          z.name?.toLowerCase().includes(search) ||
          z.region?.toLowerCase().includes(search),
      );
    }

    return result;
  }, [zones, searchTerm, filterRegion]);

  // Stats
  const statsData = useMemo(() => {
    return {
      total: zones.length,
      regions: regionOptions.length,
    };
  }, [zones, regionOptions]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Zone Name",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
              <Icon icon="mdi:map-marker" className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800">
                {row.original.name}
              </div>
              {row.original.region && (
                <span className="text-xs text-slate-500">
                  {row.original.region}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.region ? (
              <span className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium">
                {row.original.region}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-orange-100 hover:text-orange-600"
              title="Edit Zone"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
              title="Delete Zone"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit],
  );

  const table = useReactTable({
    data: filteredZones,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:map-marker-radius" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Transfer Zones
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage pickup/drop‑off zones for transfer pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Total Zones
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statsData.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50">
                <Icon icon="mdi:map-marker" className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Regions Covered
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statsData.regions}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <Icon icon="mdi:earth" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Filters & Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  name="search"
                  type="text"
                  placeholder="Search by zone name or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="cyan"
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="all">All Regions</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onAdd}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                  <span>Add Zone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredZones.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:map-marker-question"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Zones Found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || filterRegion !== "all"
                    ? "No zones match your search or filter."
                    : "Create your first transfer zone to start adding pickup costs."}
                </p>
                {(searchTerm || filterRegion !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRegion("all");
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto hover:shadow-lg transition-all"
                  >
                    <Icon icon="mdi:filter-remove" className="w-5 h-5" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none hover:bg-cyan-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            <Icon
                              icon={
                                header.column.getIsSorted() === "asc"
                                  ? "mdi:arrow-up"
                                  : header.column.getIsSorted() === "desc"
                                    ? "mdi:arrow-down"
                                    : "mdi:unfold-more-horizontal"
                              }
                              className="text-slate-400 w-4 h-4"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {!isLoading && filteredZones.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredZones.length} of {zones.length} zones
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferZoneList;

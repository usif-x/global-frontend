"use client";
import Input from "@/components/ui/Input";
import blogService from "@/services/blogService";
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

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// Thematic Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);

// Table Skeleton Loader
const TableSkeleton = ({ rows = 5 }) => (
  <div className="p-4 space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-200 to-blue-200"></div>
          <div className="flex-1 space-y-3">
            <div
              className={`h-4 rounded bg-slate-200 ${
                i % 2 === 0 ? "w-3/4" : "w-2/3"
              }`}
            ></div>
            <div className="h-3 rounded bg-slate-200 w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-16 rounded bg-slate-200"></div>
              <div className="h-8 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Format Date Helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString.replace(" ", "T")).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

//=================================================================
//  MAIN BLOG MANAGEMENT COMPONENT
//=================================================================
export default function BlogList({ onAdd, onEdit }) {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const blogsData = await blogService.getAll();
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blog) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await blogService.delete(blog.id);
        toast.success("Blog deleted successfully.");
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        toast.error("Failed to delete blog.");
      }
    }
  };

  const filteredBlogs = useMemo(() => {
    if (!searchTerm) return blogs;
    const search = searchTerm.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(search) ||
        blog.subject?.toLowerCase().includes(search) ||
        blog.tags?.some((tag) => tag.toLowerCase().includes(search))
    );
  }, [blogs, searchTerm]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const totalBlocks = blogs.reduce(
      (sum, blog) => sum + (blog.content?.length || 0),
      0
    );
    const totalImages = blogs.reduce(
      (sum, blog) =>
        sum +
        (blog.content?.filter((block) => block.type === "image").length || 0),
      0
    );
    const totalTags = new Set(blogs.flatMap((blog) => blog.tags || [])).size;
    return { total, totalBlocks, totalImages, totalTags };
  }, [blogs]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Blog Post",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
              <Icon icon="mdi:post" className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-slate-800">
                {row.original.title}
              </div>
              <div className="text-xs text-slate-500 line-clamp-1">
                {row.original.subject}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
              >
                <Icon icon="mdi:tag" className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {row.original.tags?.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                +{row.original.tags.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => {
          const textBlocks =
            row.original.content?.filter((block) => block.type === "text")
              .length || 0;
          const imageBlocks =
            row.original.content?.filter((block) => block.type === "image")
              .length || 0;
          return (
            <div className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700">
                <Icon icon="mdi:text-box" className="w-3 h-3" />
                {textBlocks} text
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700">
                <Icon icon="mdi:image" className="w-3 h-3" />
                {imageBlocks} img
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.created_at)}
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
              title="Edit Blog"
            >
              <Icon icon="mdi:pencil-outline" width={18} />
            </button>

            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-600"
              title="Delete Blog"
            >
              <Icon icon="mdi:delete-outline" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: filteredBlogs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:post" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Blog Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Create and manage blog posts.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Blogs",
              value: stats.total,
              icon: "mdi:post-outline",
              color: "cyan",
            },
            {
              title: "Content Blocks",
              value: stats.totalBlocks,
              icon: "mdi:text-box-multiple",
              color: "blue",
            },
            {
              title: "Images",
              value: stats.totalImages,
              icon: "mdi:image-multiple",
              color: "green",
            },
            {
              title: "Unique Tags",
              value: stats.totalTags,
              icon: "mdi:tag-multiple",
              color: "amber",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon
                    icon={stat.icon}
                    className={`w-6 h-6 text-${stat.color}-600`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Filters and Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  icon="mdi:magnify"
                  name="search"
                  type="text"
                  placeholder="Search blogs by title, subject, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="cyan"
                  className="w-full"
                />
              </div>
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                <span>Create Blog Post</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredBlogs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:post-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Blogs Found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm
                    ? "No blogs match your search criteria."
                    : "Create your first blog post to get started!"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto hover:shadow-lg transition-all"
                  >
                    <Icon icon="mdi:filter-remove" className="w-5 h-5" />
                    <span>Clear Search</span>
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
                              header.getContext()
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
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {!isLoading && filteredBlogs.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:information" className="w-4 h-4" />
                  <span>
                    Showing {filteredBlogs.length} of {blogs.length} blogs
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

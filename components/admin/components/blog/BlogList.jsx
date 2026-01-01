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
          const textBlocks = row.original.content?.filter(
            (block) => block.type === "text"
          ).length || 0;
          const imageBlocks = row.original.content?.filter(
            (block) => block.type === "image"
          ).length || 0;
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
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm"
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

  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get first image from content blocks
  const firstImage = blog.content?.find((block) => block.type === "image");
  const textBlocks =
    blog.content?.filter((block) => block.type === "text") || [];
  const imageBlocks =
    blog.content?.filter((block) => block.type === "image") || [];

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    onToggleDetails?.(blog.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.01]">
      {/* Blog Header with Image */}
      <div className="relative h-48 overflow-hidden">
        {firstImage && !imageError ? (
          <img
            src={firstImage.url}
            alt={firstImage.alt || blog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 flex items-center justify-center">
            <Icon icon="mdi:post" className="w-16 h-16 text-white/80" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white hover:text-blue-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Edit Blog"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Delete Blog"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>

        {/* Blog Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
            {blog.title}
          </h3>
        </div>
      </div>

      {/* Blog Content */}
      <div className="p-6">
        {/* Subject/Excerpt */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {blog.subject}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                className="flex items-center space-x-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                <Icon icon="mdi:tag" className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
            {blog.tags.length > 3 && (
              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                +{blog.tags.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Blog Stats */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon icon="mdi:text-box" className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">
              {textBlocks.length} text blocks
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon
              icon="mdi:image-multiple"
              className="w-4 h-4 text-slate-500"
            />
            <span className="text-slate-700">{imageBlocks.length} images</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon icon="mdi:clock-outline" className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700 text-xs">
              {formatDate(blog.created_at)}
            </span>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={toggleDetails}
          className="w-full flex items-center justify-center space-x-2 text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl py-3 px-4 transition-all duration-200 font-medium"
        >
          <span>
            {showDetails ? "Hide Content Preview" : "View Content Preview"}
          </span>
          <Icon
            icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="w-5 h-5 transition-transform duration-200"
          />
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                <Icon icon="mdi:eye" className="w-4 h-4 mr-2 text-cyan-600" />
                Content Preview
              </h4>
              <div className="space-y-4">
                {blog.content?.map((block, index) => (
                  <div
                    key={index}
                    className={`${
                      block.type === "image"
                        ? "bg-white rounded-lg p-3"
                        : "bg-white rounded-lg p-4"
                    }`}
                  >
                    {block.type === "text" ? (
                      <div className="prose prose-sm max-w-none">
                        <MarkdownRender content={block.content} />
                      </div>
                    ) : (
                      <div>
                        <img
                          src={block.url}
                          alt={block.alt || `Image ${index + 1}`}
                          className="w-full rounded-lg shadow-sm max-h-64 object-contain"
                        />
                        {block.caption && (
                          <p className="text-xs text-slate-600 mt-2 text-center italic">
                            {block.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* All Tags */}
            {blog.tags && blog.tags.length > 3 && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                  <Icon
                    icon="mdi:tag-multiple"
                    className="w-4 h-4 mr-2 text-amber-600"
                  />
                  All Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-1 bg-white border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      <Icon icon="mdi:tag" className="w-3 h-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                <Icon
                  icon="mdi:information"
                  className="w-4 h-4 mr-2 text-blue-600"
                />
                Metadata
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Created:</span>
                  <p className="text-slate-700 font-medium">
                    {formatDate(blog.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Updated:</span>
                  <p className="text-slate-700 font-medium">
                    {formatDate(blog.updated_at)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Blog ID:</span>
                  <p className="text-slate-700 font-medium">{blog.id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Content Blocks:</span>
                  <p className="text-slate-700 font-medium">
                    {blog.content?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//=================================================================
//  MAIN COMPONENT: BlogList
//=================================================================
const BlogList = ({ onAdd, onEdit }) => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);

  // Fetch blogs and tags
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const [blogsData, tagsData] = await Promise.all([
        blogService.getAll(),
        blogService.getAllTags().catch(() => []),
      ]);
      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
      setAllTags(tagsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs
  useEffect(() => {
    let filtered = [...blogs];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(search) ||
          blog.subject.toLowerCase().includes(search) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter((blog) => blog.tags?.includes(selectedTag));
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedTag, blogs]);

  // Delete blog
  const handleDelete = async (blog) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      return;
    }

    try {
      await blogService.delete(blog.id);
      toast.success("Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog.");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
  };

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:post" className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Blog Management</h1>
              <p className="text-cyan-100 mt-1">Create and manage blog posts</p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Icon icon="mdi:plus-circle" className="w-5 h-5" />
            <span>Create Blog Post</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Icon icon="mdi:post-outline" className="w-8 h-8 text-white" />
              <div>
                <p className="text-cyan-100 text-sm">Total Blogs</p>
                <p className="text-2xl font-bold text-white">{blogs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Icon icon="mdi:tag-multiple" className="w-8 h-8 text-white" />
              <div>
                <p className="text-cyan-100 text-sm">Total Tags</p>
                <p className="text-2xl font-bold text-white">
                  {allTags.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Icon icon="mdi:filter" className="w-8 h-8 text-white" />
              <div>
                <p className="text-cyan-100 text-sm">Filtered Results</p>
                <p className="text-2xl font-bold text-white">
                  {filteredBlogs.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blogs by title, subject, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <Icon
              icon="mdi:tag"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10"
            />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedTag) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-slate-600">Active filters:</span>
            {searchTerm && (
              <div className="flex items-center space-x-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                <span>Search: {searchTerm}</span>
                <button onClick={() => setSearchTerm("")}>
                  <Icon icon="mdi:close" className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedTag && (
              <div className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                <span>Tag: {selectedTag}</span>
                <button onClick={() => setSelectedTag("")}>
                  <Icon icon="mdi:close" className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
          <Icon
            icon="mdi:post-outline"
            className="w-20 h-20 text-slate-300 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {searchTerm || selectedTag ? "No blogs found" : "No blogs yet"}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || selectedTag
              ? "Try adjusting your filters or search terms"
              : "Create your first blog post to get started"}
          </p>
          {!searchTerm && !selectedTag && (
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Icon icon="mdi:plus-circle" className="w-5 h-5" />
              <span>Create Blog Post</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onEdit={() => onEdit(blog)}
              onDelete={() => handleDelete(blog)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;

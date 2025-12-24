import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Blog - Diving Stories & Adventures",
  description:
    "Explore diving stories, tips, and underwater adventures from around the world",
  keywords: "diving blog, underwater adventures, diving tips, scuba stories",
  robots: "index, follow",
  authors: [{ name: "Global Divers" }],
  openGraph: {
    title: "Blog - Diving Stories & Adventures",
    description:
      "Explore diving stories, tips, and underwater adventures from around the world",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Diving Stories & Adventures",
    description:
      "Explore diving stories, tips, and underwater adventures from around the world",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://topdivers.online/blog",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const BlogPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;

  // Get filter state from URL query parameters
  const searchTerm = resolvedSearchParams.search || "";
  const selectedTag = resolvedSearchParams.tag || "all";

  let blogs = [];
  let allTags = [];
  let fetchError = null;

  try {
    const [blogsData, tagsData] = await Promise.all([
      getData("/blogs/"),
      getData("/blogs/tags/all").catch(() => []),
    ]);
    blogs = blogsData || [];
    allTags = tagsData || [];
  } catch (err) {
    console.error("Error fetching blogs on server:", err);
    fetchError =
      "We're having trouble loading our blog posts. Please check your connection and try again.";
  }

  // Filter blogs based on search and tag
  const filteredBlogs = (() => {
    if (fetchError) return [];

    let filtered = blogs;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(search) ||
          blog.subject?.toLowerCase().includes(search) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Tag filter
    if (selectedTag && selectedTag !== "all") {
      filtered = filtered.filter((blog) => blog.tags?.includes(selectedTag));
    }

    return filtered;
  })();

  // Get first image from content blocks
  const getFirstImage = (blog) => {
    // First check featured image
    if (blog.featured_image) return blog.featured_image;

    // Then check content blocks
    const imageBlock = blog.content?.find((block) => block.type === "image");
    return imageBlock?.url || null;
  };

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="mdi:alert-circle-outline"
              className="w-10 h-10 text-red-500"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Blogs
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{fetchError}</p>
          <Link
            href="/"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Icon icon="mdi:post" className="w-12 h-12 text-white" />
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
              style={{ textShadow: "1px 1px 5px rgba(0,0,0,0.4)" }}
            >
              Diving Blog
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Discover underwater adventures, diving tips, and stories from the
              deep
            </p>
            <div className="flex items-center justify-center mt-8 text-white/90">
              <Icon icon="mdi:post-outline" className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {blogs.length} Blog Posts Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search blogs by title, subject, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Icon
                icon="mdi:tag"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10"
              />
              <select
                name="tag"
                defaultValue={selectedTag}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Apply Filters
            </button>
          </form>

          {/* Active Filters */}
          {(searchTerm || (selectedTag && selectedTag !== "all")) && (
            <div className="mt-4 flex items-center space-x-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  <span>Search: {searchTerm}</span>
                </div>
              )}
              {selectedTag && selectedTag !== "all" && (
                <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <span>Tag: {selectedTag}</span>
                </div>
              )}
              <Link
                href="/blog"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-indigo-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:post-outline"
                className="w-10 h-10 text-indigo-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchTerm || selectedTag !== "all"
                ? "No blogs found"
                : "No blog posts yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              {searchTerm || selectedTag !== "all"
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "We're working on creating amazing content for you. Check back soon!"}
            </p>
            {(searchTerm || selectedTag !== "all") && (
              <Link
                href="/blog"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-block"
              >
                View All Blogs
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => {
              const firstImage = getFirstImage(blog);
              const textBlocks =
                blog.content?.filter((block) => block.type === "text") || [];
              const imageBlocks =
                blog.content?.filter((block) => block.type === "image") || [];

              return (
                <Link
                  key={blog.id}
                  href={`/blog/${encodeURIComponent(blog.title)}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Blog Image */}
                  <div className="relative h-56 overflow-hidden">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon
                          icon="mdi:post"
                          className="w-16 h-16 text-white/80"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                            +{blog.tags.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Icon icon="mdi:calendar" className="w-4 h-4" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Icon icon="mdi:text-box" className="w-4 h-4" />
                          <span>{textBlocks.length}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon icon="mdi:image" className="w-4 h-4" />
                          <span>{imageBlocks.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="mt-4 flex items-center text-indigo-600 font-semibold group-hover:text-purple-600 transition-colors">
                      <span>Read More</span>
                      <Icon
                        icon="mdi:arrow-right"
                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Tags Section */}
      {allTags.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Icon
                icon="mdi:tag-multiple"
                className="w-6 h-6 mr-2 text-indigo-600"
              />
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-3">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200 hover:border-indigo-300 transition-all duration-200"
                >
                  <Icon icon="mdi:tag" className="w-4 h-4" />
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;

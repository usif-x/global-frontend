import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { getData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Generate metadata dynamically based on the blog
export async function generateMetadata({ params }) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  try {
    const blog = await getData(
      `/blogs/title/${encodeURIComponent(decodedTitle)}`
    );

    return {
      title: `${blog.title} - Blog`,
      description: blog.subject,
      keywords: blog.tags?.join(", ") || "diving, blog",
      robots: "index, follow",
      authors: [{ name: "Global Divers" }],
      openGraph: {
        title: blog.title,
        description: blog.subject,
        images: blog.featured_image ? [{ url: blog.featured_image }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.subject,
        images: blog.featured_image ? [blog.featured_image] : [],
      },
      icons: {
        icon: "/favicon.ico",
      },
    };
  } catch (error) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}

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

// Calculate reading time based on content
const calculateReadingTime = (content) => {
  if (!content) return 1;

  const textContent = content
    .filter((block) => block.type === "text")
    .map((block) => block.content)
    .join(" ");

  const wordsPerMinute = 200;
  const wordCount = textContent.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return minutes || 1;
};

const BlogDetailPage = async ({ params }) => {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  let blog;
  let relatedBlogs = [];

  try {
    // Fetch the blog post by title
    blog = await getData(`/blogs/title/${encodeURIComponent(decodedTitle)}`);

    // Try to fetch related blogs by tags
    if (blog.tags && blog.tags.length > 0) {
      try {
        const relatedByTag = await getData(
          `/blogs/tag/${blog.tags[0]}?limit=4`
        );
        // Filter out the current blog
        relatedBlogs = relatedByTag.filter((b) => b.id !== blog.id).slice(0, 3);
      } catch (error) {
        console.warn("Could not fetch related blogs:", error);
      }
    }
  } catch (error) {
    console.error(`Failed to fetch blog "${decodedTitle}":`, error.message);
    notFound();
  }

  const readingTime = calculateReadingTime(blog.content);
  const textBlocks =
    blog.content?.filter((block) => block.type === "text") || [];
  const imageBlocks =
    blog.content?.filter((block) => block.type === "image") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        {blog.featured_image && (
          <div className="absolute inset-0">
            <Image
              src={blog.featured_image}
              alt={blog.title}
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>
        )}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Back Button */}
          <div className="flex items-center mb-6">
            <Link
              href="/blog"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-200"
                >
                  <Icon icon="mdi:tag" className="w-3 h-3" />
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
          >
            {blog.title}
          </h1>

          {/* Subject/Excerpt */}
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 leading-relaxed">
            {blog.subject}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:calendar" className="w-5 h-5" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:clock-outline" className="w-5 h-5" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:text-box" className="w-5 h-5" />
              <span>{textBlocks.length} sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:image-multiple" className="w-5 h-5" />
              <span>{imageBlocks.length} images</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Content Blocks */}
          <div className="space-y-8">
            {blog.content?.map((block, index) => {
              if (block.type === "text") {
                return (
                  <div
                    key={index}
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 prose-strong:text-gray-900 prose-code:text-purple-600 prose-pre:bg-gray-900"
                  >
                    <MarkdownRenderer content={block.content} />
                  </div>
                );
              }

              if (block.type === "image") {
                return (
                  <div key={index} className="my-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={block.url}
                        alt={block.alt || `Blog image ${index + 1}`}
                        width={1200}
                        height={600}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    {block.caption && (
                      <p className="text-sm text-gray-600 text-center mt-3 italic">
                        {block.caption}
                      </p>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Share this post
                </h3>
                <div className="flex items-center space-x-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Share on Facebook"
                  >
                    <Icon icon="mdi:facebook" className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      blog.title
                    )}&url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    title="Share on Twitter"
                  >
                    <Icon icon="mdi:twitter" className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Icon icon="mdi:linkedin" className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Back to Blog */}
              <Link
                href="/blog"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                <span>Back to Blog</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <Icon
                icon="mdi:post-outline"
                className="w-8 h-8 mr-3 text-indigo-600"
              />
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => {
                const firstImage =
                  relatedBlog.featured_image ||
                  relatedBlog.content?.find((block) => block.type === "image")
                    ?.url;

                return (
                  <Link
                    key={relatedBlog.id}
                    href={`/blog/${encodeURIComponent(relatedBlog.title)}`}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={relatedBlog.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Icon
                            icon="mdi:post"
                            className="w-12 h-12 text-white/80"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedBlog.subject}
                      </p>
                      <div className="flex items-center text-indigo-600 font-medium mt-3 text-sm">
                        <span>Read More</span>
                        <Icon
                          icon="mdi:arrow-right"
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;

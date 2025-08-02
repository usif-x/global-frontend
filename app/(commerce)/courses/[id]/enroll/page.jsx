"use client";
import CourseService from "@/services/courseService";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import "plyr-react/plyr.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// Dynamically import Plyr to avoid SSR issues
const Plyr = dynamic(() => import("plyr-react"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});

const CourseContentPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedContent, setCompletedContent] = useState(new Set());
  const [mounted, setMounted] = useState(false);
  const plyrRef = useRef();

  // Ensure component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch course and content data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);

        // Try to fetch with content (for enrolled users)
        try {
          const courseWithContent = await CourseService.getByIdWithContent(id);
          setCourse(courseWithContent);
          // Sort contents by order
          const sortedContents = (courseWithContent.contents || []).sort(
            (a, b) => a.order - b.order
          );
          setContents(sortedContents);
          setIsEnrolled(true);

          // Set first content as current if available
          if (sortedContents.length > 0) {
            setCurrentContent(sortedContents[0]);
          }
        } catch (error) {
          // If content fetch fails, try basic course info
          const basicCourse = await CourseService.getById(id);
          setCourse(basicCourse);
          setIsEnrolled(false);
        }
      } catch (error) {
        toast.error("Failed to load course data");
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return null;

    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle content selection
  const handleContentSelect = (content) => {
    setCurrentContent(content);

    // Mark as completed when accessed
    setCompletedContent((prev) => new Set([...prev, content.id]));

    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle enrollment (placeholder - implement based on your enrollment system)
  const handleEnrollment = async () => {
    try {
      // Add your enrollment logic here (e.g., API call to enroll)
      toast.success("Enrollment successful! Redirecting...");
      // Refresh the page or redirect to enrollment success
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Enrollment failed. Please try again.");
    }
  };

  // Enhanced PDF viewer component
  const PDFViewer = ({ url, title, description }) => {
    const [pdfError, setPdfError] = useState(false);
    const [isEmbedded, setIsEmbedded] = useState(false);

    const handleViewPDF = () => {
      window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleEmbedToggle = () => {
      setIsEmbedded(!isEmbedded);
      setPdfError(false);
    };

    return (
      <div className="space-y-4">
        {/* PDF Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Icon
                  icon="mdi:file-pdf-box"
                  className="w-8 h-8 text-red-600"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="text-red-600 font-medium">PDF Document</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEmbedToggle}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isEmbedded
                    ? "bg-red-600 text-white"
                    : "bg-white text-red-600 border border-red-300 hover:bg-red-50"
                }`}
              >
                {isEmbedded ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                onClick={handleViewPDF}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Icon icon="mdi:open-in-new" className="w-5 h-5" />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>

          {description && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-red-100">
              <p className="text-gray-700">{description}</p>
            </div>
          )}
        </div>

        {/* PDF Embed */}
        {isEmbedded && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {!pdfError ? (
              <div className="relative">
                <iframe
                  src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[600px] border-0"
                  title={title}
                  onError={() => setPdfError(true)}
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleViewPDF}
                    className="bg-black/70 text-white p-2 rounded-lg hover:bg-black/80 transition-colors duration-200"
                    title="Open in new tab"
                  >
                    <Icon icon="mdi:open-in-new" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon
                  icon="mdi:alert-circle"
                  className="w-12 h-12 text-orange-500 mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Preview Not Available
                </h4>
                <p className="text-gray-600 mb-4">
                  This PDF cannot be previewed in the browser. Click the button
                  below to open it directly.
                </p>
                <button
                  onClick={handleViewPDF}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Open PDF Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* PDF Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Icon
              icon="mdi:download"
              className="w-8 h-8 text-blue-600 mx-auto mb-2"
            />
            <h4 className="font-medium text-gray-800 mb-1">Download</h4>
            <p className="text-sm text-gray-600 mb-3">Save to your device</p>
            <a
              href={url}
              download
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Download PDF
            </a>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Icon
              icon="mdi:printer"
              className="w-8 h-8 text-green-600 mx-auto mb-2"
            />
            <h4 className="font-medium text-gray-800 mb-1">Print</h4>
            <p className="text-sm text-gray-600 mb-3">Print the document</p>
            <button
              onClick={() => {
                const printWindow = window.open(url, "_blank");
                printWindow.onload = () => printWindow.print();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Print PDF
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Icon
              icon="mdi:share-variant"
              className="w-8 h-8 text-purple-600 mx-auto mb-2"
            />
            <h4 className="font-medium text-gray-800 mb-1">Share</h4>
            <p className="text-sm text-gray-600 mb-3">Copy link to share</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on type
  const renderContent = (content) => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Icon
              icon="mdi:book-open-page-variant"
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
            />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Select Content to Start Learning
            </h3>
            <p className="text-gray-500">
              Choose a lesson from the sidebar to begin
            </p>
          </div>
        </div>
      );
    }

    switch (content.content_type) {
      case "video":
        const videoId = extractYouTubeId(content.content_url);
        if (videoId && mounted) {
          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon
                    icon="mdi:play-circle"
                    className="w-6 h-6 text-red-600"
                  />
                  <span className="font-medium text-red-800">Video Lesson</span>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <Plyr
                    ref={plyrRef}
                    source={{
                      type: "video",
                      sources: [
                        {
                          src: videoId,
                          provider: "youtube",
                        },
                      ],
                    }}
                    options={{
                      controls: [
                        "play-large",
                        "play",
                        "progress",
                        "current-time",
                        "duration",
                        "mute",
                        "volume",
                        "settings",
                        "pip",
                        "fullscreen",
                      ],
                      youtube: {
                        noCookie: false,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        modestbranding: 1,
                      },
                      ratio: "16:9",
                    }}
                  />
                </div>
              </div>
              {content.description && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Icon
                      icon="mdi:information"
                      className="w-5 h-5 mr-2 text-blue-600"
                    />
                    About this video
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {content.description}
                  </p>
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <Icon
              icon="mdi:alert-circle"
              className="w-12 h-12 text-red-500 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Invalid Video URL
            </h3>
            <p className="text-red-600">
              The video URL provided is not valid or supported.
            </p>
          </div>
        );

      case "pdf":
        return (
          <PDFViewer
            url={content.content_url}
            title={content.title}
            description={content.description}
          />
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <Icon icon="mdi:text-box" className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-800">Text Content</span>
              </div>
              <div className="bg-white rounded-lg p-6 border border-green-100 shadow-sm">
                <div className="prose max-w-none">
                  {content.description ? (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {content.description}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Icon
                        icon="mdi:text-box-outline"
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      />
                      <p className="text-gray-500">No text content available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8 text-center">
              <div className="bg-yellow-100 rounded-full p-4 inline-block mb-6">
                <Icon icon="mdi:quiz" className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Interactive Quiz
              </h3>
              {content.description && (
                <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                  {content.description}
                </p>
              )}
              <div className="space-y-4">
                <button
                  onClick={() => window.open(content.content_url, "_blank")}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-3"
                >
                  <Icon icon="mdi:play-circle" className="w-6 h-6" />
                  <span>Start Quiz</span>
                </button>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                    <span>Unlimited time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:refresh" className="w-4 h-4" />
                    <span>Multiple attempts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon icon="mdi:music" className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Audio Content
                  </h3>
                  <p className="text-purple-600 font-medium">Listen to learn</p>
                </div>
              </div>

              {content.description && (
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-100">
                  <p className="text-gray-700">{content.description}</p>
                </div>
              )}

              <div className="bg-white rounded-lg p-6 border border-purple-100 shadow-sm">
                <audio
                  controls
                  className="w-full h-12"
                  style={{
                    filter:
                      "sepia(20%) saturate(70%) hue-rotate(315deg) brightness(95%) contrast(105%)",
                  }}
                >
                  <source src={content.content_url} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Icon
              icon="mdi:file-question"
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Unsupported Content Type
            </h3>
            <p className="text-gray-500">
              This content type is not yet supported
            </p>
          </div>
        );
    }
  };

  // Get content type icon
  const getContentIcon = (type) => {
    switch (type) {
      case "video":
        return "mdi:play-circle";
      case "pdf":
        return "mdi:file-pdf-box";
      case "text":
        return "mdi:text-box";
      case "quiz":
        return "mdi:quiz";
      case "audio":
        return "mdi:music";
      default:
        return "mdi:file";
    }
  };

  // Get content type color
  const getContentColor = (type) => {
    switch (type) {
      case "video":
        return "text-red-500";
      case "pdf":
        return "text-blue-500";
      case "text":
        return "text-green-500";
      case "quiz":
        return "text-yellow-500";
      case "audio":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <Icon
            icon="mdi:loading"
            className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600"
          />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Loading Course Content
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare your learning experience...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <Icon
            icon="mdi:alert-circle"
            className="w-16 h-16 text-red-500 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // If not enrolled, show enrollment page
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
                    <p className="text-blue-100 text-lg">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <Icon icon="mdi:clock-outline" className="w-5 h-5" />
                        <span>{course.course_duration} days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon icon="mdi:school" className="w-5 h-5" />
                        <span>{course.course_level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon icon="mdi:currency-usd" className="w-5 h-5" />
                        <span>${course.price}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <Icon icon="mdi:close" className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 inline-block mb-6">
                    <Icon icon="mdi:lock" className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Enroll to Access Content
                  </h2>
                  <p className="text-gray-600 mb-8">
                    You need to enroll in this course to access the learning
                    materials.
                  </p>

                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">
                      What's included:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                        <Icon
                          icon="mdi:play-circle"
                          className="w-6 h-6 text-green-500"
                        />
                        <span className="font-medium">Video lessons</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                        <Icon
                          icon="mdi:file-pdf-box"
                          className="w-6 h-6 text-green-500"
                        />
                        <span className="font-medium">
                          Downloadable resources
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                        <Icon
                          icon="mdi:quiz"
                          className="w-6 h-6 text-green-500"
                        />
                        <span className="font-medium">Interactive quizzes</span>
                      </div>
                      {course.has_certificate && (
                        <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                          <Icon
                            icon="mdi:certificate"
                            className="w-6 h-6 text-green-500"
                          />
                          <span className="font-medium">
                            Certificate of completion
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleEnrollment}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-3"
                  >
                    <Icon icon="mdi:school" className="w-6 h-6" />
                    <span>Enroll Now - ${course.price}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main course content interface
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Icon icon="mdi:menu" className="w-6 h-6" />
            </button>
            <div className="truncate">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {course.name}
              </h1>
              {currentContent && (
                <p className="text-sm text-gray-600 flex items-center space-x-2 truncate">
                  <Icon
                    icon={getContentIcon(currentContent.content_type)}
                    className={`w-4 h-4 flex-shrink-0 ${getContentColor(
                      currentContent.content_type
                    )}`}
                  />
                  <span className="truncate">{currentContent.title}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hidden sm:block">
              Progress: {completedContent.size}/{contents.length}
            </div>
            <button
              onClick={() => router.push("/courses")}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Close course"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-50 flex flex-col lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } w-80 shadow-lg lg:shadow-none`}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Course Content
              </h2>
              <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                {contents.length} items
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <ul>
              {contents.map((content, index) => {
                const isCompleted = completedContent.has(content.id);
                const isActive = currentContent?.id === content.id;

                return (
                  <li key={content.id}>
                    <button
                      onClick={() => handleContentSelect(content)}
                      className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 border ${
                        isActive
                          ? "bg-blue-100 border-blue-300 text-blue-800 font-semibold"
                          : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Icon
                        icon={getContentIcon(content.content_type)}
                        className={`w-5 h-5 flex-shrink-0 ${getContentColor(
                          content.content_type
                        )}`}
                      />
                      <span className="flex-1 truncate">{content.title}</span>
                      {isCompleted && (
                        <Icon
                          icon="mdi:check-circle"
                          className="w-5 h-5 text-green-500"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">
            {renderContent(currentContent)}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseContentPage;

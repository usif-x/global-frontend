"use client";
import CourseService from "@/services/courseService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. MAIN COMPONENT: CourseList
//=================================================================
const CourseList = ({ onEdit, onAdd }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await CourseService.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    try {
      setDeleteLoading(true);
      await CourseService.delete(selectedCourse.id);
      toast.success("Course deleted successfully!");
      setCourses(courses.filter((course) => course.id !== selectedCourse.id));
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error.message || "Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setSelectedCourse(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-slate-600">
            <div className="relative">
              <Icon
                icon="mdi:school"
                className="w-12 h-12 text-cyan-400 animate-bounce"
              />
              <div className="absolute inset-0 w-12 h-12 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Loading courses...</p>
              <p className="text-sm text-slate-500">Preparing the curriculum</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between p-8 border-b border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:school" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Course Management
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Icon
                      icon="mdi:book-open-page-variant-outline"
                      className="w-4 h-4"
                    />
                    <span>
                      {courses.length} Course{courses.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onAdd}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Icon icon="mdi:plus-circle" className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Create New Course</span>
            </button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="p-6">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="mdi:school-off"
                    className="w-12 h-12 text-slate-400"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:plus" className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No courses yet
              </h3>
              <p className="text-slate-500 mb-6 text-center max-w-sm">
                Start building your educational content by creating your first
                course.
              </p>
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:book-plus" className="w-5 h-5" />
                <span>Create First Course</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => onEdit(course)}
                  onDelete={() => openDeleteModal(course)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          course={selectedCourse}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
          isLoading={deleteLoading}
        />
      )}
    </>
  );
};

//=================================================================
//  2. SUB-COMPONENT: CourseCard (Updated for new schema)
//=================================================================
const CourseCard = ({ course, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasImages = course.images && course.images.length > 0;

  // Use course_level for color coding
  const levelColor = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };

  // Course type badge colors
  const typeColor = {
    Basic: "bg-blue-100 text-blue-700",
    Premium: "bg-purple-100 text-purple-700",
    Specialty: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        {hasImages && !imageError ? (
          <img
            src={course.images[0]}
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <Icon icon="mdi:school" className="w-16 h-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Course Type Badge */}
        {course.course_type && (
          <div className="absolute top-4 left-4">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                typeColor[course.course_type] || "bg-slate-100 text-slate-700"
              } bg-opacity-90`}
            >
              {course.course_type}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white hover:text-blue-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Edit Course"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Delete Course"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {course.name}
          </h3>
          <p className="text-white/90 text-sm line-clamp-2">
            {course.description}
          </p>
        </div>
      </div>

      {/* Course Details Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-cyan-600">${course.price}</p>
          </div>
          {course.course_level && (
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                levelColor[course.course_level] || "bg-slate-100 text-slate-700"
              }`}
            >
              {course.course_level}
            </div>
          )}
        </div>

        {/* Course Features */}
        <div className="flex flex-wrap gap-3 mb-4">
          {course.course_duration && (
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
              <Icon
                icon="mdi:clock-outline"
                className="w-4 h-4 text-slate-500"
              />
              <span className="text-slate-700">
                {course.course_duration} days
              </span>
            </div>
          )}

          {course.has_certificate && (
            <div className="flex items-center space-x-2 bg-green-100 rounded-lg px-3 py-2 text-sm">
              <Icon icon="mdi:certificate" className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Certificate</span>
            </div>
          )}

          {course.has_online_content && (
            <div className="flex items-center space-x-2 bg-purple-100 rounded-lg px-3 py-2 text-sm">
              <Icon
                icon="mdi:cloud-download"
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-purple-700">Online Content</span>
            </div>
          )}

          {hasImages && (
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
              <Icon
                icon="mdi:image-multiple"
                className="w-4 h-4 text-slate-500"
              />
              <span className="text-slate-700">
                {course.images.length} photos
              </span>
            </div>
          )}
        </div>

        {/* Expandable Details Button */}
        {((hasImages && course.images.length > 1) ||
          (course.has_online_content && course.contents?.length > 0)) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center space-x-2 text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl py-3 px-4 transition-all duration-200 font-medium"
          >
            <span>{showDetails ? "Hide Details" : "View Details"}</span>
            <Icon
              icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="w-5 h-5 transition-transform duration-200"
            />
          </button>
        )}

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
            {/* Certificate Details */}
            {course.has_certificate && course.certificate_type && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <Icon icon="mdi:certificate" className="w-5 h-5 mr-2" />
                  Certificate Information
                </h4>
                <p className="text-sm text-green-700">
                  Type: {course.certificate_type}
                </p>
              </div>
            )}

            {/* Online Content */}
            {course.has_online_content && course.contents?.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                  <Icon
                    icon="mdi:book-open-page-variant"
                    className="w-5 h-5 mr-2"
                  />
                  Course Content ({course.contents.length} items)
                </h4>
                <div className="space-y-2">
                  {course.contents.slice(0, 3).map((content, index) => (
                    <div
                      key={content.id || index}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-purple-800">
                          {content.title}
                        </p>
                        {content.description && (
                          <p className="text-purple-600 text-xs truncate">
                            {content.description}
                          </p>
                        )}
                      </div>
                      <div className="px-2 py-1 bg-purple-200/60 rounded text-xs text-purple-700 capitalize">
                        {content.content_type}
                      </div>
                    </div>
                  ))}
                  {course.contents.length > 3 && (
                    <div className="text-xs text-purple-600 text-center py-1">
                      +{course.contents.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {hasImages && course.images.length > 1 && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
                  <Icon icon="mdi:image-multiple" className="w-5 h-5 mr-2" />
                  Gallery
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {course.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${course.name} ${index + 2}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

//=================================================================
//  3. SUB-COMPONENT: DeleteModal
//=================================================================
const DeleteModal = ({ course, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 sm:mx-0">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Course
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  You're about to permanently delete:
                </p>
                <p className="font-semibold text-slate-800">"{course?.name}"</p>
                <div className="mt-2 text-xs text-slate-500">
                  <p>Type: {course?.course_type || "N/A"}</p>
                  <p>Level: {course?.course_level || "N/A"}</p>
                  {course?.has_online_content &&
                    course?.contents?.length > 0 && (
                      <p>Content items: {course.contents.length}</p>
                    )}
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>
          <div className="mt-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-base font-medium text-white hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Icon icon="mdi:delete" className="w-4 h-4 mr-2" />
                  Delete Course
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;

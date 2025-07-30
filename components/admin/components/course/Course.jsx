"use client";
import { useState } from "react";
import CourseForm from "./CourseForm";
import CourseList from "./CourseList";

const CourseManagement = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setCurrentView("add");
  };

  const handleEditCourse = (courseData) => {
    setSelectedCourse(courseData);
    setCurrentView("edit");
  };

  const handleSuccess = (courseData) => {
    // Course was successfully created or updated
    setCurrentView("list");
    setSelectedCourse(null);
    // The list will automatically refresh
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedCourse(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <CourseList onAdd={handleAddCourse} onEdit={handleEditCourse} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <CourseForm
          course={selectedCourse}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CourseManagement;

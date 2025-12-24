"use client";
import { useState } from "react";
import BlogForm from "./BlogForm";
import BlogList from "./BlogList";

const BlogManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'add', 'edit'
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleAddBlog = () => {
    setSelectedBlog(null);
    setCurrentView("add");
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setCurrentView("edit");
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedBlog(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedBlog(null);
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && (
        <BlogList onAdd={handleAddBlog} onEdit={handleEditBlog} />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <BlogForm
          blog={selectedBlog}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default BlogManagement;

"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import MarkdownRender from "@/components/ui/MarkdownRender";
import blogService from "@/services/blogService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER COMPONENTS
//=================================================================

// Content Block Component
const ContentBlock = ({
  block,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled,
}) => {
  const [localContent, setLocalContent] = useState(block.content || "");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setLocalContent(block.content || "");
  }, [block.content]);

  const handleContentChange = (value) => {
    setLocalContent(value);
    onUpdate(index, { ...block, content: value });
  };

  if (block.type === "image") {
    return (
      <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon icon="mdi:image" className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Image Block
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Move Up/Down */}
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={isFirst || disabled}
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Up"
            >
              <Icon icon="mdi:arrow-up" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={isLast || disabled}
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Down"
            >
              <Icon icon="mdi:arrow-down" className="w-4 h-4" />
            </button>
            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(index)}
              disabled={disabled}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
              title="Delete Block"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <div className="mb-4">
          <img
            src={block.url}
            alt={block.alt || "Blog image"}
            className="w-full rounded-lg shadow-md max-h-96 object-contain bg-white"
          />
        </div>

        {/* Image Details */}
        <div className="space-y-3">
          <Input
            label="Alt Text"
            icon="mdi:text"
            value={block.alt || ""}
            onChange={(e) => onUpdate(index, { ...block, alt: e.target.value })}
            placeholder="Describe the image for accessibility"
            color="purple"
            disabled={disabled}
          />
          <Input
            label="Caption (Optional)"
            icon="mdi:text-box"
            value={block.caption || ""}
            onChange={(e) =>
              onUpdate(index, { ...block, caption: e.target.value })
            }
            placeholder="Add a caption to display below the image"
            color="purple"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  // Text Block
  return (
    <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon icon="mdi:text-box" className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">
            Text Block
          </span>
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`ml-4 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              previewMode
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`}
          >
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {/* Move Up/Down */}
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst || disabled}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <Icon icon="mdi:arrow-up" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast || disabled}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <Icon icon="mdi:arrow-down" className="w-4 h-4" />
          </button>
          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(index)}
            disabled={disabled}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
            title="Delete Block"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Editor/Preview */}
      {previewMode ? (
        <div className="prose max-w-none bg-white rounded-lg p-4 shadow-inner">
          <MarkdownRender content={localContent} />
        </div>
      ) : (
        <MarkdownEditor
          value={localContent}
          onChange={handleContentChange}
          placeholder="Write your blog content here... Supports Markdown!"
          disabled={disabled}
        />
      )}
    </div>
  );
};

// Tag Input Component
const TagInput = ({ tags, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmedTag = inputValue.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Tags
      </label>
      <div className="space-y-3">
        {/* Tag Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                <Icon icon="mdi:tag" className="w-3 h-3" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={disabled}
                  className="hover:text-red-600 transition-colors"
                >
                  <Icon icon="mdi:close" className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tag Input */}
        <div className="flex space-x-2">
          <Input
            icon="mdi:tag-plus"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag (press Enter)"
            color="amber"
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim() || disabled}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

//=================================================================
//  MAIN COMPONENT: BlogForm
//=================================================================
const BlogForm = ({ blog = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    featured_image: "",
    content: [
      {
        type: "text",
        content: "",
      },
    ],
    tags: [],
  });

  // Populate form when editing
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        subject: blog.subject || "",
        featured_image: blog.featured_image || "",
        content: blog.content || [{ type: "text", content: "" }],
        tags: blog.tags || [],
      });
    }
  }, [blog]);

  // Handle basic field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Content block management
  const addTextBlock = () => {
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, { type: "text", content: "" }],
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload an image (JPG, PNG, GIF, BMP, or WEBP)."
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      setUploadingImage(true);
      const response = await blogService.uploadImage(file);

      // Add image block to content
      setFormData((prev) => ({
        ...prev,
        content: [
          ...prev.content,
          {
            type: "image",
            url: response.url,
            alt: file.name.split(".")[0].replace(/[-_]/g, " "),
            caption: "",
          },
        ],
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload an image (JPG, PNG, GIF, BMP, or WEBP)."
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      setUploadingFeaturedImage(true);
      const response = await blogService.uploadImage(file);

      // Set featured image URL
      setFormData((prev) => ({
        ...prev,
        featured_image: response.url,
      }));

      toast.success("Featured image uploaded successfully!");
    } catch (error) {
      console.error("Featured image upload error:", error);
      toast.error("Failed to upload featured image. Please try again.");
    } finally {
      setUploadingFeaturedImage(false);
      e.target.value = ""; // Reset file input
    }
  };

  const removeFeaturedImage = () => {
    setFormData((prev) => ({
      ...prev,
      featured_image: "",
    }));
    toast.info("Featured image removed.");
  };

  const updateContentBlock = (index, updatedBlock) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.map((block, i) =>
        i === index ? updatedBlock : block
      ),
    }));
  };

  const deleteContentBlock = (index) => {
    if (formData.content.length === 1) {
      toast.warning("You must have at least one content block.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const moveBlockUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newContent = [...prev.content];
      [newContent[index - 1], newContent[index]] = [
        newContent[index],
        newContent[index - 1],
      ];
      return { ...prev, content: newContent };
    });
  };

  const moveBlockDown = (index) => {
    if (index === formData.content.length - 1) return;
    setFormData((prev) => {
      const newContent = [...prev.content];
      [newContent[index], newContent[index + 1]] = [
        newContent[index + 1],
        newContent[index],
      ];
      return { ...prev, content: newContent };
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a blog title.");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter a blog subject/excerpt.");
      return;
    }
    if (formData.content.length === 0) {
      toast.error("Please add at least one content block.");
      return;
    }

    // Check if all text blocks have content
    const emptyTextBlocks = formData.content.filter(
      (block) => block.type === "text" && !block.content.trim()
    );
    if (emptyTextBlocks.length > 0) {
      toast.error("Please fill in all text blocks or remove empty ones.");
      return;
    }

    try {
      setIsLoading(true);

      const blogData = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        featured_image: formData.featured_image || null,
        content: formData.content,
        tags: formData.tags,
      };

      if (blog?.id) {
        await blogService.update(blog.id, blogData);
        toast.success("Blog updated successfully!");
      } else {
        await blogService.create(blogData);
        toast.success("Blog created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Blog submission error:", error);
      toast.error(
        error?.response?.data?.detail ||
          "Failed to save blog. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon icon="mdi:post" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {blog ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <p className="text-indigo-100 text-sm">
                {blog
                  ? "Update your blog content and settings"
                  : "Share your diving adventures and insights"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <Icon icon="mdi:close" className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="Blog Title"
            icon="mdi:format-title"
            name="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter a captivating title"
            required
            color="indigo"
            disabled={isLoading}
          />
          <Input
            label="Subject / Excerpt"
            icon="mdi:text-short"
            name="subject"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            placeholder="Brief description or excerpt (shown in blog list)"
            required
            color="indigo"
            disabled={isLoading}
          />
        </div>

        {/* Featured Image */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Featured Image (Hero Image)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            This image will be displayed as the main hero image with the title
            and subject
          </p>

          {formData.featured_image ? (
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
              <div className="flex items-start space-x-4">
                <img
                  src={formData.featured_image}
                  alt="Featured image preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Featured Image Set
                  </p>
                  <p className="text-xs text-slate-500 mb-3 break-all">
                    {formData.featured_image}
                  </p>
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    disabled={isLoading}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                    <span>Remove Featured Image</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                uploadingFeaturedImage || isLoading
                  ? "border-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadingFeaturedImage ? (
                  <>
                    <Icon
                      icon="mdi:loading"
                      className="w-12 h-12 text-indigo-500 mb-3 animate-spin"
                    />
                    <p className="text-sm font-medium text-indigo-600">
                      Uploading featured image...
                    </p>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="mdi:cloud-upload"
                      className="w-12 h-12 text-indigo-400 mb-3"
                    />
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      <span className="text-indigo-600">Click to upload</span>{" "}
                      featured image
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, GIF, BMP, or WEBP (Max 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                disabled={uploadingFeaturedImage || isLoading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Tags */}
        <TagInput
          tags={formData.tags}
          onChange={(tags) => handleChange("tags", tags)}
          disabled={isLoading}
        />

        {/* Content Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Content Blocks
            </label>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={addTextBlock}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg flex items-center space-x-2"
              >
                <Icon icon="mdi:text-box-plus" className="w-4 h-4" />
                <span>Add Text</span>
              </Button>
              <label
                className={`bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg flex items-center space-x-2 cursor-pointer ${
                  uploadingImage || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Icon
                  icon={uploadingImage ? "mdi:loading" : "mdi:image-plus"}
                  className={`w-4 h-4 ${uploadingImage ? "animate-spin" : ""}`}
                />
                <span>{uploadingImage ? "Uploading..." : "Add Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage || isLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Render Content Blocks */}
          <div className="space-y-4">
            {formData.content.map((block, index) => (
              <ContentBlock
                key={index}
                block={block}
                index={index}
                onUpdate={updateContentBlock}
                onDelete={deleteContentBlock}
                onMoveUp={moveBlockUp}
                onMoveDown={moveBlockDown}
                isFirst={index === 0}
                isLast={index === formData.content.length - 1}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:content-save" className="w-5 h-5" />
                <span>{blog ? "Update Blog" : "Create Blog"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;

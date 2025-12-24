import { deleteData, getData, postData, putData } from "@/lib/axios";

class BlogService {
  // Public endpoints (no auth)
  static async getAll(skip = 0, limit = 100) {
    return await getData(`/blogs/?skip=${skip}&limit=${limit}`);
  }

  static async getById(id) {
    return await getData(`/blogs/id/${id}`);
  }

  static async getByTitle(title) {
    return await getData(`/blogs/title/${encodeURIComponent(title)}`);
  }

  static async getByTag(tag, skip = 0, limit = 100) {
    return await getData(`/blogs/tag/${tag}?skip=${skip}&limit=${limit}`);
  }

  static async search(query, skip = 0, limit = 100) {
    return await getData(
      `/blogs/search/?q=${encodeURIComponent(
        query
      )}&skip=${skip}&limit=${limit}`
    );
  }

  static async getAllTags() {
    return await getData("/blogs/tags/all");
  }

  // Admin endpoints (auth required)
  static async create(data) {
    return await postData("/blogs/", data, true);
  }

  static async update(id, data) {
    return await putData(`/blogs/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/blogs/${id}`, true);
  }

  static async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    // Using postData with auth=true for authenticated image upload
    return await postData("/blogs/upload-image", formData, true);
  }
}

export default BlogService;

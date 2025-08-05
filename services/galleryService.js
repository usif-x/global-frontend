import { deleteData, getData, postData, putData } from "@/lib/axios";

class GalleryService {
  // Get all images (with pagination and optional search)
  async getAllImages({ skip = 0, limit = 12, search = null }) {
    let url = `/gallery?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return await getData(url, true);
  }

  // Upload a single image
  async uploadImage(file) {
    // Validate file before sending
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    const formData = new FormData();
    formData.append("file", file);

    // Don't set Content-Type header manually - let browser set it with boundary
    return await postData("/gallery/upload", formData, true);
  }

  // Update one image by ID
  async updateImage(imageId, data) {
    return await putData(`/gallery/${imageId}`, data, true);
  }

  // Delete one image by ID
  async deleteImage(imageId) {
    return await deleteData(`/gallery/${imageId}`, true);
  }

  // Delete all images
  async deleteAllImages() {
    return await deleteData("/gallery", true);
  }
}

export default new GalleryService();

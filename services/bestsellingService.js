import { deleteData, getData, postData, putData } from "@/lib/axios";

class BestSellingService {
  static async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await getData(
      `/best-selling/${queryString ? `?${queryString}` : ""}`
    );
  }

  static async create(data) {
    return await postData("/best-selling/", data, true);
  }

  static async getById(id) {
    return await getData(`/best-selling/${id}`);
  }

  static async update(id, data) {
    return await putData(`/best-selling/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/best-selling/${id}`, true);
  }

  static async getBestSellingCourses(limit = 10) {
    return await getData(`/best-selling/courses?limit=${limit}`);
  }

  static async getBestSellingTrips(limit = 10) {
    return await getData(`/best-selling/trips?limit=${limit}`);
  }

  static async reorderRankings(itemType = null) {
    const params = itemType ? `?item_type=${itemType}` : "";
    return await postData(`/best-selling/reorder${params}`, {}, true);
  }

  // Get courses for selection
  static async getCourses() {
    return await getData("/courses/");
  }

  // Get trips for selection
  static async getTrips() {
    return await getData("/trips/");
  }
}

export default BestSellingService;

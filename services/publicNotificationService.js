import { deleteData, getData, postData, putData } from "@/lib/axios";

/**
 * Service class for interacting with the Public Notifications API endpoints.
 */
class PublicNotificationService {
  /**
   * Fetches all public notifications.
   * Corresponds to: GET /public-notifications/
   */
  static async getAll(skip = 0, limit = 10) {
    return await getData(`/public-notifications/?skip=${skip}&limit=${limit}`);
  }

  /**
   * Fetches a single notification by its ID.
   * Corresponds to: GET /public-notifications/{id}
   */
  static async getById(id) {
    return await getData(`/public-notifications/${id}`);
  }

  /**
   * Creates a new public notification.
   * Requires admin authentication.
   * @param {object} data - The notification data to create.
   * Corresponds to: POST /public-notifications/
   */
  static async create(data) {
    return await postData("/public-notifications/", data);
  }

  /**
   * Updates an existing public notification.
   * Requires admin authentication.
   * @param {number} id - The ID of the notification to update.
   * @param {object} data - The updated notification data.
   * Corresponds to: PUT /public-notifications/{id}
   */
  static async update(id, data) {
    return await putData(`/public-notifications/${id}`, data);
  }

  /**
   * Deletes a public notification.
   * Requires admin authentication.
   * @param {number} id - The ID of the notification to delete.
   * Corresponds to: DELETE /public-notifications/{id}
   */
  static async delete(id) {
    return await deleteData(`/public-notifications/${id}`);
  }
}

export default PublicNotificationService;

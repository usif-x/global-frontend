import { deleteData, getData, postData, putData } from "@/lib/axios";

/**
 * Service class for interacting with the Course API endpoints.
 */
class CourseService {
  /**
   * Fetches all courses.
   * Corresponds to: GET /courses/
   */
  static async getAll() {
    return await getData("/courses/content");
  }

  /**
   * Fetches all courses with their content for a subscribed user.
   * Requires user authentication.
   * Corresponds to: GET /courses/content
   */
  static async getAllWithContents() {
    return await getData("/courses/content", true);
  }

  /**
   * Fetches a single course by its ID.
   * Corresponds to: GET /courses/{id}
   */
  static async getById(id) {
    return await getData(`/courses/${id}`);
  }

  /**
   * Fetches a single course with its content by ID for a subscribed user.
   * Requires user authentication.
   * Corresponds to: GET /courses/{id}/content
   */
  static async getByIdWithContent(id) {
    return await getData(`/courses/${id}/content`, true);
  }

  /**
   * Creates a new course.
   * Requires admin authentication.
   * @param {object} data - The course data to create.
   * Corresponds to: POST /courses/
   */
  static async create(data) {
    return await postData("/courses/", data, true);
  }

  /**
   * Updates an existing course by its ID.
   * Requires admin authentication.
   * @param {number|string} id - The ID of the course to update.
   * @param {object} data - The new data for the course.
   * Corresponds to: PUT /courses/{id}
   */
  static async update(id, data) {
    return await putData(`/courses/${id}`, data, true);
  }

  /**
   * Adds a list of contents to a specific course.
   * Requires admin authentication.
   * @param {number|string} courseId - The ID of the course.
   * @param {Array} contents - An array of content data to add.
   * Corresponds to: PUT /courses/{course_id}/content
   */
  static async addContents(courseId, contents) {
    return await putData(`/courses/${courseId}/content`, contents, true);
  }

  /**
   * Deletes a course by its ID.
   * Requires admin authentication.
   * @param {number|string} id - The ID of the course to delete.
   * Corresponds to: DELETE /courses/{id}
   */
  static async delete(id) {
    return await deleteData(`/courses/${id}`, true);
  }

  /**
   * Deletes all courses.
   * Requires admin authentication.
   * Corresponds to: DELETE /courses/delete-all
   */
  static async deleteAll() {
    return await deleteData("/courses/delete-all", true);
  }

  /**
   * Enrolls the currently logged-in user into a course.
   * Requires user authentication.
   * @param {number|string} courseId The ID of the course to enroll in.
   * Corresponds to: POST /courses/{course_id}/enroll
   */
  static async enrollInCourse(data) {
    // The second argument `null` is for the request body, which we don't need here.
    // The third argument `true` indicates that this is an authenticated request.
    return await postData(`/courses/enroll`, data, true);
  }
}

export default CourseService;

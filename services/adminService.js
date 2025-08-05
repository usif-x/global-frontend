import { deleteData, getData, postData, putData } from "@/lib/axios";

class AdminService {
  // Create a new admin
  static async registerAdmin(data) {
    return await postData("/auth/admin/register", data, true);
  }

  // Get all users
  static async getUsers() {
    return await getData("/admins/get-all-users", true);
  }

  static async getRecentUsers() {
    return await getData("/admins/get-recent-users", true);
  }

  // Get all admins
  static async getAdmins() {
    return await getData("/admins/get-all-admins", true);
  }

  // Update current admin
  static async updateAdmin(data) {
    return await putData("/admins/update", data, true);
  }

  // Update admin password (by id)
  static async updateAdminById(id, data) {
    return await putData(`/admins/update-admin/${id}`, data, true);
  }

  // Update current admin password
  static async updateAdminPassword(data) {
    return await putData("/admins/update/password", data, true);
  }

  // Update admin password by ID (alternative endpoint)
  static async updateAdminPasswordById(id, data) {
    return await putData(`/admins/update-admin/${id}/password`, data, true);
  }

  // Delete admin by ID
  static async deleteAdmin(id) {
    return await deleteData(`/admins/delete-admin/${id}`, true);
  }

  // Delete user by ID
  static async deleteUser(id) {
    return await deleteData(`/admins/delete-user/${id}`, true);
  }

  // Block user by ID
  static async blockUser(id) {
    return await getData(`/admins/block-user/${id}`, true);
  }

  // Unblock user by ID
  static async unblockUser(id) {
    return await getData(`/admins/unblock-user/${id}`, true);
  }

  // Edit user info by ID
  static async editUser(id, data) {
    return await putData(`/admins/edit-user/${id}`, data, true);
  }

  static async acceptTestimonial(id) {
    return await putData(`/admins/accept-testimonial/${id}`, {}, true);
  }

  // Reject testimonial by ID
  static async rejectTestimonial(id) {
    return await putData(`/admins/reject-testimonial/${id}`, {}, true);
  }

  // Get all testimonials
  static async getAllTestimonials() {
    return await getData("/admins/get-all-testimonials", true);
  }

  // Delete all testimonials
  static async deleteAllTestimonials() {
    return await deleteData("/admins/delete-all-testimonials", true);
  }

  // Get accepted testimonials
  static async getAcceptedTestimonials() {
    return await getData("/admins/get-accepted-testimonials", true);
  }

  // Get unaccepted testimonials
  static async getUnacceptedTestimonials() {
    return await getData("/admins/get-unaccepted-testimonials", true);
  }

  // Delete single testimonial by ID
  static async deleteTestimonial(id) {
    return await deleteData(`/admins/delete-testimonial/${id}`, true);
  }
}

export default AdminService;

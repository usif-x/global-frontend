import { deleteData, getData, postData, putData } from "@/lib/axios";

// services/PackageService.js or services/package.js

class PackageService {
  static async getAll() {
    return await getData("/packages/");
  }

  static async create(data) {
    return await postData("/packages/", data, true);
  }

  static async getById(id) {
    return await getData(`/packages/${id}`);
  }

  static async update(id, data) {
    return await putData(`/packages/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/packages/${id}`, true);
  }
  static async get() {
    return await getData("/packages/");
  }
}

export default PackageService;

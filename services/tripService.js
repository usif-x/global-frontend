import { deleteData, getData, postData, putData } from "@/lib/axios";

class TripService {
  static async getAll() {
    return await getData("/trips/");
  }
  static async getPackages() {
    return await getData("/packages/");
  }
  static async getById(id) {
    return await getData(`/trips/${id}`);
  }
  static async create(data) {
    return await postData("/trips/", data, true);
  }
  static async update(id, data) {
    return await putData(`/trips/${id}`, data, true);
  }
  static async delete(id) {
    return await deleteData(`/trips/${id}`, true);
  }
  static async getByPackageId(packageId) {
    return await getData(`/packages/${packageId}/trips`);
  }

  // NEW: Transfer zones
  static async getTransferZones() {
    return await getData("/transfer-zones/");
  }
  static async createTransferZone(data) {
    return await postData("/transfer-zones/", data, true);
  }
  static async updateTransferZone(id, data) {
    return await putData(`/transfer-zones/${id}`, data);
  }
  static async deleteTransferZone(id) {
    return await deleteData(`/transfer-zones/${id}`, true);
  }
}

export default TripService;

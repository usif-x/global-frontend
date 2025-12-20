import { deleteData, getData, postData, putData } from "@/lib/axios";

class CouponService {
  static async getAll(skip = 0, limit = 100) {
    return await getData(`/coupons/?skip=${skip}&limit=${limit}`);
  }

  static async getById(id) {
    return await getData(`/coupons/${id}`);
  }

  static async create(data) {
    return await postData("/coupons/", data, true);
  }

  static async update(id, data) {
    return await putData(`/coupons/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/coupons/${id}`, true);
  }

  static async apply(code) {
    return await postData("/coupons/apply", { code }, true);
  }

  static async getUsageStats() {
    return await getData("/coupons/stats/usage", true);
  }
}

export default CouponService;

import { getData } from "@/lib/axios";

class AnalyticsService {
  static async getAll() {
    return await getData("/analytics/all");
  }
}

export default AnalyticsService;

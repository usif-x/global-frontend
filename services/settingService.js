import { getData, putData } from "@/lib/axios";

class SettingService {
  static async get() {
    return await getData("/settings/");
  }

  static async update(data) {
    return await putData("/settings/", data, true); // true = Send auth data
  }
}

export default SettingService;

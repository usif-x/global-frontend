import { deleteData, getData, postData, putData } from "@/lib/axios";

class DiveCenterService {
  static async getAll() {
    return await getData(`/dive-centers/`);
  }

  static async getById(id) {
    return await getData(`/dive-centers/${id}`);
  }

  static async create(data) {
    return await postData("/dive-centers/", data, true);
  }

  static async update(id, data) {
    return await putData(`/dive-centers/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/dive-centers/${id}`, true);
  }
}

export default DiveCenterService;

import { deleteData, getData, postData, putData } from "@/lib/axios";

class CourseService {
  static async getAll() {
    return await getData("/courses/");
  }

  static async getById(id) {
    return await getData(`/courses/${id}`);
  }

  static async create(data) {
    return await postData("/courses/", data, true);
  }

  static async update(id, data) {
    return await putData(`/courses/${id}`, data, true);
  }

  static async delete(id) {
    return await deleteData(`/courses/${id}`, true);
  }
}

export default CourseService;

import { deleteData, getData, postData, putData } from "@/lib/axios";

const bundleService = {
  getAll: () => getData("/bundles/", true),
  getById: (id) => getData(`/bundles/${id}`, true),
  create: (payload) => postData("/bundles/", payload, true),
  update: (id, payload) => putData(`/bundles/${id}`, payload, true),
  delete: (id) => deleteData(`/bundles/${id}`, true),
  getUnlockedOffer: (tripId) => getData(`/bundles/unlocked/${tripId}`, true),
};

export default bundleService;

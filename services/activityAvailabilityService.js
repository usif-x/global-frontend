import { deleteData, getData, patchData, postData } from "@/lib/axios";

const ActivityAvailabilityService = {
  // Get all closures (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.activity_type)
      params.append("activity_type", filters.activity_type);
    if (filters.activity_id) params.append("activity_id", filters.activity_id);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    return await getData(`/activity-availability/?${params.toString()}`, true);
  },

  // Check if a specific date is available
  checkAvailability: async (activityType, activityId, date) => {
    const params = new URLSearchParams({
      activity_type: activityType,
      activity_id: activityId,
      date: date,
    });
    return await getData(
      `/activity-availability/check?${params.toString()}`,
      true
    );
  },

  // Close an activity date
  closeDate: async (data) => {
    return await postData("/activity-availability/close", data, true);
  },

  // Reopen an activity date
  reopenDate: async (activityType, activityId, date) => {
    const params = new URLSearchParams({
      activity_type: activityType,
      activity_id: activityId,
      date: date,
    });
    return await deleteData(
      `/activity-availability/reopen?${params.toString()}`,
      true
    );
  },

  // Update a closure
  update: async (id, data) => {
    return await patchData(`/activity-availability/${id}`, data, true);
  },

  // Manual cleanup
  cleanup: async () => {
    return await postData("/activity-availability/cleanup", {}, true);
  },
};

export default ActivityAvailabilityService;

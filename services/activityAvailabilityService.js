import { serverAxios } from "@/lib/server-axios";

const ActivityAvailabilityService = {
  // Get all closures (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.activity_type)
      params.append("activity_type", filters.activity_type);
    if (filters.activity_id) params.append("activity_id", filters.activity_id);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const response = await serverAxios.get(
      `/activity-availability/?${params.toString()}`
    );
    return response.data;
  },

  // Check if a specific date is available
  checkAvailability: async (activityType, activityId, date) => {
    const response = await serverAxios.get("/activity-availability/check", {
      params: {
        activity_type: activityType,
        activity_id: activityId,
        date: date,
      },
    });
    return response.data;
  },

  // Close an activity date
  closeDate: async (data) => {
    const response = await serverAxios.post(
      "/activity-availability/close",
      data
    );
    return response.data;
  },

  // Reopen an activity date
  reopenDate: async (activityType, activityId, date) => {
    const response = await serverAxios.delete("/activity-availability/reopen", {
      params: {
        activity_type: activityType,
        activity_id: activityId,
        date: date,
      },
    });
    return response.data;
  },

  // Update a closure
  update: async (id, data) => {
    const response = await serverAxios.patch(
      `/activity-availability/${id}`,
      data
    );
    return response.data;
  },

  // Manual cleanup
  cleanup: async () => {
    const response = await serverAxios.post("/activity-availability/cleanup");
    return response.data;
  },
};

export default ActivityAvailabilityService;

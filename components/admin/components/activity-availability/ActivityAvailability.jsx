"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ActivityAvailabilityService from "@/services/activityAvailabilityService";
import courseService from "@/services/courseService";
import tripService from "@/services/tripService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const ActivityAvailability = () => {
  const [closures, setClosures] = useState([]);
  const [trips, setTrips] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    activity_type: "trip",
    activity_id: "",
    date: "",
    reason: "",
  });

  const [filters, setFilters] = useState({
    activity_type: "",
    activity_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchClosures();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tripsData, coursesData, closuresData] = await Promise.all([
        tripService.getAll(),
        courseService.getAllWithContents(),
        ActivityAvailabilityService.getAll(),
      ]);
      setTrips(tripsData);
      setCourses(coursesData);
      setClosures(closuresData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClosures = async () => {
    try {
      const data = await ActivityAvailabilityService.getAll(filters);
      setClosures(data);
    } catch (error) {
      console.error("Error fetching closures:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.activity_id || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await ActivityAvailabilityService.closeDate(formData);
      toast.success("Date closed successfully");
      setShowForm(false);
      setFormData({
        activity_type: "trip",
        activity_id: "",
        date: "",
        reason: "",
      });
      fetchClosures();
    } catch (error) {
      console.error("Error closing date:", error);
      toast.error(error.response?.data?.detail || "Failed to close date");
    }
  };

  const handleReopen = async (closure) => {
    const result = await Swal.fire({
      title: "Reopen this date?",
      text: "This activity will be available again on this date",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#06b6d4",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, reopen it!",
    });

    if (result.isConfirmed) {
      try {
        await ActivityAvailabilityService.reopenDate(
          closure.activity_type,
          closure.activity_id,
          closure.date
        );
        toast.success("Date reopened successfully");
        fetchClosures();
      } catch (error) {
        console.error("Error reopening date:", error);
        toast.error("Failed to reopen date");
      }
    }
  };

  const handleCleanup = async () => {
    const result = await Swal.fire({
      title: "Run cleanup?",
      text: "This will delete all past closure records",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#06b6d4",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cleanup!",
    });

    if (result.isConfirmed) {
      try {
        const response = await ActivityAvailabilityService.cleanup();
        toast.success(response.message);
        fetchClosures();
      } catch (error) {
        console.error("Error running cleanup:", error);
        toast.error("Failed to run cleanup");
      }
    }
  };

  const getActivityName = (closure) => {
    if (closure.activity_type === "trip") {
      const trip = trips.find((t) => t.id === closure.activity_id);
      return trip?.name || `Trip #${closure.activity_id}`;
    } else {
      const course = courses.find((c) => c.id === closure.activity_id);
      return course?.name || `Course #${closure.activity_id}`;
    }
  };

  const activityOptions =
    formData.activity_type === "trip"
      ? trips
          .filter((trip) => trip && trip.name)
          .map((trip) => ({ value: trip.id, label: trip.name }))
      : courses
          .filter((course) => course && course.name)
          .map((course) => ({ value: course.id, label: course.name }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:calendar-remove" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Activity Availability
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage closed dates for trips and courses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCleanup}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <Icon icon="mdi:broom" className="w-5 h-5" />
                Cleanup
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Icon
                  icon={showForm ? "mdi:close" : "mdi:plus-circle"}
                  className="w-5 h-5"
                />
                <span>{showForm ? "Cancel" : "Close Date"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Icon icon="mdi:calendar-remove" className="text-cyan-600" />
              Close Activity Date
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Activity Type"
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={(option) => {
                    setFormData({
                      ...formData,
                      activity_type: option?.value || "",
                      activity_id: "",
                    });
                  }}
                  options={[
                    { value: "trip", label: "Trip" },
                    { value: "course", label: "Course" },
                  ]}
                  color="cyan"
                  required
                />
                <Select
                  label="Activity"
                  name="activity_id"
                  value={formData.activity_id}
                  onChange={(option) =>
                    setFormData({
                      ...formData,
                      activity_id: option?.value || "",
                    })
                  }
                  options={activityOptions}
                  color="cyan"
                  required
                />
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  color="cyan"
                  required
                />
                <Input
                  label="Reason (Optional)"
                  name="reason"
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., Maintenance day"
                  color="cyan"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Close Date
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Activity Type"
              name="filter_activity_type"
              value={filters.activity_type}
              onChange={(option) =>
                setFilters({
                  ...filters,
                  activity_type: option?.value || "",
                  activity_id: "",
                })
              }
              options={[
                { value: "", label: "All Types" },
                { value: "trip", label: "Trips Only" },
                { value: "course", label: "Courses Only" },
              ]}
              color="cyan"
            />
            {filters.activity_type && (
              <Select
                label="Filter by Activity"
                name="filter_activity_id"
                value={filters.activity_id}
                onChange={(option) =>
                  setFilters({ ...filters, activity_id: option?.value || "" })
                }
                options={[
                  { value: "", label: "All Activities" },
                  ...(filters.activity_type === "trip"
                    ? trips
                        .filter((trip) => trip && trip.name)
                        .map((trip) => ({
                          value: trip.id,
                          label: trip.name,
                        }))
                    : courses
                        .filter((course) => course && course.name)
                        .map((course) => ({
                          value: course.id,
                          label: course.name,
                        }))),
                ]}
                color="cyan"
              />
            )}
          </div>
        </div>

        {/* Closures List */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icon icon="mdi:calendar-clock" className="text-cyan-600" />
              Closed Dates ({closures.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {closures.length === 0 ? (
              <div className="p-12 text-center">
                <Icon
                  icon="mdi:calendar-check"
                  className="w-20 h-20 text-slate-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Closed Dates
                </h3>
                <p className="text-slate-500">
                  All activities are currently available
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {closures.map((closure, index) => (
                    <tr
                      key={closure.id}
                      className={`hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {getActivityName(closure)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            closure.activity_type === "trip"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          <Icon
                            icon={
                              closure.activity_type === "trip"
                                ? "mdi:airplane"
                                : "mdi:school"
                            }
                            className="w-3 h-3"
                          />
                          {closure.activity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(closure.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {closure.reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleReopen(closure)}
                          className="p-2 text-slate-500 rounded-full transition-all duration-200 hover:bg-green-100 hover:text-green-600"
                          title="Reopen Date"
                        >
                          <Icon icon="mdi:calendar-check" width={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityAvailability;

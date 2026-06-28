"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import tripService from "@/services/tripService"; // your trip service
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const TransferZoneForm = ({ zone, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    region: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name || "",
        region: zone.region || "",
      });
    }
  }, [zone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error("Zone name is required");
        setLoading(false);
        return;
      }

      const submitData = {
        name: formData.name.trim(),
        region: formData.region.trim() || null,
      };

      if (zone) {
        await tripService.updateTransferZone(zone.id, submitData);
        toast.success("Zone updated successfully!");
      } else {
        await tripService.createTransferZone(submitData);
        toast.success("Zone created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving zone:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to save zone. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Icon icon="mdi:map-marker-radius" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {zone ? "Edit Zone" : "Create New Zone"}
            </h2>
            <p className="text-sm text-slate-500">
              {zone
                ? "Update the transfer zone details"
                : "Add a new pickup/drop‑off zone (e.g. El Gouna, Sahl Hasheesh)"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Close"
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Zone Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Zone Name *
          </label>
          <Input
            icon="mdi:map-marker"
            name="name"
            type="text"
            placeholder="e.g. El Gouna, Sahl Hasheesh"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
            color="cyan"
          />
        </div>

        {/* Region (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Region (Optional)
          </label>
          <Input
            icon="mdi:earth"
            name="region"
            type="text"
            placeholder="e.g. North Coast, Red Sea"
            value={formData.region}
            onChange={handleChange}
            disabled={loading}
            color="cyan"
          />
          <p className="mt-1 text-xs text-slate-500">
            Group zones by region for easier management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            text="Cancel"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
          ></Button>
          <Button
            type="submit"
            disabled={loading}
            text={loading ? "Saving..." : zone ? "Update Zone" : "Create Zone"}
            icon={
              loading
                ? "mdi:loading"
                : zone
                  ? "mdi:content-save"
                  : "mdi:plus-circle"
            }
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          />
        </div>
      </form>
    </div>
  );
};

export default TransferZoneForm;

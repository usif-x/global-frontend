"use client";
import bundleService from "@/services/bundleService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BundleOfferForm from "./BundleOfferForm";

const AdminBundlesPage = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const data = await bundleService.getAll();
      setBundles(data || []);
    } catch (err) {
      toast.error("Failed to load bundle offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this bundle offer?")) return;
    try {
      await bundleService.delete(id);
      toast.success("Bundle offer deleted");
      loadBundles();
    } catch (err) {
      toast.error("Failed to delete bundle offer");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bundle Offers</h1>
          <p className="text-slate-600 mt-1">
            Reward customers for booking multiple trips together
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBundle(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <Icon icon="mdi:plus-circle" className="w-5 h-5" />
          New Bundle Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-amber-500"
          />
        </div>
      ) : bundles.length === 0 ? (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center">
          <Icon
            icon="mdi:gift-outline"
            className="w-12 h-12 text-slate-400 mx-auto mb-4"
          />
          <p className="text-slate-500">No bundle offers yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {bundle.name}
                  </h3>
                  {bundle.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {bundle.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bundle.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {bundle.is_active ? "Active" : "Paused"}
                </span>
              </div>

              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <strong>
                    {bundle.min_required_trips ||
                      bundle.required_trip_ids.length}
                  </strong>{" "}
                  of <strong>{bundle.required_trip_ids.length}</strong> trip(s)
                  required
                </p>
                <p>
                  Reward:{" "}
                  {bundle.discount_type === "free"
                    ? "Trip is free"
                    : bundle.discount_type === "percentage"
                      ? `${bundle.discount_value}% off`
                      : `EGP ${bundle.discount_value} off`}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingBundle(bundle);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:pencil" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(bundle.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:delete" className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <BundleOfferForm
              bundle={editingBundle}
              onSuccess={() => {
                setShowForm(false);
                loadBundles();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBundlesPage;

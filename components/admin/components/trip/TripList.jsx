"use client";
import tripService from "@/services/tripService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

// --- [NEW] Helper to format duration more nicely ---
const formatDuration = (duration) => {
  if (!duration && duration !== 0) return "N/A";
  if (duration === 1) return "1 day";
  if (duration > 1) return `${duration} days`;
  // Handle cases where duration might be in hours/minutes if needed in the future
  return `${duration} days`;
};

// Enhanced Trip Card Component
const TripCard = ({ trip, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  // --- [NEW] Logic for displaying the correct discount text ---
  const getDiscountText = () => {
    if (!trip.has_discount) return null;
    if (trip.discount_always_available) {
      return `${trip.discount_percentage}% OFF`;
    }
    if (trip.discount_requires_min_people) {
      return `Up to ${trip.discount_percentage}% OFF`;
    }
    return `${trip.discount_percentage}% OFF`;
  };
  const discountText = getDiscountText();

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Trip Image Header */}
      <div className="relative h-48 overflow-hidden">
        {trip.images && trip.images.length > 0 && !imageError ? (
          <img
            src={trip.images[0]}
            alt={trip.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <Icon icon="mdi:airplane" className="w-16 h-16 text-white/80" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* --- [FIX] Discount Badge now uses dynamic text --- */}
        {discountText && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Icon icon="mdi:gift-outline" className="w-4 h-4" />
            {discountText}
          </div>
        )}

        {/* --- [NEW] Child Not Allowed Badge --- */}
        {!trip.child_allowed && (
          <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Icon icon="lucide:user-x" className="w-3 h-3" />
            Adults Only
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* The right-4 on the child badge will push these over if it exists, so we adjust positioning logic if needed, but this works for now. */}
          <div
            className="flex space-x-2"
            style={{
              transform: !trip.child_allowed
                ? "translateX(-100px)"
                : "translateX(0)",
              transition: "transform 0.2s",
            }}
          >
            <button
              onClick={onEdit}
              className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white hover:text-blue-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
              title="Edit Trip"
            >
              <Icon icon="mdi:pencil" className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
              title="Delete Trip"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trip Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {trip.name}
          </h3>
          <p className="text-white/90 text-sm line-clamp-2">
            {trip.description
              .replace(/#|<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim()}
          </p>
        </div>
      </div>

      {/* Trip Details */}
      <div className="p-6">
        {/* Pricing & Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-cyan-700 mb-2">
              <Icon icon="mdi:account" className="w-4 h-4" />
              <span className="text-sm font-medium">Adult Price</span>
            </div>
            <p className="text-2xl font-bold text-cyan-600">
              {trip.adult_price.toFixed(0)} EGP
            </p>
          </div>
          <div
            className={`rounded-xl p-4 ${
              trip.child_allowed
                ? "bg-gradient-to-br from-purple-50 to-pink-50"
                : "bg-gray-100"
            }`}
          >
            <div
              className={`flex items-center space-x-2 mb-2 ${
                trip.child_allowed ? "text-purple-700" : "text-gray-500"
              }`}
            >
              <Icon icon="mdi:account-child" className="w-4 h-4" />
              <span className="text-sm font-medium">Child Price</span>
            </div>
            <p
              className={`text-2xl font-bold ${
                trip.child_allowed ? "text-purple-600" : "text-gray-400"
              }`}
            >
              {trip.child_allowed
                ? `${trip.child_price.toFixed(0)} EGP`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Trip Specs */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon icon="mdi:clock-outline" className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">
              {formatDuration(trip.duration)}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon icon="mdi:account-group" className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">Max {trip.maxim_person}</span>
          </div>
          {trip.images && trip.images.length > 1 && (
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
              <Icon
                icon="mdi:image-multiple"
                className="w-4 h-4 text-slate-500"
              />
              <span className="text-slate-700">
                {trip.images.length} photos
              </span>
            </div>
          )}
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center space-x-2 text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl py-3 px-4 transition-all duration-200 font-medium"
        >
          <span>{showDetails ? "Hide Details" : "View Details"}</span>
          <Icon
            icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="w-5 h-5 transition-transform duration-200"
          />
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
            {trip.included && trip.included.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                  <Icon icon="mdi:check-circle" className="w-5 h-5 mr-2" />
                  What's Included
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {trip.included.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start text-sm text-green-700"
                    >
                      <Icon
                        icon="mdi:check"
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {trip.not_included && trip.not_included.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                  <Icon icon="mdi:close-circle" className="w-5 h-5 mr-2" />
                  Not Included
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {trip.not_included.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start text-sm text-red-700"
                    >
                      <Icon
                        icon="mdi:close"
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {trip.terms_and_conditions &&
              trip.terms_and_conditions.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <Icon
                      icon="mdi:file-document-outline"
                      className="w-5 h-5 mr-2"
                    />
                    Terms & Conditions
                  </h4>
                  <div className="space-y-2">
                    {trip.terms_and_conditions.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm text-blue-700"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Delete Confirmation Modal
const DeleteModal = ({ trip, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 sm:mx-0">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Trip
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  You're about to permanently delete:
                </p>
                <p className="font-semibold text-slate-800">"{trip?.name}"</p>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>
          <div className="mt-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-base font-medium text-white hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Icon icon="mdi:delete" className="w-4 h-4 mr-2" />
                  Delete Trip
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TripList = ({ onEdit, onAdd }) => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripService.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading trips:", error);
      toast.error("Failed to load trips");
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrip) return;
    try {
      setDeleteLoading(true);
      await tripService.delete(selectedTrip.id);
      toast.success("Trip deleted successfully!");
      setTrips(trips.filter((trip) => trip.id !== selectedTrip.id));
      setShowDeleteModal(false);
      setSelectedTrip(null);
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error(error.message || "Failed to delete trip");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (trip) => {
    setSelectedTrip(trip);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTrip(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-slate-600">
            <div className="relative">
              <Icon
                icon="mdi:airplane"
                className="w-12 h-12 text-cyan-400 animate-bounce"
              />
              <div className="absolute inset-0 w-12 h-12 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Loading your adventures...</p>
              <p className="text-sm text-slate-500">Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between p-8 border-b border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:airplane-takeoff" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Trip Management
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Icon icon="mdi:map-marker-multiple" className="w-4 h-4" />
                    <span>
                      {trips.length} Trip{trips.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span className="text-sm text-slate-500">Trip Managment</span>
                </div>
              </div>
            </div>
            <button
              onClick={onAdd}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Icon icon="mdi:plus-circle" className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Create New Trip</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="mdi:airplane-off"
                    className="w-12 h-12 text-slate-400"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:plus" className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No trips yet
              </h3>
              <p className="text-slate-500 mb-6 text-center max-w-sm">
                Start planning your next adventure by creating your first trip
              </p>
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:rocket-launch" className="w-5 h-5" />
                <span>Plan Your First Trip</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onEdit={() => onEdit(trip)}
                  onDelete={() => openDeleteModal(trip)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          trip={selectedTrip}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
          isLoading={deleteLoading}
        />
      )}
    </>
  );
};

export default TripList;

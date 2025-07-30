"use client";
import PackageService from "@/services/packageService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. MAIN COMPONENT: PackageList
//=================================================================
const PackageList = ({ onEdit, onAdd }) => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const data = await PackageService.getAll();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading packages:", error);
      toast.error("Failed to load packages");
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPackage) return;
    try {
      setDeleteLoading(true);
      await PackageService.delete(selectedPackage.id);
      toast.success("Package deleted successfully!");
      setPackages(packages.filter((pkg) => pkg.id !== selectedPackage.id));
      setShowDeleteModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error(error.message || "Failed to delete package");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (packageData) => {
    setSelectedPackage(packageData);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setSelectedPackage(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-slate-600">
            <div className="relative">
              <Icon
                icon="mdi:package-variant-closed"
                className="w-12 h-12 text-cyan-400 animate-bounce"
              />
              <div className="absolute inset-0 w-12 h-12 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Loading your packages...</p>
              <p className="text-sm text-slate-500">Unpacking the details</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between p-8 border-b border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon
                  icon="mdi:package-variant-closed-check"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Package Management
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Icon icon="mdi:package" className="w-4 h-4" />
                    <span>
                      {packages.length} Package
                      {packages.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onAdd}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Icon icon="mdi:plus-circle" className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Create New Package</span>
            </button>
          </div>
        </div>

        {/* Package Grid */}
        <div className="p-6">
          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="mdi:package-variant-closed-remove"
                    className="w-12 h-12 text-slate-400"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:plus" className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No packages yet
              </h3>
              <p className="text-slate-500 mb-6 text-center max-w-sm">
                Get started by creating your first package to display here.
              </p>
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:package-plus" className="w-5 h-5" />
                <span>Add First Package</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  packageData={pkg}
                  onEdit={() => onEdit(pkg)}
                  onDelete={() => openDeleteModal(pkg)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          packageData={selectedPackage}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
          isLoading={deleteLoading}
        />
      )}
    </>
  );
};

//=================================================================
//  2. SUB-COMPONENT: PackageCard
//=================================================================
const PackageCard = ({ packageData, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasImages = packageData.images && packageData.images.length > 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        {hasImages && !imageError ? (
          <img
            src={packageData.images[0]}
            alt={packageData.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <Icon
              icon="mdi:package-variant"
              className="w-16 h-16 text-white/80"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white hover:text-blue-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Edit Package"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Delete Package"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>
        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {packageData.name}
          </h3>
          <p className="text-white/90 text-sm line-clamp-2">
            {packageData.description}
          </p>
        </div>
      </div>

      {/* Package Details */}
      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <Icon
              icon="mdi:image-multiple"
              className="w-4 h-4 text-slate-500"
            />
            <span className="text-slate-700">
              {packageData.images?.length || 0} photos
            </span>
          </div>
          {packageData.is_image_list && (
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-lg px-3 py-2 text-sm font-medium">
              <Icon icon="mdi:view-list" className="w-4 h-4" />
              <span>List View</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center space-x-2 text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl py-3 px-4 transition-all duration-200 font-medium"
        >
          <span>{showDetails ? "Hide Images" : "Show All Images"}</span>
          <Icon
            icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="w-5 h-5 transition-transform duration-200"
          />
        </button>

        {showDetails && hasImages && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                <Icon icon="mdi:image-multiple" className="w-5 h-5 mr-2" />
                Gallery ({packageData.images.length} photos)
              </h4>
              <div
                className={
                  packageData.is_image_list
                    ? "space-y-3"
                    : "grid grid-cols-3 gap-3"
                }
              >
                {packageData.images.map((image, index) => (
                  <div
                    key={index}
                    className={
                      packageData.is_image_list
                        ? "flex items-center space-x-3 bg-white/50 p-2 rounded-lg"
                        : "group relative aspect-square rounded-lg overflow-hidden"
                    }
                  >
                    <img
                      src={image}
                      alt={`${packageData.name} ${index + 1}`}
                      className={
                        packageData.is_image_list
                          ? "w-12 h-12 object-cover rounded-md flex-shrink-0"
                          : "w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {packageData.is_image_list && (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-700 truncate">
                          {image.split("/").pop()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//=================================================================
//  3. SUB-COMPONENT: DeleteModal
//=================================================================
const DeleteModal = ({ packageData, onConfirm, onCancel, isLoading }) => {
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
                Delete Package
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  You're about to permanently delete:
                </p>
                <p className="font-semibold text-slate-800">
                  "{packageData?.name}"
                </p>
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
                  Delete Package
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

export default PackageList;

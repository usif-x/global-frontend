"use client";
import BestSellingService from "@/services/bestsellingService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. MAIN COMPONENT: BestSellingList
//=================================================================
const BestSellingList = ({ onEdit, onAdd }) => {
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, course, trip
  const [reorderLoading, setReorderLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    loadBestSellingItems();
  }, [filter, pagination.page]);

  const loadBestSellingItems = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
      };

      if (filter !== "all") {
        params.item_type = filter;
      }

      const response = await BestSellingService.getAll(params);
      setBestSellingItems(Array.isArray(response.items) ? response.items : []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0,
      }));
    } catch (error) {
      console.error("Error loading best selling items:", error);
      toast.error("Failed to load best selling items");
      setBestSellingItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setDeleteLoading(true);
      await BestSellingService.delete(selectedItem.id);
      toast.success("Best selling item removed successfully!");
      setBestSellingItems((items) =>
        items.filter((item) => item.id !== selectedItem.id)
      );
      setShowDeleteModal(false);
      setSelectedItem(null);
      // Reload to update rankings
      loadBestSellingItems();
    } catch (error) {
      console.error("Error deleting best selling item:", error);
      toast.error(error.message || "Failed to remove best selling item");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReorder = async () => {
    try {
      setReorderLoading(true);
      const itemType = filter === "all" ? null : filter;
      await BestSellingService.reorderRankings(itemType);
      toast.success("Rankings reordered successfully!");
      loadBestSellingItems();
    } catch (error) {
      console.error("Error reordering rankings:", error);
      toast.error("Failed to reorder rankings");
    } finally {
      setReorderLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getItemName = (item) => {
    if (item.item_type === "course" && item.course) {
      return item.course.name;
    } else if (item.item_type === "trip" && item.trip) {
      return item.trip.name;
    }
    return `${item.item_type} #${item.item_id}`;
  };

  const getItemImage = (item) => {
    if (item.item_type === "course" && item.course?.images?.length > 0) {
      return item.course.images[0];
    } else if (item.item_type === "trip" && item.trip?.images?.length > 0) {
      return item.trip.images[0];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-slate-600">
            <div className="relative">
              <Icon
                icon="mdi:star-circle"
                className="w-12 h-12 text-amber-400 animate-bounce"
              />
              <div className="absolute inset-0 w-12 h-12 bg-amber-400/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Loading best sellers...</p>
              <p className="text-sm text-slate-500">Fetching top performers</p>
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
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5"></div>
          <div className="relative flex items-center justify-between p-8 border-b border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:star-circle" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Best Selling Items
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Icon icon="mdi:trophy" className="w-4 h-4" />
                    <span>
                      {pagination.total} Item{pagination.total !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Buttons */}
              <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
                {["all", "course", "trip"].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => {
                      setFilter(filterType);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === filterType
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {filterType === "all"
                      ? "All Items"
                      : `${
                          filterType.charAt(0).toUpperCase() +
                          filterType.slice(1)
                        }s`}
                  </button>
                ))}
              </div>

              {/* Reorder Button */}
              <button
                onClick={handleReorder}
                disabled={reorderLoading}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  icon={
                    reorderLoading
                      ? "mdi:loading"
                      : "mdi:sort-numeric-ascending"
                  }
                  className={`w-4 h-4 ${reorderLoading ? "animate-spin" : ""}`}
                />
                <span>Reorder</span>
              </button>

              {/* Add Button */}
              <button
                onClick={onAdd}
                className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Icon
                  icon="mdi:plus-circle"
                  className="w-5 h-5 relative z-10"
                />
                <span className="relative z-10">Add to Best Selling</span>
              </button>
            </div>
          </div>
        </div>

        {/* Best Selling Grid */}
        <div className="p-6">
          {bestSellingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="mdi:star-off"
                    className="w-12 h-12 text-slate-400"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:plus" className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No best selling items yet
              </h3>
              <p className="text-slate-500 mb-6 text-center max-w-sm">
                Start highlighting your top performers by adding them to the
                best selling list.
              </p>
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="mdi:star-plus" className="w-5 h-5" />
                <span>Add First Item</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bestSellingItems.map((item) => (
                  <BestSellingCard
                    key={item.id}
                    item={item}
                    onEdit={() => onEdit(item)}
                    onDelete={() => openDeleteModal(item)}
                    itemName={getItemName(item)}
                    itemImage={getItemImage(item)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {(pagination.page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.per_page,
                      pagination.total
                    )}{" "}
                    of {pagination.total} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                    </button>

                    {Array.from(
                      { length: pagination.total_pages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pagination.page === page
                            ? "bg-amber-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          item={selectedItem}
          itemName={getItemName(selectedItem)}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
          isLoading={deleteLoading}
        />
      )}
    </>
  );
};

//=================================================================
//  2. SUB-COMPONENT: BestSellingCard
//=================================================================
const BestSellingCard = ({ item, onEdit, onDelete, itemName, itemImage }) => {
  const [imageError, setImageError] = useState(false);

  const getRankingColor = (position) => {
    if (position === 1) return "from-yellow-400 to-yellow-600";
    if (position === 2) return "from-gray-300 to-gray-500";
    if (position === 3) return "from-amber-600 to-amber-800";
    return "from-slate-400 to-slate-600";
  };

  const getRankingIcon = (position) => {
    if (position <= 3) return "mdi:medal";
    return "mdi:numeric";
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Ranking Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-1">
        <div
          className={`flex items-center space-x-1 bg-gradient-to-r ${getRankingColor(
            item.ranking_position
          )} text-white px-3 py-1 rounded-full shadow-lg`}
        >
          <Icon
            icon={getRankingIcon(item.ranking_position)}
            className="w-4 h-4"
          />
          <span className="font-bold text-sm">#{item.ranking_position}</span>
        </div>
      </div>

      {/* Item Type Badge */}
      <div className="absolute top-4 right-24 z-20">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
            item.item_type === "course"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {item.item_type === "course" ? "Course" : "Trip"}
        </div>
      </div>

      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        {itemImage && !imageError ? (
          <img
            src={itemImage}
            alt={itemName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              item.item_type === "course"
                ? "from-blue-400 via-blue-500 to-blue-600"
                : "from-green-400 via-green-500 to-green-600"
            } flex items-center justify-center`}
          >
            <Icon
              icon={item.item_type === "course" ? "mdi:school" : "mdi:airplane"}
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
            title="Edit Best Selling Item"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
            title="Remove from Best Selling"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {itemName}
          </h3>
          <div className="flex items-center space-x-2 text-white/90 text-sm">
            <Icon icon="mdi:calendar" className="w-4 h-4" />
            <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Icon icon="mdi:identifier" className="w-4 h-4" />
            <span>ID: {item.item_id}</span>
          </div>
          <div className="flex items-center space-x-1 text-amber-600">
            <Icon icon="mdi:star" className="w-4 h-4" />
            <span className="text-sm font-medium">Best Seller</span>
          </div>
        </div>
      </div>
    </div>
  );
};

//=================================================================
//  3. SUB-COMPONENT: DeleteModal
//=================================================================
const DeleteModal = ({ item, itemName, onConfirm, onCancel, isLoading }) => {
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
                Remove from Best Selling
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  You're about to remove from best selling list:
                </p>
                <p className="font-semibold text-slate-800">"{itemName}"</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ranking position: #{item?.ranking_position} | Type:{" "}
                  {item?.item_type}
                </p>
              </div>
              <p className="text-sm text-amber-600 font-medium">
                ℹ️ This will remove the item from best selling but won't delete
                the original item
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
                  Removing...
                </>
              ) : (
                <>
                  <Icon icon="mdi:star-remove" className="w-4 h-4 mr-2" />
                  Remove from Best Selling
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellingList;

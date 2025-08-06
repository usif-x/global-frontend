// app/best-selling/page.jsx

import BestSellingService from "@/services/bestsellingService";
import { Icon } from "@iconify/react";
import BestSellingItemCard from "./BestSellingCard";

// **This function is key!** It transforms the complex API item into a simple, predictable object.
const normalizeApiItem = (apiItem) => {
  const isCourse = apiItem.item_type === "course";
  const itemData = isCourse ? apiItem.course : apiItem.trip;

  if (!itemData) return null; // Or handle as an error

  return {
    id: itemData.id,
    type: apiItem.item_type,
    name: itemData.name,
    description: itemData.description,
    image: itemData.images?.[0],
    price: isCourse ? itemData.price : itemData.adult_price,
    href: isCourse ? `/courses/${itemData.id}` : `/trips/${itemData.id}`,
    rank: apiItem.ranking_position,
  };
};

const BestSellingPage = async () => {
  let items = [];
  let fetchError = null;

  try {
    // Fetch all items from the paginated response
    const response = await BestSellingService.getAll({ per_page: 100 });

    // Normalize and sort the data
    items = response.items
      .map(normalizeApiItem)
      .filter(Boolean) // Remove any items that failed normalization
      .sort((a, b) => a.rank - b.rank);
  } catch (error) {
    console.error("Failed to fetch best-selling items:", error);
    fetchError =
      "We couldn't load our best sellers at the moment. Please try again later.";
  }

  return (
    <div className="min-h-screenbg-slate-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br ffrom-sky-600 from-sky-600 to-cyan-600 text-white">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/image/hero-pattern.png')] opacity-10" />

        {/* Decorative Icons */}
        <div className="absolute inset-0 opacity-10">
          <Icon
            icon="mdi:star"
            className="w-96 h-96 text-white/20 absolute top-10 -right-20 rotate-12"
          />
          <Icon
            icon="mdi:fire"
            className="w-32 h-32 text-white/10 absolute bottom-20 left-10 -rotate-12"
          />
          <Icon
            icon="mdi:thumb-up"
            className="w-24 h-24 text-white/10 absolute top-32 left-1/4 rotate-45"
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6 mt-6">
            <Icon icon="mdi:star-circle" className="w-4 h-4 inline mr-2" />
            Top Rated
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Community Best Sellers
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
            Discover the courses and trips that our customers love the most,
            ranked by popularity.
          </p>
        </div>
      </div>

      {/* Display Content or Error/Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center bg-white p-12 rounded-2xl shadow-md border border-red-200">
            <Icon
              icon="mdi:alert-circle-outline"
              className="w-16 h-16 text-red-500 mb-4"
            />
            <h3 className="text-xl font-semibold text-red-700">
              Oops! Something went wrong.
            </h3>
            <p className="text-slate-600 mt-2">{fetchError}</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Top Sellers
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our curated selection of popular courses and trips
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <BestSellingItemCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white p-12 rounded-2xl shadow-md border border-slate-200">
            <Icon
              icon="mdi:star-off-outline"
              className="w-16 h-16 text-slate-400 mb-4"
            />
            <h3 className="text-xl font-semibold text-slate-700">
              No Best Sellers Yet
            </h3>
            <p className="text-slate-600 mt-2">
              Check back soon to see our most popular items!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellingPage;

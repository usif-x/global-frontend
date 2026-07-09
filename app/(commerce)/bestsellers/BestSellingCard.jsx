// components/best-selling/BestSellingItemCard.jsx

import { getImageUrl } from "@/utils/imageUtils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const createSummary = (markdown, length = 120) => {
  if (!markdown) return "No description available.";

  const plainText = markdown
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/#+\s/g, "")
    .replace(/(\*|_|`)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length <= length
    ? plainText
    : plainText.substring(0, length).trim() + "...";
};

const BestSellingItemCard = ({ item }) => {
  // Get the actual data object
  const data = item.item_type === "course" ? item.course : item.trip;

  if (!data) return null;

  const isCourse = item.item_type === "course";

  const image = getImageUrl(data.images?.[0]) || "/placeholder-image.png";

  const badge = {
    color: isCourse
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800",
    icon: isCourse ? "mdi:school-outline" : "mdi:airplane-takeoff",
    label: isCourse ? "Course" : "Trip",
  };

  const rankColors = {
    1: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
    2: "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800",
    3: "bg-gradient-to-br from-amber-600 to-yellow-700 text-white",
  };

  const rankColor =
    rankColors[item.ranking_position] || "bg-slate-200 text-slate-700";

  return (
    <Link
      href={isCourse ? `/courses/${data.id}` : `/trips/${data.id}`}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-transparent hover:border-amber-300"
    >
      {/* Image */}
      <div className="relative h-52">
        <Image
          src={image}
          alt={data.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rank */}
        <div
          className={`absolute top-3 left-3 flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${rankColor}`}
        >
          <Icon icon="mdi:trophy" className="w-5 h-5" />
          <span className="absolute text-sm font-bold">
            {item.ranking_position}
          </span>
        </div>

        {/* Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${badge.color}`}
        >
          <Icon icon={badge.icon} className="w-4 h-4 mr-1.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
          {data.name}
        </h3>

        <p className="mt-2 text-sm text-slate-600 flex-grow">
          {createSummary(data.description)}
        </p>

        {data.duration && (
          <div className="mt-3 flex items-center text-xs text-slate-500">
            <Icon icon="mdi:clock-outline" className="w-4 h-4 mr-1" />
            <span>
              Duration: {data.duration} {data.duration_unit}
            </span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          {!isCourse && data.adult_price ? (
            <p className="text-xl font-extrabold text-slate-800">
              EGP {Number(data.adult_price).toFixed(2)}
              <span className="text-sm font-normal text-slate-500">
                {" "}
                / person
              </span>
            </p>
          ) : (
            <div />
          )}

          <div className="text-sm font-semibold text-amber-600 flex items-center">
            View {isCourse ? "Course" : "Trip"} Details
            <Icon
              icon="mdi:arrow-right"
              className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BestSellingItemCard;

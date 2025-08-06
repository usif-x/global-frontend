// components/best-selling/BestSellingItemCard.jsx

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

// A helper to create a plain-text summary from Markdown
const createSummary = (markdown, length = 120) => {
  if (!markdown) return "No description available.";
  const plainText = markdown
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/#+\s/g, "") // Remove markdown headers
    .replace(/(\*|_|`)/g, "") // Remove emphasis
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length).trim() + "...";
};

const BestSellingItemCard = ({ item }) => {
  const isCourse = item.type === "course";

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
  const rankColor = rankColors[item.rank] || "bg-slate-200 text-slate-700";

  return (
    <Link
      href={item.href}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-transparent hover:border-amber-300"
    >
      {/* Image Section */}
      <div className="relative h-52">
        <Image
          src={item.image || "/placeholder-image.jpg"}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Ranking Badge */}
        <div
          className={`absolute top-3 left-3 flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${rankColor}`}
        >
          <Icon icon="mdi:trophy" className="w-5 h-5" />
          <span className="absolute text-sm font-bold">{item.rank}</span>
        </div>
        {/* Type Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${badge.color}`}
        >
          <Icon icon={badge.icon} className="w-4 h-4 mr-1.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors duration-300">
          {item.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600 flex-grow">
          {createSummary(item.description)}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          {item.price ? (
            <p className="text-xl font-extrabold text-slate-800">
              ${parseFloat(item.price).toFixed(2)}
              <span className="text-sm font-normal text-slate-500">
                {" "}
                / person
              </span>
            </p>
          ) : (
            <div />
          )}
          <div className="text-sm font-semibold text-amber-600 flex items-center">
            Learn More
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

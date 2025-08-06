// types/bestSelling.js
export const ItemType = {
  COURSE: "course",
  TRIP: "trip",
};

export const ItemTypeLabels = {
  [ItemType.COURSE]: "Course",
  [ItemType.TRIP]: "Trip",
};

export const ItemTypeIcons = {
  [ItemType.COURSE]: "mdi:school",
  [ItemType.TRIP]: "mdi:airplane",
};

export const ItemTypeColors = {
  [ItemType.COURSE]: {
    primary: "blue",
    gradient: "from-blue-400 to-blue-600",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  [ItemType.TRIP]: {
    primary: "green",
    gradient: "from-green-400 to-green-600",
    bg: "bg-green-100",
    text: "text-green-700",
  },
};

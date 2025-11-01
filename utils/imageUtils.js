// utils/imageUtils.js

/**
 * Constructs the full image URL from an image path
 * @param {string|null} imagePath - The image path from the API
 * @returns {string|null} - The full image URL or null if no path provided
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath;

  // Otherwise, construct the full URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";
  return `${apiUrl}/storage/images/${imagePath}`;
};

/**
 * Constructs full URLs for an array of image paths
 * @param {string[]|null} imagePaths - Array of image paths from the API
 * @returns {string[]} - Array of full image URLs
 */
export const getImageUrls = (imagePaths) => {
  if (!imagePaths || !Array.isArray(imagePaths)) return [];

  return imagePaths
    .filter((path) => path) // Remove null/undefined paths
    .map((path) => getImageUrl(path));
};

/**
 * Duration Formatter Utility
 * Formats duration number and duration_unit into user-friendly strings
 */

/**
 * Formats duration and duration_unit into a readable string
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit (e.g., "day/s", "hour/s", "week/s", "month/s")
 * @param {object} options - Formatting options
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, durationUnit, options = {}) => {
  const {
    showUnit = true, // Whether to show the unit
    shortFormat = false, // Use short format (e.g., "3d" instead of "3 days")
    capitalize = false, // Capitalize first letter
    pluralize = true, // Handle pluralization
    fallback = "Not specified", // Fallback text for invalid inputs
  } = options;

  // Validate inputs
  if (!duration || !durationUnit) {
    return fallback;
  }

  const durationNum = parseInt(duration, 10);
  if (isNaN(durationNum) || durationNum <= 0) {
    return fallback;
  }

  // Unit mapping for different formats
  const unitMap = {
    "hour/s": {
      singular: "hour",
      plural: "hours",
      short: "h",
    },
    "day/s": {
      singular: "day",
      plural: "days",
      short: "d",
    },
    "week/s": {
      singular: "week",
      plural: "weeks",
      short: "w",
    },
    "month/s": {
      singular: "month",
      plural: "months",
      short: "m",
    },
  };

  const unitInfo = unitMap[durationUnit];
  if (!unitInfo) {
    return fallback;
  }

  let result = durationNum.toString();

  if (showUnit) {
    if (shortFormat) {
      result += unitInfo.short;
    } else {
      const unitText =
        pluralize && durationNum > 1 ? unitInfo.plural : unitInfo.singular;
      result += ` ${unitText}`;
    }
  }

  if (capitalize && !shortFormat) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
};

/**
 * Formats duration with additional context
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit
 * @param {string} context - Additional context (e.g., "trip", "experience", "tour")
 * @returns {string} Formatted duration with context
 */
export const formatDurationWithContext = (
  duration,
  durationUnit,
  context = "trip"
) => {
  const formattedDuration = formatDuration(duration, durationUnit);

  if (formattedDuration === "Not specified") {
    return formattedDuration;
  }

  return `${formattedDuration} ${context}`;
};

/**
 * Get duration in different formats
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit
 * @returns {object} Object with different format options
 */
export const getDurationFormats = (duration, durationUnit) => {
  return {
    // Standard format: "3 days"
    standard: formatDuration(duration, durationUnit),

    // Short format: "3d"
    short: formatDuration(duration, durationUnit, { shortFormat: true }),

    // Capitalized: "3 Days"
    capitalized: formatDuration(duration, durationUnit, { capitalize: true }),

    // Short capitalized: "3D"
    shortCapitalized: formatDuration(duration, durationUnit, {
      shortFormat: true,
      capitalize: true,
    }),

    // Number only: "3"
    numberOnly: formatDuration(duration, durationUnit, { showUnit: false }),

    // With context: "3 days trip"
    withContext: formatDurationWithContext(duration, durationUnit),

    // Descriptive: "This is a 3 days experience"
    descriptive: `This is a ${formatDuration(
      duration,
      durationUnit
    )} experience`,
  };
};

/**
 * Convert duration to hours (useful for comparisons)
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit
 * @returns {number} Duration converted to hours
 */
export const durationToHours = (duration, durationUnit) => {
  const durationNum = parseInt(duration, 10);
  if (isNaN(durationNum) || durationNum <= 0) {
    return 0;
  }

  const hourMap = {
    "hour/s": 1,
    "day/s": 24,
    "week/s": 168, // 7 * 24
    "month/s": 720, // 30 * 24 (approximate)
  };

  return durationNum * (hourMap[durationUnit] || 0);
};

/**
 * Get duration category for filtering/grouping
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit
 * @returns {string} Duration category
 */
export const getDurationCategory = (duration, durationUnit) => {
  const totalHours = durationToHours(duration, durationUnit);

  if (totalHours === 0) return "unknown";
  if (totalHours < 4) return "short"; // Less than 4 hours
  if (totalHours < 24) return "half-day"; // 4-23 hours
  if (totalHours < 48) return "full-day"; // 1 day
  if (totalHours < 168) return "multi-day"; // 2-6 days
  if (totalHours < 720) return "week-long"; // 1-4 weeks
  return "extended"; // More than a month
};

/**
 * Format duration for different UI contexts
 * @param {number|string} duration - The duration number
 * @param {string} durationUnit - The duration unit
 * @param {string} uiContext - UI context ("card", "list", "detail", "badge")
 * @returns {string} Formatted duration for specific UI context
 */
export const formatDurationForUI = (
  duration,
  durationUnit,
  uiContext = "card"
) => {
  const contexts = {
    // For trip cards: "3d"
    card: () => formatDuration(duration, durationUnit, { shortFormat: true }),

    // For list items: "3 days"
    list: () => formatDuration(duration, durationUnit),

    // For detail pages: "3 Days"
    detail: () => formatDuration(duration, durationUnit, { capitalize: true }),

    // For badges: "3D"
    badge: () =>
      formatDuration(duration, durationUnit, {
        shortFormat: true,
        capitalize: true,
      }),

    // For tooltips: "This trip lasts 3 days"
    tooltip: () => `This trip lasts ${formatDuration(duration, durationUnit)}`,

    // For search results: "Duration: 3 days"
    search: () => `Duration: ${formatDuration(duration, durationUnit)}`,
  };

  return contexts[uiContext]
    ? contexts[uiContext]()
    : formatDuration(duration, durationUnit);
};

// Example usage and tests
export const exampleUsage = () => {
  console.log("=== Duration Formatter Examples ===");

  // Basic formatting
  console.log(formatDuration(1, "day/s")); // "1 day"
  console.log(formatDuration(3, "day/s")); // "3 days"
  console.log(formatDuration(2, "hour/s")); // "2 hours"
  console.log(formatDuration(1, "week/s")); // "1 week"

  // Short format
  console.log(formatDuration(3, "day/s", { shortFormat: true })); // "3d"
  console.log(formatDuration(5, "hour/s", { shortFormat: true })); // "5h"

  // Different UI contexts
  console.log(formatDurationForUI(3, "day/s", "card")); // "3d"
  console.log(formatDurationForUI(3, "day/s", "detail")); // "3 Days"
  console.log(formatDurationForUI(3, "day/s", "badge")); // "3D"

  // Get all formats
  console.log(getDurationFormats(3, "day/s"));

  // Duration conversion
  console.log(durationToHours(3, "day/s")); // 72
  console.log(getDurationCategory(3, "day/s")); // "multi-day"
};

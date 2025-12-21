/**
 * Invoice Helper Utilities
 *
 * These utilities help create properly formatted invoice payloads
 * that comply with backend validation requirements.
 *
 * @module utils/invoiceHelpers
 */

/**
 * Creates a trip booking invoice payload
 *
 * @param {Object} params - Trip booking parameters
 * @param {number} params.tripId - The ID of the trip
 * @param {string} params.tripName - The name of the trip
 * @param {Object} params.customerInfo - Customer information
 * @param {string} params.customerInfo.fullName - Customer's full name
 * @param {string} params.customerInfo.email - Customer's email
 * @param {string} params.customerInfo.phone - Customer's phone number
 * @param {string} params.customerInfo.nationality - Customer's nationality
 * @param {Object} params.bookingDetails - Booking details
 * @param {number} params.bookingDetails.adults - Number of adults (minimum 1)
 * @param {number} params.bookingDetails.children - Number of children (0 if not allowed)
 * @param {string} params.bookingDetails.preferredDate - Preferred trip date
 * @param {string} params.bookingDetails.hotelName - Hotel name
 * @param {string} params.bookingDetails.roomNumber - Room number
 * @param {string} params.bookingDetails.specialRequests - Special requests (optional)
 * @param {Object} params.paymentDetails - Payment details
 * @param {number} params.paymentDetails.amount - Total calculated amount
 * @param {string} params.paymentDetails.currency - Currency code (e.g., "EGP", "USD")
 * @param {string} params.paymentDetails.invoiceType - "online" or "cash"
 * @param {string|null} params.paymentDetails.couponCode - Promo code if applicable
 * @returns {Object} Formatted invoice payload ready for backend
 */
export function createTripInvoicePayload({
  tripId,
  tripName,
  customerInfo,
  bookingDetails,
  paymentDetails,
}) {
  const { fullName, email, phone, nationality } = customerInfo;
  const {
    adults,
    children,
    preferredDate,
    hotelName,
    roomNumber,
    specialRequests,
  } = bookingDetails;
  const { amount, currency, invoiceType, couponCode } = paymentDetails;

  // Validate required fields
  if (!tripId) throw new Error("tripId is required");
  if (!tripName) throw new Error("tripName is required");
  if (!fullName) throw new Error("Customer fullName is required");
  if (!email) throw new Error("Customer email is required");
  if (!phone) throw new Error("Customer phone is required");
  if (adults < 1) throw new Error("At least 1 adult is required");
  if (!preferredDate) throw new Error("preferredDate is required");
  if (!amount) throw new Error("amount is required");
  if (!currency) throw new Error("currency is required");
  if (!invoiceType) throw new Error("invoiceType is required");

  const peopleCount = adults + children;
  const bookingTime = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const invoiceDescription = `Trip Booking: ${tripName}
Customer: ${fullName}
Nationality: ${nationality}
Payment Currency: ${currency}
Date of Trip: ${formatDate(preferredDate)}
Guests: ${adults} Adult(s), ${children} Child(ren) - Total ${peopleCount}.
Hotel: ${hotelName}, Room #${roomNumber}.
Booking placed on: ${bookingTime}.
Special Requests: ${specialRequests || "None"}`;

  return {
    // Customer Information
    buyer_name: fullName,
    buyer_email: email,
    buyer_phone: phone,
    invoice_description: invoiceDescription,

    // Activity Type - REQUIRED for backend validation
    activity: "trip",
    activity_type: "trip",

    // REQUIRED: Trip-specific fields for backend price calculation
    trip_id: parseInt(tripId),
    adults: parseInt(adults),
    children: parseInt(children),

    // Activity Details (for records/display)
    activity_details: [
      {
        name: tripName,
        activity_date: preferredDate,
        adults: parseInt(adults),
        children: parseInt(children),
        hotel_name: hotelName,
        room_number: roomNumber,
        special_requests: specialRequests || "",
      },
    ],

    // Payment Details
    picked_up: false,
    amount: parseFloat(amount),
    currency: currency,
    invoice_type: invoiceType,
    coupon_code: couponCode || null,
  };
}

/**
 * Creates a course enrollment invoice payload
 *
 * @param {Object} params - Course enrollment parameters
 * @param {number} params.courseId - The ID of the course
 * @param {string} params.courseName - The name of the course
 * @param {Object} params.customerInfo - Customer information
 * @param {string} params.customerInfo.fullName - Customer's full name
 * @param {string} params.customerInfo.email - Customer's email
 * @param {string} params.customerInfo.phone - Customer's phone number
 * @param {Object} params.paymentDetails - Payment details
 * @param {number} params.paymentDetails.amount - Total calculated amount
 * @param {string} params.paymentDetails.currency - Currency code
 * @param {string} params.paymentDetails.invoiceType - "online" or "cash"
 * @param {string|null} params.paymentDetails.couponCode - Promo code if applicable
 * @returns {Object} Formatted invoice payload ready for backend
 */
export function createCourseInvoicePayload({
  courseId,
  courseName,
  customerInfo,
  paymentDetails,
}) {
  const { fullName, email, phone } = customerInfo;
  const { amount, currency, invoiceType, couponCode } = paymentDetails;

  // Validate required fields
  if (!courseId) throw new Error("courseId is required");
  if (!courseName) throw new Error("courseName is required");
  if (!fullName) throw new Error("Customer fullName is required");
  if (!email) throw new Error("Customer email is required");
  if (!phone) throw new Error("Customer phone is required");
  if (!amount) throw new Error("amount is required");
  if (!currency) throw new Error("currency is required");
  if (!invoiceType) throw new Error("invoiceType is required");

  const enrollmentTime = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const invoiceDescription = `Course Enrollment: ${courseName}
Customer: ${fullName}
Enrollment placed on: ${enrollmentTime}`;

  return {
    // Customer Information
    buyer_name: fullName,
    buyer_email: email,
    buyer_phone: phone,
    invoice_description: invoiceDescription,

    // Activity Type - REQUIRED for backend validation
    activity: "course",
    activity_type: "course",

    // REQUIRED: Course-specific field for backend price calculation
    course_id: parseInt(courseId),

    // Activity Details (empty for courses)
    activity_details: [],

    // Payment Details
    picked_up: false,
    amount: parseFloat(amount),
    currency: currency,
    invoice_type: invoiceType,
    coupon_code: couponCode || null,
  };
}

/**
 * Handles backend validation errors and returns user-friendly messages
 *
 * @param {Error} error - The error object from the API call
 * @returns {string} User-friendly error message
 */
export function handleInvoiceError(error) {
  let errorMessage = "Booking failed. Please try again.";

  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;

    // Handle validation errors (array format)
    if (Array.isArray(detail)) {
      errorMessage = detail.map((err) => err.msg || err).join(", ");
    }
    // Handle string errors (amount mismatch, etc.)
    else if (typeof detail === "string") {
      errorMessage = detail;
    }
  }

  return errorMessage;
}

/**
 * Checks if an error is an amount mismatch error
 *
 * @param {string} errorMessage - The error message
 * @returns {boolean} True if it's an amount mismatch error
 */
export function isAmountMismatchError(errorMessage) {
  return errorMessage.toLowerCase().includes("amount mismatch");
}

/**
 * Formats a discount breakdown for display
 *
 * @param {Object} discountBreakdown - Discount breakdown from backend response
 * @returns {Object} Formatted discount information
 */
export function formatDiscountBreakdown(discountBreakdown) {
  if (!discountBreakdown) {
    return null;
  }

  return {
    basePrice: discountBreakdown.base_price || 0,
    totalDiscount: discountBreakdown.total_discount || 0,
    finalPrice: discountBreakdown.final_price || 0,

    groupDiscount: discountBreakdown.group_discount
      ? {
          type: discountBreakdown.group_discount.type,
          percentage: discountBreakdown.group_discount.percentage,
          amount: discountBreakdown.group_discount.amount,
          reason: discountBreakdown.group_discount.applied_because,
        }
      : null,

    promoDiscount: discountBreakdown.promo_discount
      ? {
          type: discountBreakdown.promo_discount.type,
          code: discountBreakdown.promo_discount.code,
          percentage: discountBreakdown.promo_discount.percentage,
          amount: discountBreakdown.promo_discount.amount,
        }
      : null,

    couponCode: discountBreakdown.coupon_code || null,
  };
}

/**
 * Validates invoice payload before sending to backend
 *
 * @param {Object} payload - The invoice payload
 * @param {string} type - "trip" or "course"
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateInvoicePayload(payload, type) {
  const errors = [];

  // Common validations
  if (!payload.buyer_name?.trim()) errors.push("Buyer name is required");
  if (!payload.buyer_email?.trim()) errors.push("Buyer email is required");
  if (!payload.buyer_phone?.trim()) errors.push("Buyer phone is required");
  if (!payload.amount || payload.amount <= 0)
    errors.push("Valid amount is required");
  if (!payload.currency?.trim()) errors.push("Currency is required");
  if (!payload.invoice_type?.trim()) errors.push("Invoice type is required");
  if (
    type === "trip" &&
    !payload.invoice_description?.includes("Nationality:")
  ) {
    errors.push("Nationality information is required in invoice description");
  }

  // Type-specific validations
  if (type === "trip") {
    if (!payload.trip_id) errors.push("Trip ID is required");
    if (!payload.adults || payload.adults < 1)
      errors.push("At least 1 adult is required");
    if (payload.children < 0) errors.push("Children count cannot be negative");
    if (!payload.activity_details?.[0]?.activity_date) {
      errors.push("Preferred date is required");
    }
  } else if (type === "course") {
    if (!payload.course_id) errors.push("Course ID is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  createTripInvoicePayload,
  createCourseInvoicePayload,
  handleInvoiceError,
  isAmountMismatchError,
  formatDiscountBreakdown,
  validateInvoicePayload,
};

// app/trips/[id]/page.js

"use client";

import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import Select from "@/components/ui/Select";
import { getData, postData } from "@/lib/axios";
import { fetchCurrencyConversion } from "@/lib/currency";
import ActivityAvailabilityService from "@/services/activityAvailabilityService";
import CouponService from "@/services/couponService";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatDuration } from "@/utils/formatDurations";
import {
  createTripInvoicePayload,
  handleInvoiceError,
  isAmountMismatchError,
} from "@/utils/invoiceHelpers";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CheckStatus from "./CheckStatus";
// --- CHANGE: REMOVED conversion logic. It's no longer needed. ---

// Helper Functions
const formatPrice = (price) => {
  if (!price && price !== 0) return "0";
  return Math.round(price).toString();
};

const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const countries = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "RU", label: "Russia" },
  { value: "UA", label: "Ukraine" },
  { value: "EG", label: "Egypt" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
];

const currencies = [
  { value: "USD", label: "United States Dollar", symbol: "$" },
  { value: "EUR", label: "European Euro", symbol: "€" },
  { value: "EGP", label: "Egyptian Pound", symbol: "EGP" },
];

// Main Component
const TripPage = ({ params }) => {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // State
  const [tripData, setTripData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [relatedTrips, setRelatedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    nationality: "",
    hotelName: "",
    roomNumber: "",
    currency: "EGP", // Default to EGP
    adults: 1,
    children: 0,
    preferredDate: "",
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState("online");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [dateAvailability, setDateAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find((c) => c.value === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  const getCurrentPricing = () => {
    if (!tripData) return { adult: 0, child: 0 };
    return {
      adult: tripData.adult_price || 0,
      child: tripData.child_price || 0,
    };
  };

  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        const trip = await getData(`/trips/${id}`);
        if (!trip) {
          setError("Trip not found");
          return;
        }
        setTripData(trip);

        // --- CHANGE: Enhanced logic to fetch related trips ---
        let otherTrips = [];
        if (trip.package_id) {
          try {
            // First, get package info for the header
            const pkg = await getData(`/packages/${trip.package_id}`);
            setPackageData(pkg);
            // Then, get other trips from that same package
            const tripsInPackage = await getData(
              `/packages/${trip.package_id}/trips`,
            );
            otherTrips = (tripsInPackage?.data || [])
              .filter((t) => t.id.toString() !== id.toString())
              .slice(0, 3); // Show up to 3 other trips
          } catch (err) {
            console.warn(
              "Failed to load package data or trips from package:",
              err,
            );
          }
        }

        // If we couldn't find trips from the package, or the trip isn't in one, get generic related trips as a fallback.
        if (otherTrips.length === 0) {
          try {
            const related = await getData(`/packages/${trip.package_id}/trips`);
            otherTrips = related?.data || [];
          } catch (err) {
            console.warn("Failed to load generic related trips:", err);
          }
        }
        setRelatedTrips(otherTrips);
        // --- END CHANGE ---
      } catch (err) {
        setError("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };
    loadTripData();
  }, [id]);

  // Auto-populate user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (tripData && !tripData.child_allowed && formData.children > 0) {
      setFormData((prev) => ({ ...prev, children: 0 }));
    }
  }, [tripData, formData.children]);

  // Fetch conversion when currency changes and not EGP
  useEffect(() => {
    const fetchConversion = async () => {
      setConvertedPrice(null);
      setConversionError(null);
      if (formData.currency === "EGP" || !formData.currency) return;
      setConversionLoading(true);
      try {
        const { final } = calculateTotalPrice();
        const res = await fetchCurrencyConversion({
          from: "EGP",
          to: formData.currency,
          amount: final,
        });
        setConvertedPrice(res.result?.[formData.currency]);
      } catch (err) {
        setConversionError("Failed to fetch conversion rate");
      } finally {
        setConversionLoading(false);
      }
    };
    fetchConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.currency,
    formData.adults,
    formData.children,
    appliedCoupon,
    tripData,
  ]);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Valid email is required";
    if (formData.phone.trim().length < 10)
      errors.phone = "Valid phone is required";
    if (!formData.nationality) errors.nationality = "Nationality is required";
    if (!formData.hotelName.trim()) errors.hotelName = "Hotel name is required";
    if (!formData.roomNumber.trim())
      errors.roomNumber = "Room number is required";
    if (!formData.currency) errors.currency = "Currency is required";
    if (!formData.preferredDate) {
      errors.preferredDate = "Preferred date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.preferredDate) < today)
        errors.preferredDate = "Date cannot be in the past";
    }

    // Check if selected date is available
    if (dateAvailability && !dateAvailability.is_available) {
      errors.preferredDate =
        "Selected date is not available. Please choose another date.";
    }

    const maxPersons = tripData?.maxim_person || 10;
    if (formData.adults + formData.children > maxPersons)
      errors.total = `Total participants cannot exceed ${maxPersons}`;

    const pricing = getCurrentPricing();
    if (pricing.adult <= 0) {
      errors.pricing = "Pricing not available for this trip";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // This function ALWAYS calculates the price in EGP
  const calculateDiscount = () => {
    if (!tripData || !tripData.has_discount) {
      return { isApplied: false, percentage: 0 };
    }
    const totalPeople = formData.adults + formData.children;
    if (tripData.discount_always_available) {
      return { isApplied: true, percentage: tripData.discount_percentage };
    }
    if (
      tripData.discount_requires_min_people &&
      totalPeople >= tripData.discount_min_people
    ) {
      return { isApplied: true, percentage: tripData.discount_percentage };
    }
    return { isApplied: false, percentage: 0 };
  };

  const calculateTotalPrice = () => {
    if (!tripData)
      return { original: 0, final: 0, discount: null, couponDiscount: 0 };

    const pricing = getCurrentPricing();
    const originalPrice = Math.round(
      formData.adults * pricing.adult + formData.children * pricing.child,
    );

    const discount = calculateDiscount();
    let finalPrice = originalPrice;

    // Apply trip discount first
    if (discount.isApplied) {
      finalPrice = Math.round(originalPrice * (1 - discount.percentage / 100));
    }

    // Apply coupon discount on top of trip discount
    let couponDiscount = 0;
    if (appliedCoupon && appliedCoupon.discount_percentage) {
      couponDiscount = Math.round(
        finalPrice * (appliedCoupon.discount_percentage / 100),
      );
      finalPrice = finalPrice - couponDiscount;
    }

    return {
      original: originalPrice,
      final: finalPrice,
      discount,
      couponDiscount,
    };
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name])
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));

    // Check availability when date is selected
    if (name === "preferredDate" && value && tripData) {
      checkDateAvailability(value);
    }
  };

  const checkDateAvailability = async (date) => {
    if (!date || !tripData) return;

    try {
      setCheckingAvailability(true);
      setDateAvailability(null);

      const response = await ActivityAvailabilityService.checkAvailability(
        "trip",
        tripData.id,
        date,
      );

      setDateAvailability(response);

      if (!response.is_available) {
        toast.warning(response.message || "This date is not available");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      // If API fails, assume date is available
      setDateAvailability({ is_available: true });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === tripData.images.length - 1 ? 0 : prev + 1,
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? tripData.images.length - 1 : prev - 1,
    );
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === "ArrowRight") goToNextImage();
    if (e.key === "ArrowLeft") goToPrevImage();
    if (e.key === "Escape") closeLightbox();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!isAuthenticated) {
      toast.warn("Please log in to apply a coupon.");
      router.push(`/login`);
      return;
    }

    setCouponLoading(true);
    try {
      const result = await CouponService.apply(couponCode.trim());

      if (result.success && result.coupon) {
        // Check if coupon is valid for this activity
        if (
          result.coupon.activity !== "all" &&
          result.coupon.activity !== "trip"
        ) {
          toast.error("This coupon is not valid for trips");
          return;
        }

        setAppliedCoupon(result.coupon);
        toast.success(
          `Coupon applied! ${result.coupon.discount_percentage}% discount`,
        );
      } else {
        toast.error(result.message || "Failed to apply coupon");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to apply coupon";
      toast.error(errorMessage);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleCloseCouponInput = () => {
    setShowCouponInput(false);
    setCouponCode("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warn("Please log in to book your trip.");
      router.push(`/login`);
      return;
    }
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    // Show payment modal instead of directly creating invoice
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (selectedPaymentType) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setShowPaymentModal(false);

      // Calculate the final price on frontend for display/validation
      const { final: finalPrice } = calculateTotalPrice();
      let converted = null;
      let amountToSend = finalPrice; // Default to EGP
      if (formData.currency !== "EGP") {
        try {
          const res = await fetchCurrencyConversion({
            from: "EGP",
            to: formData.currency,
            amount: finalPrice,
          });
          converted = res.result?.[formData.currency];
          amountToSend = parseFloat(converted.toFixed(1)); // Round to 1 decimal place
        } catch {
          // fallback: let backend handle conversion if needed
        }
      }

      // Use helper utility to create properly formatted invoice payload
      const invoicePayload = createTripInvoicePayload({
        tripId: id,
        tripName: tripData.name,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality,
        },
        bookingDetails: {
          adults: formData.adults,
          children: formData.children,
          preferredDate: formData.preferredDate,
          hotelName: formData.hotelName,
          roomNumber: formData.roomNumber,
          specialRequests: formData.specialRequests,
        },
        paymentDetails: {
          amount: amountToSend,
          currency: formData.currency,
          invoiceType: selectedPaymentType,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          convertedAmount: converted,
        },
      });

      const invoiceResponse = await postData(
        "/invoices/",
        invoicePayload,
        true,
      );

      if (invoiceResponse.discount_breakdown) {
        console.log("Discount Breakdown:", invoiceResponse.discount_breakdown);
      }

      if (selectedPaymentType === "online") {
        toast.success("Invoice created! Opening payment page...");
        if (invoiceResponse.pay_url) {
          window.open(invoiceResponse.pay_url, "_blank");
          router.push(`/invoices/${invoiceResponse.id}`);
        } else {
          throw new Error("Payment URL not received from server.");
        }
      } else {
        toast.success("Booking confirmed! Please pay at the diving center.");
        router.push(`/invoices/${invoiceResponse.id}`);
      }
    } catch (error) {
      const errorMessage = handleInvoiceError(error);
      setError(errorMessage);
      toast.error(errorMessage);
      if (isAmountMismatchError(errorMessage)) {
        toast.info("Please refresh the page and try booking again.", {
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon
          icon="lucide:loader-2"
          className="w-8 h-8 animate-spin text-blue-600"
        />
      </div>
    );
  if (error || !tripData)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <Icon
            icon="lucide:alert-circle"
            className="w-12 h-12 text-red-500 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/trips" className="text-blue-600 font-semibold">
            ← Back to Trips
          </Link>
        </div>
      </div>
    );

  const currentPricing = getCurrentPricing();
  const maxPersons = tripData.maxim_person || 10;
  const {
    original: originalTotalPrice,
    final: finalTotalPrice,
    discount: appliedDiscount,
  } = calculateTotalPrice();

  const adultOptions = Array.from({ length: maxPersons }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} Adult${i > 0 ? "s" : ""}`,
  }));
  const childrenOptions = Array.from({ length: maxPersons }, (_, i) => ({
    value: i,
    label: i === 0 ? "No Children" : `${i} Child${i > 1 ? "ren" : ""}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... Hero Section (no changes needed here) ... */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-black/40"></div>

        {tripData.images && tripData.images.length > 0 && (
          <div className="absolute inset-0">
            <Image
              src={tripData.images[0]}
              alt={tripData.name}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20"></div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-center mb-8">
            <Link
              href="/trips"
              className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mr-4"
            >
              <Icon
                icon="lucide:arrow-left"
                className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
              />
              <span>Back to Trips</span>
            </Link>
            {packageData && (
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                {packageData.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-white leading-tight text-shadow-lg">
            {tripData.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90 mb-8 text-lg">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon icon="lucide:clock" className="w-5 h-5 mr-2" />
              <span>
                {formatDuration(tripData.duration, tripData.duration_unit)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-black text-white">
                EGP {formatPrice(currentPricing.adult)}
              </span>
              <span className="text-white/80 text-xl">/person</span>
            </div>
            {tripData.difficulty && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon icon="lucide:trending-up" className="w-5 h-5 mr-2" />
                <span>{tripData.difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* ... Left Column (no changes needed here) ... */}
          <div className="lg:col-span-2 space-y-8">
            {tripData.images && tripData.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <Icon
                    icon="lucide:camera"
                    className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600"
                  />
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {tripData.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => openLightbox(index)}
                      className="relative h-32 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`${tripData.name} - Photo ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Icon
                          icon="lucide:maximize-2"
                          className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Icon
                  icon="lucide:info"
                  className="w-8 h-8 mr-3 text-blue-600"
                />
                About This Trip
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <MarkdownRenderer content={tripData.description} />
              </div>
            </div>

            {(tripData?.included || tripData?.not_included) &&
              (() => {
                // Helper function to parse field data with multiple levels of JSON encoding
                const parseFieldData = (fieldData) => {
                  let items = [];
                  let data = fieldData;

                  // Keep unwrapping until we get to the actual array
                  let attempts = 0;
                  const maxAttempts = 10; // Prevent infinite loops

                  while (attempts < maxAttempts) {
                    attempts++;

                    // If it's an array with a single string element, try to parse that string
                    if (Array.isArray(data)) {
                      if (
                        data.length === 1 &&
                        typeof data[0] === "string" &&
                        (data[0].trim().startsWith("[") ||
                          data[0].trim().startsWith("{") ||
                          data[0].trim().startsWith('"'))
                      ) {
                        try {
                          data = JSON.parse(data[0]);
                          continue; // Try again with the parsed result
                        } catch {
                          // If parsing fails, treat array elements as items
                          items = data.filter(
                            (item) =>
                              item &&
                              (typeof item === "string" ? item.trim() : item),
                          );
                          break;
                        }
                      } else if (data.length > 0 && Array.isArray(data[0])) {
                        // If first element is an array, unwrap it
                        data = data[0];
                        continue;
                      } else {
                        // It's an array of strings
                        items = data.filter(
                          (item) =>
                            item &&
                            (typeof item === "string" ? item.trim() : item),
                        );
                        break;
                      }
                    } else if (typeof data === "string") {
                      // Try to parse string
                      try {
                        data = JSON.parse(data);
                        continue; // Try again with the parsed result
                      } catch {
                        // If parsing fails, treat as single item
                        items = [data];
                        break;
                      }
                    } else {
                      // Unknown type, stop
                      break;
                    }
                  }

                  return items;
                };

                // Parse both sections to check if they have content
                const includedItems = parseFieldData(tripData?.included);
                const notIncludedItems = parseFieldData(tripData?.not_included);

                const hasIncluded = includedItems.length > 0;
                const hasNotIncluded = notIncludedItems.length > 0;

                return (
                  <div className="grid md:grid-cols-2 gap-8">
                    {hasIncluded && (
                      <div
                        className={`bg-green-50 rounded-2xl shadow-xl p-8 ${
                          !hasNotIncluded ? "md:col-span-2" : ""
                        }`}
                      >
                        <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                          <Icon
                            icon="lucide:check-circle"
                            className="w-6 h-6 mr-2"
                          />
                          What's Included
                        </h3>
                        <ul className="space-y-2">
                          {includedItems.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start text-green-700"
                            >
                              <Icon
                                icon="lucide:check"
                                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasNotIncluded && (
                      <div
                        className={`bg-red-50 rounded-2xl shadow-xl p-8 ${
                          !hasIncluded ? "md:col-span-2" : ""
                        }`}
                      >
                        <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                          <Icon
                            icon="lucide:x-circle"
                            className="w-6 h-6 mr-2"
                          />
                          Not Included
                        </h3>
                        <ul className="space-y-2">
                          {notIncludedItems.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start text-red-700"
                            >
                              <Icon
                                icon="lucide:x"
                                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}

            {tripData?.terms_and_conditions &&
              (() => {
                // Use the same parseFieldData function for terms_and_conditions
                // Helper function to parse field data with multiple levels of JSON encoding
                const parseFieldData = (fieldData) => {
                  let items = [];
                  let data = fieldData;

                  // Keep unwrapping until we get to the actual array
                  let attempts = 0;
                  const maxAttempts = 10; // Prevent infinite loops

                  while (attempts < maxAttempts) {
                    attempts++;

                    // If it's an array with a single string element, try to parse that string
                    if (Array.isArray(data)) {
                      if (
                        data.length === 1 &&
                        typeof data[0] === "string" &&
                        (data[0].trim().startsWith("[") ||
                          data[0].trim().startsWith("{") ||
                          data[0].trim().startsWith('"'))
                      ) {
                        try {
                          data = JSON.parse(data[0]);
                          continue; // Try again with the parsed result
                        } catch {
                          // If parsing fails, treat array elements as items
                          items = data.filter(
                            (item) =>
                              item &&
                              (typeof item === "string" ? item.trim() : item),
                          );
                          break;
                        }
                      } else if (data.length > 0 && Array.isArray(data[0])) {
                        // If first element is an array, unwrap it
                        data = data[0];
                        continue;
                      } else {
                        // It's an array of strings
                        items = data.filter(
                          (item) =>
                            item &&
                            (typeof item === "string" ? item.trim() : item),
                        );
                        break;
                      }
                    } else if (typeof data === "string") {
                      // Try to parse string
                      try {
                        data = JSON.parse(data);
                        continue; // Try again with the parsed result
                      } catch {
                        // If parsing fails, treat as single item
                        items = [data];
                        break;
                      }
                    } else {
                      // Unknown type, stop
                      break;
                    }
                  }

                  return items;
                };

                const termsItems = parseFieldData(
                  tripData.terms_and_conditions,
                );

                return termsItems.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                      <Icon
                        icon="lucide:file-text"
                        className="w-8 h-8 mr-3 text-blue-600"
                      />
                      Terms & Conditions - Notes
                    </h2>
                    <ul className="space-y-3">
                      {termsItems.map((term, index) => (
                        <li
                          key={index}
                          className="flex items-start text-gray-700"
                        >
                          <Icon
                            icon="lucide:dot"
                            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600"
                          />
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

            {/* --- NEW SECTION: YOU MIGHT ALSO PREFER --- */}
            {relatedTrips.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:sparkles"
                    className="w-8 h-8 mr-3 text-blue-600"
                  />
                  You Might Also Prefer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedTrips.map((otherTrip) => (
                    <Link
                      href={`/trips/${otherTrip.id}`}
                      key={otherTrip.id}
                      className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100"
                    >
                      <div className="relative h-40">
                        <Image
                          src={
                            otherTrip.images?.[0] || "/placeholder-image.png"
                          }
                          alt={otherTrip.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 text-white">
                          <span className="font-bold text-lg">
                            EGP {formatPrice(otherTrip.adult_price)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {otherTrip.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <Icon
                            icon="lucide:clock"
                            className="w-4 h-4 mr-1.5"
                          />
                          {formatDuration(
                            otherTrip.duration,
                            otherTrip.duration_unit,
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* --- END NEW SECTION --- */}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <CheckStatus />
                  <span className="text-4xl font-black text-blue-600">
                    EGP {formatPrice(currentPricing.adult)}
                  </span>
                  <p className="text-gray-600 font-medium">per adult</p>
                  {tripData.child_allowed && currentPricing.child > 0 && (
                    <p className="text-gray-500 text-sm mt-1">
                      Child: EGP {formatPrice(currentPricing.child)}
                    </p>
                  )}
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* ... Form title and error display are unchanged ... */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Icon
                      icon="lucide:calendar-check"
                      className="w-6 h-6 mr-2 text-blue-600"
                    />
                    Book Your Adventure
                  </h3>
                  {(error || Object.keys(formErrors).length > 0) && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
                      <div className="flex">
                        <Icon
                          icon="lucide:alert-circle"
                          className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <strong className="font-bold">Booking Error:</strong>
                          <div className="mt-1">
                            {error && <p>{error}</p>}
                            {Object.values(formErrors).map((err, index) => (
                              <p key={index} className="text-sm">
                                {err}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* ... Input fields (name, email, etc.) are unchanged ... */}
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Full Name *"
                      required
                      icon="mdi:account-outline"
                      className="text-lg"
                      error={formErrors.fullName}
                    />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Email Address *"
                      required
                      icon="mdi:email-outline"
                      className="text-lg"
                      error={formErrors.email}
                    />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Phone Number *"
                      required
                      icon="mdi:phone-outline"
                      className="text-lg"
                      error={formErrors.phone}
                    />
                    <Select
                      name="nationality"
                      value={formData.nationality}
                      onChange={({ value }) =>
                        handleInputChange("nationality", value)
                      }
                      options={countries}
                      placeholder="Select Nationality *"
                      searchable={true}
                      icon="mdi:flag-outline"
                      required
                      error={formErrors.nationality}
                    />

                    <Select
                      name="currency"
                      value={formData.currency}
                      onChange={({ value }) =>
                        handleInputChange("currency", value)
                      }
                      options={currencies}
                      placeholder="Select Payment Currency *"
                      searchable={true}
                      icon="grommet-icons:currency"
                      required
                      error={formErrors.currency}
                    />
                    {formData.currency !== "EGP" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mt-2">
                        <div className="flex items-start">
                          <Icon
                            icon="mdi:information-outline"
                            className="w-5 h-5 mr-2 mt-0.5 text-blue-600 flex-shrink-0"
                          />
                          <div className="text-blue-800">
                            <strong>Converted Price:</strong>{" "}
                            {conversionLoading ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                Fetching conversion rate...
                              </span>
                            ) : conversionError ? (
                              <span className="text-red-600">
                                Failed to fetch rate - {conversionError}
                              </span>
                            ) : convertedPrice ? (
                              <span>
                                {formData.currency} {convertedPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span>--</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Input
                      name="hotelName"
                      value={formData.hotelName}
                      onChange={(e) =>
                        handleInputChange("hotelName", e.target.value)
                      }
                      placeholder="Hotel Name *"
                      required
                      icon="mdi:hotel"
                      className="text-lg"
                      error={formErrors.hotelName}
                    />
                    <Input
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) =>
                        handleInputChange("roomNumber", e.target.value)
                      }
                      placeholder="Room Number *"
                      required
                      icon="mdi:door"
                      className="text-lg"
                      error={formErrors.roomNumber}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        name="adults"
                        value={formData.adults}
                        onChange={({ value }) =>
                          handleInputChange("adults", parseInt(value))
                        }
                        options={adultOptions}
                        placeholder="Adults *"
                        defaultValue="1"
                        required
                        error={formErrors.adults}
                      />
                      <Select
                        name="children"
                        value={formData.children}
                        onChange={({ value }) =>
                          handleInputChange("children", parseInt(value))
                        }
                        options={childrenOptions}
                        disabled={!tripData.child_allowed}
                        placeholder={
                          !tripData.child_allowed ? "Not Allowed" : "Children"
                        }
                      />
                    </div>
                    {formErrors.total && (
                      <div className="text-red-600 text-sm flex items-center">
                        <Icon
                          icon="lucide:alert-circle"
                          className="w-4 h-4 mr-1"
                        />
                        {formErrors.total}
                      </div>
                    )}
                    <Input
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) =>
                        handleInputChange("preferredDate", e.target.value)
                      }
                      placeholder="Preferred Date *"
                      required
                      icon="mdi:calendar"
                      min={new Date().toISOString().split("T")[0]}
                      className="text-lg"
                      error={formErrors.preferredDate}
                    />

                    {/* Date Availability Check */}
                    {checkingAvailability && formData.preferredDate && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                        <span>Checking availability...</span>
                      </div>
                    )}

                    {!checkingAvailability &&
                      dateAvailability &&
                      !dateAvailability.is_available &&
                      formData.preferredDate && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Icon
                              icon="mdi:calendar-remove"
                              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                            />
                            <div>
                              <h4 className="font-semibold text-red-900 mb-1">
                                Date Not Available
                              </h4>
                              <p className="text-sm text-red-700">
                                {dateAvailability.message ||
                                  "This trip is not available on the selected date. Please choose another day."}
                              </p>
                              {dateAvailability.reason && (
                                <p className="text-xs text-red-600 mt-1">
                                  Reason: {dateAvailability.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    <Input
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) =>
                        handleInputChange("specialRequests", e.target.value)
                      }
                      textarea
                      placeholder="Special Requests (Optional)"
                      icon="mdi:message-text-outline"
                      rows="3"
                    />

                    {/* Coupon Section */}
                    <div className="space-y-3">
                      {!showCouponInput && !appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => setShowCouponInput(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                        >
                          <Icon
                            icon="mdi:ticket-percent"
                            className="w-4 h-4 mr-1.5"
                          />
                          Have a coupon?
                        </button>
                      )}

                      {showCouponInput && !appliedCoupon && (
                        <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Apply Coupon
                            </span>
                            <button
                              type="button"
                              onClick={handleCloseCouponInput}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Close"
                            >
                              <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                          </div>
                          <Input
                            icon="mdi:ticket-percent"
                            name="couponCode"
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            className="text-lg"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            text="Apply"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            isLoading={couponLoading}
                            full
                          />
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Icon
                                icon="mdi:check-circle"
                                className="w-5 h-5 text-green-600 mr-2"
                              />
                              <div>
                                <p className="font-semibold text-green-800">
                                  {appliedCoupon.code}
                                </p>
                                <p className="text-sm text-green-600">
                                  {appliedCoupon.discount_percentage}% discount
                                  applied
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Remove coupon"
                            >
                              <Icon
                                icon="mdi:close-circle"
                                className="w-5 h-5"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* --- CHANGE: Price summary shows selected currency --- */}
                  {(formData.adults > 0 || formData.children > 0) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <Icon icon="mdi:calculator" className="w-4 h-4 mr-2" />
                        Price Summary ({formData.currency})
                        {formData.currency !== "EGP" && conversionLoading && (
                          <span className="ml-2 text-sm text-blue-600 font-normal">
                            - Fetching new price...
                          </span>
                        )}
                      </h4>
                      {formData.currency !== "EGP" && conversionError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <div className="flex items-start">
                            <Icon
                              icon="lucide:alert-circle"
                              className="w-5 h-5 mr-2 mt-0.5 text-red-600 flex-shrink-0"
                            />
                            <div className="text-red-800">
                              <strong>Price fetch failed:</strong> Please
                              refresh the page and try again.
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1 text-sm">
                        {/* Display itemized breakdown */}
                        <div className="flex justify-between text-gray-600">
                          <span>Adults ({formData.adults}x):</span>
                          <span>
                            {getCurrencySymbol(formData.currency)}{" "}
                            {formData.currency === "EGP"
                              ? formatPrice(
                                  currentPricing.adult * formData.adults,
                                )
                              : convertedPrice
                                ? formatPrice(
                                    (currentPricing.adult *
                                      formData.adults *
                                      convertedPrice) /
                                      finalTotalPrice,
                                  )
                                : formatPrice(
                                    currentPricing.adult * formData.adults,
                                  )}
                          </span>
                        </div>
                        {formData.children > 0 && tripData.child_allowed && (
                          <div className="flex justify-between text-gray-600">
                            <span>Children ({formData.children}x):</span>
                            <span>
                              {getCurrencySymbol(formData.currency)}{" "}
                              {formData.currency === "EGP"
                                ? formatPrice(
                                    currentPricing.child * formData.children,
                                  )
                                : convertedPrice
                                  ? formatPrice(
                                      (currentPricing.child *
                                        formData.children *
                                        convertedPrice) /
                                        finalTotalPrice,
                                    )
                                  : formatPrice(
                                      currentPricing.child * formData.children,
                                    )}
                            </span>
                          </div>
                        )}

                        {/* Display Trip Discount if applied */}
                        {appliedDiscount.isApplied && (
                          <div className="flex justify-between text-green-600 text-xs">
                            <span>
                              Trip Discount ({appliedDiscount.percentage}%):
                            </span>
                            <span>
                              - {getCurrencySymbol(formData.currency)}{" "}
                              {formData.currency === "EGP"
                                ? formatPrice(
                                    originalTotalPrice -
                                      originalTotalPrice *
                                        (1 - appliedDiscount.percentage / 100),
                                  )
                                : convertedPrice
                                  ? formatPrice(
                                      ((originalTotalPrice -
                                        originalTotalPrice *
                                          (1 -
                                            appliedDiscount.percentage / 100)) *
                                        convertedPrice) /
                                        finalTotalPrice,
                                    )
                                  : formatPrice(
                                      originalTotalPrice -
                                        originalTotalPrice *
                                          (1 -
                                            appliedDiscount.percentage / 100),
                                    )}
                            </span>
                          </div>
                        )}

                        {/* Display Coupon Discount if applied */}
                        {(() => {
                          const calc = calculateTotalPrice();
                          return (
                            calc.couponDiscount > 0 && (
                              <div className="flex justify-between text-green-600 text-xs">
                                <span>
                                  Coupon Discount (
                                  {appliedCoupon.discount_percentage}%):
                                </span>
                                <span>
                                  - {getCurrencySymbol(formData.currency)}{" "}
                                  {formData.currency === "EGP"
                                    ? formatPrice(calc.couponDiscount)
                                    : convertedPrice
                                      ? formatPrice(
                                          (calc.couponDiscount *
                                            convertedPrice) /
                                            finalTotalPrice,
                                        )
                                      : formatPrice(calc.couponDiscount)}
                                </span>
                              </div>
                            )
                          );
                        })()}

                        {/* Display Total and Discount */}
                        <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-800 items-end">
                          <span>Total:</span>
                          <div className="text-right">
                            {(appliedDiscount.isApplied || appliedCoupon) && (
                              <span className="text-gray-400 line-through text-sm mr-2">
                                {getCurrencySymbol(formData.currency)}{" "}
                                {formData.currency === "EGP"
                                  ? formatPrice(originalTotalPrice)
                                  : convertedPrice
                                    ? formatPrice(
                                        (originalTotalPrice * convertedPrice) /
                                          finalTotalPrice,
                                      )
                                    : formatPrice(originalTotalPrice)}
                              </span>
                            )}
                            <span className="text-blue-600">
                              {getCurrencySymbol(formData.currency)}{" "}
                              {formData.currency === "EGP"
                                ? formatPrice(finalTotalPrice)
                                : convertedPrice
                                  ? formatPrice(convertedPrice)
                                  : formatPrice(finalTotalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Discount Messaging */}
                        {tripData.has_discount && (
                          <div className="text-center pt-2">
                            {appliedDiscount.isApplied ? (
                              <p className="text-green-600 text-xs font-medium">
                                🎉 You've unlocked a{" "}
                                {appliedDiscount.percentage}% discount!
                              </p>
                            ) : tripData.discount_requires_min_people ? (
                              <p className="text-cyan-600 text-xs font-medium">
                                Add{" "}
                                {tripData.discount_min_people -
                                  (formData.adults + formData.children)}{" "}
                                more people to get a{" "}
                                {tripData.discount_percentage}% discount!
                              </p>
                            ) : null}
                          </div>
                        )}

                        {/* Coupon Success Message */}
                        {appliedCoupon && (
                          <div className="text-center pt-1">
                            <p className="text-green-600 text-xs font-medium">
                              💰 Coupon {appliedCoupon.code} applied!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- CHANGE: Book Now button now shows payment options --- */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      currentPricing.adult <= 0 ||
                      (formData.currency !== "EGP" &&
                        (conversionLoading || conversionError))
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : formData.currency !== "EGP" && conversionLoading
                        ? "Fetching price..."
                        : formData.currency !== "EGP" && conversionError
                          ? "Price fetch failed - Refresh page"
                          : `Continue - ${getCurrencySymbol(formData.currency)} ${
                              formData.currency === "EGP"
                                ? formatPrice(finalTotalPrice)
                                : convertedPrice
                                  ? formatPrice(convertedPrice)
                                  : formatPrice(finalTotalPrice)
                            }`}
                  </button>
                </form>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <Icon
                      icon="lucide:shield-check"
                      className="w-5 h-5 mr-2 text-green-600"
                    />
                    <span>Secure SSL Booking</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <Icon
                      icon="lucide:credit-card"
                      className="w-5 h-5 mr-2 text-blue-600"
                    />
                    <span>Multiple Currency Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowPaymentModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icon icon="lucide:x" className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Payment Method
                </h3>
                <p className="text-gray-600">
                  Select how you'd like to pay for your trip
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Trip Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Icon icon="lucide:map-pin" className="w-4 h-4 mr-2" />
                    Booking Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip:</span>
                      <span className="font-medium">{tripData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formatDate(formData.preferredDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">
                        {formData.adults} Adult{formData.adults > 1 ? "s" : ""}
                        {formData.children > 0 &&
                          `, ${formData.children} Child${
                            formData.children > 1 ? "ren" : ""
                          }`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hotel:</span>
                      <span className="font-medium">
                        {formData.hotelName} - Room {formData.roomNumber}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {getCurrencySymbol(formData.currency)}{" "}
                        {formData.currency === "EGP"
                          ? formatPrice(calculateTotalPrice().final)
                          : convertedPrice
                            ? formatPrice(convertedPrice)
                            : formatPrice(calculateTotalPrice().final)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <button
                    onClick={() => handlePaymentConfirm("online")}
                    disabled={isSubmitting}
                    className="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                        <Icon
                          icon="lucide:credit-card"
                          className="w-6 h-6 text-blue-600"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          Pay Online
                        </h5>
                        <p className="text-sm text-gray-600">
                          Secure payment with credit card or digital wallet
                        </p>
                      </div>
                      <Icon
                        icon="lucide:arrow-right"
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                      />
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentConfirm("cash")}
                    disabled={isSubmitting}
                    className="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                        <Icon
                          icon="lucide:banknote"
                          className="w-6 h-6 text-green-600"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          Pay at Diving Center
                        </h5>
                        <p className="text-sm text-gray-600">
                          Pay in cash when you arrive at the diving center
                        </p>
                      </div>
                      <Icon
                        icon="lucide:arrow-right"
                        className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
                      />
                    </div>
                  </button>
                </div>

                {/* Note */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Icon
                      icon="lucide:info"
                      className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm text-amber-800">
                      <strong>Please note:</strong> If you choose to pay at the
                      diving center, please ensure you arrive 30 minutes before
                      your scheduled trip time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxOpen && tripData.images && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col">
          {/* Header Controls - with padding to avoid navbar overlap */}
          <div className="w-full flex justify-center items-center z-20 pt-20 sm:pt-24 pb-4 px-4">
            <div className="w-full max-w-7xl flex justify-between items-center">
              {/* Counter - Centered Left */}
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="text-white font-medium text-sm sm:text-base">
                  {currentImageIndex + 1} / {tripData.images.length}
                </span>
              </div>

              {/* Close Button - Centered Right */}
              <button
                onClick={closeLightbox}
                className="p-3 bg-black/30 hover:bg-red-500/80 text-white rounded-full transition-all duration-300 border border-white/10 hover:border-red-500/50 group"
                aria-label="Close preview"
              >
                <Icon
                  icon="lucide:x"
                  className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </div>
          </div>

          {/* Main Image Area - Centered */}
          <div
            className="flex-1 relative flex items-center justify-center px-4 sm:px-8 pb-4 overflow-hidden"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
              {/* Previous Button - Centered vertically */}
              {tripData.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/30 hover:bg-blue-600/80 text-white rounded-full transition-all duration-300 border border-white/10 hover:border-blue-500/50 backdrop-blur-md z-20"
                  aria-label="Previous image"
                >
                  <Icon
                    icon="lucide:chevron-left"
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </button>
              )}

              {/* Image Container - Fully Centered */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-320px)]">
                  <Image
                    src={tripData.images[currentImageIndex]}
                    alt={`${tripData.name} - Photo ${currentImageIndex + 1}`}
                    fill
                    className="object-contain drop-shadow-2xl"
                    quality={100}
                    priority
                  />
                </div>
              </div>

              {/* Next Button - Centered vertically */}
              {tripData.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/30 hover:bg-blue-600/80 text-white rounded-full transition-all duration-300 border border-white/10 hover:border-blue-500/50 backdrop-blur-md z-20"
                  aria-label="Next image"
                >
                  <Icon
                    icon="lucide:chevron-right"
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnails - Centered */}
          {tripData.images.length > 1 && (
            <div className="w-full bg-black/40 backdrop-blur-md border-t border-white/10 py-4 z-20 flex-shrink-0">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto justify-start sm:justify-center items-center scrollbar-hide">
                  {tripData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`relative flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20 rounded-lg overflow-hidden transition-all duration-300 ${
                        index === currentImageIndex
                          ? "ring-2 sm:ring-3 ring-blue-500 scale-105 sm:scale-110 opacity-100"
                          : "opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripPage;

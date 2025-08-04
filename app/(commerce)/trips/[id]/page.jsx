// app/trips/[id]/page.js

"use client";

import Input from "@/components/ui/Input";
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import Select from "@/components/ui/Select";
import { getData, postData } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

// Enhanced helper functions

const formatPrice = (price, hasDiscount, discountPercentage) => {
  if (!price) return { original: "0", discounted: null, discount: null };

  if (hasDiscount && discountPercentage) {
    const originalPrice = price / (1 - discountPercentage / 100);
    return {
      original: Math.round(originalPrice).toString(),
      discounted: Math.round(price).toString(),
      discount: discountPercentage,
    };
  }
  return {
    original: Math.round(price).toString(),
    discounted: null,
    discount: null,
  };
};

const formatDuration = (duration) => {
  if (!duration) return "Duration TBD";
  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${duration} minute${duration !== 1 ? "s" : ""}`;
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

// Enhanced countries list
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
  { value: "USD", label: "United States Dollar" },
  { value: "EUR", label: "European Euro" },
  { value: "EGP", label: "Egyption Pound" },
];

// Payment Modal Component
const PaymentModal = ({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  totalAmount,
  bookingData,
}) => {
  if (!isOpen) return null;

  const handlePaymentSelect = (method) => {
    onPaymentMethodSelect(method);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">
            Choose Payment Method
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">
              Booking Summary
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Adults:</span>
                <span>
                  {bookingData.adults} × €{bookingData.adultPrice}
                </span>
              </div>
              {bookingData.children > 0 && (
                <div className="flex justify-between">
                  <span>Children:</span>
                  <span>
                    {bookingData.children} × €{bookingData.childPrice}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-gray-800">
                <span>Total:</span>
                <span>€{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* Pay Online */}
            <button
              onClick={() => handlePaymentSelect("online")}
              className="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                  <Icon
                    icon="lucide:credit-card"
                    className="w-6 h-6 text-blue-600"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Pay Online</h4>
                  <p className="text-sm text-gray-600">
                    Secure payment via Stripe
                  </p>
                </div>
              </div>
              <Icon
                icon="lucide:chevron-right"
                className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
              />
            </button>

            {/* Pay at Diving Center */}
            <button
              onClick={() => handlePaymentSelect("cash")}
              className="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
                  <Icon
                    icon="lucide:banknote"
                    className="w-6 h-6 text-green-600"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">
                    Pay at Diving Center
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cash payment on arrival
                  </p>
                </div>
              </div>
              <Icon
                icon="lucide:chevron-right"
                className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
              />
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start">
              <Icon
                icon="lucide:shield-check"
                className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Secure & Protected</p>
                <p>
                  Your booking is protected and can be cancelled up to 24 hours
                  before the trip.
                </p>
              </div>
            </div>
          </div>
          {/* cancelation Cotice */}
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start">
              <Icon
                icon="lucide:shield-minus"
                className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Cancellation Policy</p>
                <p>
                  If you cancel your activity or trip, 50% of the amount you
                  paid will be deducted. The remaining 50% will be refunded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Client Component
const TripPage = ({ params, searchParams }) => {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // State management
  const [tripData, setTripData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [relatedTrips, setRelatedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    nationality: "",
    hotelName: "",
    roomNumber: "",
    adults: 1,
    children: 0,
    preferredDate: "",
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load trip data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);

        // Fetch trip data
        const trip = await getData(`/trips/${id}`);
        if (!trip) {
          setError("Trip not found");
          return;
        }
        setTripData(trip);

        // Fetch related data in parallel
        const promises = [];

        if (trip.package_id) {
          promises.push(
            getData(`/packages/${trip.package_id}`)
              .then((data) => setPackageData(data))
              .catch((err) => {
                console.warn(
                  `Package ${trip.package_id} not found:`,
                  err.message
                );
                setPackageData(null);
              })
          );
        }

        // Fetch related trips
        promises.push(
          getData("/trips?limit=3&exclude=" + id)
            .then((data) => setRelatedTrips(data))
            .catch((err) => {
              console.warn("Failed to fetch related trips:", err.message);
              setRelatedTrips([]);
            })
        );

        await Promise.allSettled(promises);
      } catch (error) {
        console.error(`Error fetching trip ${id}:`, error.message);
        setError("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    loadTripData();
  }, [id]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName = "Full name is required (minimum 2 characters)";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Valid email address is required";
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      errors.phone = "Valid phone number is required";
    }

    if (!formData.nationality) {
      errors.nationality = "Nationality is required";
    }

    if (!formData.hotelName || formData.hotelName.trim().length < 2) {
      errors.hotelName = "Hotel name is required";
    }

    if (!formData.roomNumber || formData.roomNumber.trim().length < 1) {
      errors.roomNumber = "Room number is required";
    }

    if (!formData.preferredDate) {
      errors.preferredDate = "Preferred date is required";
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.preferredDate = "Preferred date cannot be in the past";
      }
    }

    const maxPersons = tripData?.maxim_person || 10;
    if (formData.adults < 1 || formData.adults > maxPersons) {
      errors.adults = `Number of adults must be between 1 and ${maxPersons}`;
    }

    if (formData.children < 0) {
      errors.children = "Number of children cannot be negative";
    }

    if (formData.adults + formData.children > maxPersons) {
      errors.total = `Total participants cannot exceed ${maxPersons}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!tripData) return 0;

    const adultPrice = tripData.adult_price || 0;
    const childPrice = tripData.child_price || adultPrice * 0.5;

    return Math.round(
      formData.adults * adultPrice + formData.children * childPrice
    );
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission (show payment modal)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // 1. Check if user is logged in
    if (!isAuthenticated) {
      toast.warn("Please log in to book your trip.");
      router.push(`/login?redirect=/trips/${id}`);
      return;
    }

    // 2. Validate the form
    if (validateForm()) {
      setShowPaymentModal(true);
    } else {
      toast.error("Please correct the errors in the form.");
    }
  };

  // Handle payment method selection and INVOICE submission
  const handlePaymentMethodSelect = async (paymentMethod) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const totalPrice = calculateTotalPrice();

      // Map frontend payment method to backend-expected value
      const apiPaymentMethod =
        paymentMethod === "online" ? "credit_card" : "cash";

      // Construct the items for the invoice
      const items = [];
      const bookingDetails = `on ${formData.preferredDate} for guest at ${formData.hotelName} (Room #${formData.roomNumber})`;

      if (formData.adults > 0) {
        items.push({
          name: `${tripData.name} (Adults)`,
          description: `Trip booking for adults. ${bookingDetails}`,
          quantity: formData.adults,
          price: (tripData.adult_price || 0) * formData.adults,
        });
      }
      if (formData.children > 0) {
        items.push({
          name: `${tripData.name} (Children)`,
          description: `Trip booking for children. ${bookingDetails}`,
          quantity: formData.children,
          price: (tripData.child_price || 0) * formData.children,
        });
      }

      // Prepare INVOICE payload
      const invoicePayload = {
        user_id: user.id,
        amount: totalPrice,
        currency: formData.currency,
        invoice_for: "trip",
        pay_method: apiPaymentMethod,
        items: items,
      };

      // Submit INVOICE creation request
      const invoiceResponse = await postData("/invoices", invoicePayload, true);

      toast.success(`Invoice #${invoiceResponse.id} created successfully!`);

      // Redirect based on payment method and backend response
      if (apiPaymentMethod === "credit_card" && invoiceResponse.pay_url) {
        // For online payments, redirect to the URL provided by the backend
        router.push("/invoices");
      } else {
        // For cash payments, redirect to a success page
        router.push(`/invoices`);
      }
    } catch (error) {
      console.error("Invoice creation failed:", error);
      const errorMessage =
        error.response?.data?.detail || "Booking failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="lucide:loader-2"
            className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tripData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="lucide:alert-circle"
            className="w-12 h-12 text-red-500 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Trip Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The requested trip could not be found."}
          </p>
          <Link
            href="/trips"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing and options
  const pricing = formatPrice(
    tripData.adult_price,
    tripData.has_discount,
    tripData.discount_percentage
  );
  const maxPersons = tripData.maxim_person || 10;
  const totalPrice = calculateTotalPrice();

  const adultOptions = Array.from({ length: maxPersons }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} Adult${i > 0 ? "s" : ""}`,
  }));

  const childrenOptions = Array.from({ length: maxPersons }, (_, i) => ({
    value: i,
    label: i === 0 ? "No Children" : i === 1 ? "1 Child" : `${i} Children`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
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
          {/* Breadcrumb Navigation */}
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

          {/* Trip Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-white leading-tight text-shadow-lg">
            {tripData.name}
          </h1>

          {/* Trip Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-white/90 mb-8 text-lg">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon icon="lucide:clock" className="w-5 h-5 mr-2" />
              <span>{formatDuration(tripData.duration)}</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon icon="lucide:users" className="w-5 h-5 mr-2" />
              <span>Up to {maxPersons} people</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon
                icon="lucide:star"
                className="w-5 h-5 mr-2 fill-current text-yellow-400"
              />
              <span>4.8 (126 reviews)</span>
            </div>
            {tripData.difficulty && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon icon="lucide:trending-up" className="w-5 h-5 mr-2" />
                <span>{tripData.difficulty}</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {pricing.discounted ? (
                <>
                  <span className="text-white/60 line-through text-2xl">
                    €{pricing.original}
                  </span>
                  <span className="text-4xl md:text-5xl font-black text-white">
                    €{pricing.discounted}
                  </span>
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    {pricing.discount}% OFF
                  </span>
                </>
              ) : (
                <span className="text-4xl md:text-5xl font-black text-white">
                  €{pricing.original}
                </span>
              )}
            </div>
            <span className="text-white/80 text-xl">/person</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
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

            {/* Enhanced Photo Gallery */}
            {tripData.images && tripData.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <Icon
                    icon="lucide:camera"
                    className="w-8 h-8 mr-3 text-blue-600"
                  />
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-48 rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`${tripData.name} - Photo ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included / Not Included */}
            {(tripData?.included || tripData?.not_included) && (
              <div className="grid md:grid-cols-2 gap-8">
                {tripData?.included &&
                  Array.isArray(tripData.included) &&
                  tripData.included.length > 0 && (
                    <div className="bg-green-50 rounded-2xl shadow-xl p-8">
                      <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                        <Icon
                          icon="lucide:check-circle"
                          className="w-6 h-6 mr-2"
                        />
                        What's Included
                      </h3>
                      <ul className="space-y-2">
                        {tripData.included.map((item, index) => (
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

                {tripData?.not_included &&
                  Array.isArray(tripData.not_included) &&
                  tripData.not_included.length > 0 && (
                    <div className="bg-red-50 rounded-2xl shadow-xl p-8">
                      <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                        <Icon icon="lucide:x-circle" className="w-6 h-6 mr-2" />
                        Not Included
                      </h3>
                      <ul className="space-y-2">
                        {tripData.not_included.map((item, index) => (
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
            )}

            {/* Terms & Conditions */}
            {tripData?.terms_and_conditions &&
              Array.isArray(tripData.terms_and_conditions) &&
              tripData.terms_and_conditions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Icon
                      icon="lucide:file-text"
                      className="w-8 h-8 mr-3 text-blue-600"
                    />
                    Terms & Conditions - Notes
                  </h2>
                  <ul className="space-y-3">
                    {tripData.terms_and_conditions.map((term, index) => (
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
              )}
          </div>

          {/* Right Column - Enhanced Booking Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                {/* Pricing Header */}
                <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {pricing.discounted ? (
                      <>
                        <span className="text-gray-400 line-through text-2xl">
                          €{pricing.original}
                        </span>
                        <span className="text-4xl font-black text-blue-600">
                          €{pricing.discounted}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-black text-blue-600">
                        €{pricing.original}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 font-medium">per adult</p>
                  {tripData.child_price && (
                    <p className="text-gray-500 text-sm mt-1">
                      Child: €{Math.round(tripData.child_price)}
                    </p>
                  )}
                </div>

                {/* Enhanced Booking Form */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Icon
                      icon="lucide:calendar-check"
                      className="w-6 h-6 mr-2 text-blue-600"
                    />
                    Book Your Adventure
                  </h3>

                  {/* Error Display */}
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

                  {/* Form Fields */}
                  <div className="space-y-4">
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
                      onChange={(value) =>
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
                      onChange={(value) => handleInputChange("currency", value)}
                      options={currencies}
                      placeholder="Select Currency *"
                      searchable={true}
                      icon="grommet-icons:currency"
                      required
                      error={formErrors.currency}
                    />

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
                        placeholder="Children"
                        defaultValue="0"
                        error={formErrors.children}
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
                  </div>

                  {/* Price Summary */}
                  {(formData.adults > 0 || formData.children > 0) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-gray-800">
                        Price Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Adults ({formData.adults}x):</span>
                          <span>
                            €
                            {Math.round(
                              (tripData.adult_price || 0) * formData.adults
                            )}
                          </span>
                        </div>
                        {formData.children > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Children ({formData.children}x):</span>
                            <span>
                              €
                              {Math.round(
                                (tripData.child_price ||
                                  (tripData.adult_price || 0) * 0.5) *
                                  formData.children
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-800">
                          <span>Total:</span>
                          <span>€{totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon
                          icon="lucide:loader-2"
                          className="w-5 h-5 animate-spin"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="lucide:calendar-check"
                          className="w-5 h-5"
                        />
                        Book Now - €
                        {totalPrice > 0
                          ? totalPrice
                          : pricing.discounted || pricing.original}
                      </>
                    )}
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
                    <span>Pay Online or on Arrival</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <Icon
                      icon="lucide:phone"
                      className="w-5 h-5 mr-2 text-cyan-600"
                    />
                    <span>24/7 Support: +20 123 456 789</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        totalAmount={totalPrice}
        bookingData={{
          adults: formData.adults,
          children: formData.children,
          adultPrice: Math.round(tripData?.adult_price || 0),
          childPrice: Math.round(
            tripData?.child_price || (tripData?.adult_price || 0) * 0.5
          ),
        }}
      />
    </div>
  );
};

export default TripPage;

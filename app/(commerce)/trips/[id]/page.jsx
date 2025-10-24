// app/trips/[id]/page.js

"use client";

import Input from "@/components/ui/Input";
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import Select from "@/components/ui/Select";
import { getData, postData } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatDuration } from "@/utils/formatDurations";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              `/packages/${trip.package_id}/trips`
            );
            otherTrips = (tripsInPackage?.data || [])
              .filter((t) => t.id.toString() !== id.toString())
              .slice(0, 3); // Show up to 3 other trips
          } catch (err) {
            console.warn(
              "Failed to load package data or trips from package:",
              err
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

  useEffect(() => {
    if (tripData && !tripData.child_allowed && formData.children > 0) {
      setFormData((prev) => ({ ...prev, children: 0 }));
    }
  }, [tripData, formData.children]);

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
    if (!tripData) return { original: 0, final: 0, discount: null };

    const pricing = getCurrentPricing();
    const originalPrice = Math.round(
      formData.adults * pricing.adult + formData.children * pricing.child
    );

    const discount = calculateDiscount();

    if (discount.isApplied) {
      const finalPrice = Math.round(
        originalPrice * (1 - discount.percentage / 100)
      );
      return { original: originalPrice, final: finalPrice, discount };
    }

    return { original: originalPrice, final: originalPrice, discount };
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name])
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      // --- Use the final price from our new calculation ---
      const { final: finalPrice } = calculateTotalPrice();

      const peopleCount = formData.adults + formData.children;
      const bookingTime = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      });

      const invoiceDescription = `Trip Booking: ${tripData.name}\nCustomer: ${
        formData.fullName
      }\nDate of Trip: ${formatDate(formData.preferredDate)}\nGuests: ${
        formData.adults
      } Adult(s), ${
        formData.children
      } Child(ren) - Total ${peopleCount}.\nHotel: ${
        formData.hotelName
      }, Room #${
        formData.roomNumber
      }.\nBooking placed on: ${bookingTime}.\nSpecial Requests: ${
        formData.specialRequests || "None"
      }`;

      const invoicePayload = {
        buyer_name: formData.fullName,
        buyer_email: formData.email,
        buyer_phone: formData.phone,
        invoice_description: invoiceDescription,
        activity: tripData.name,
        activity_details: [
          {
            name: tripData.name,
            activity_date: formData.preferredDate,
            adults: formData.adults,
            children: formData.children,
            hotel_name: formData.hotelName,
            room_number: formData.roomNumber,
            special_requests: formData.specialRequests,
          },
        ],
        picked_up: false,
        amount: finalPrice, // Use the final calculated price
        currency: formData.currency,
      };

      const invoiceResponse = await postData(
        "/invoices/",
        invoicePayload,
        true
      );
      toast.success("Invoice created! Opening payment page...");
      if (invoiceResponse.pay_url) {
        window.open(invoiceResponse.pay_url, "_blank");
        router.push(`/invoices/${invoiceResponse.id}`);
      } else {
        throw new Error("Payment URL not received from server.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        "Booking failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
          <div className="mt-4 flex items-center gap-2">
            <Icon
              icon="mdi:information-outline"
              className="w-4 h-4 text-white/70"
            />
            <span className="text-white/70 text-sm">
              Prices are charged in EGP. Your bank will handle currency
              conversion.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* ... Left Column (no changes needed here) ... */}
          <div className="lg:col-span-2 space-y-8">
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
                            otherTrip.images?.[0] || "/placeholder-image.jpg"
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
                            otherTrip.duration_unit
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

                    {/* --- CHANGE: Add conditional info box --- */}
                    {formData.currency !== "EGP" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start">
                          <Icon
                            icon="mdi:information-outline"
                            className="w-5 h-5 mr-2 mt-0.5 text-blue-600 flex-shrink-0"
                          />
                          <div className="text-blue-800">
                            <strong>Please Note:</strong> All prices are in EGP.
                            The final amount in{" "}
                            <strong>{formData.currency}</strong> will be
                            calculated by payment provider on the payment page.
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

                  {/* --- CHANGE: Price summary now always shows EGP --- */}
                  {(formData.adults > 0 || formData.children > 0) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <Icon icon="mdi:calculator" className="w-4 h-4 mr-2" />
                        Price Summary (EGP)
                      </h4>
                      <div className="space-y-1 text-sm">
                        {/* Display itemized breakdown */}
                        <div className="flex justify-between text-gray-600">
                          <span>Adults ({formData.adults}x):</span>
                          <span>
                            EGP{" "}
                            {formatPrice(
                              currentPricing.adult * formData.adults
                            )}
                          </span>
                        </div>
                        {formData.children > 0 && tripData.child_allowed && (
                          <div className="flex justify-between text-gray-600">
                            <span>Children ({formData.children}x):</span>
                            <span>
                              EGP{" "}
                              {formatPrice(
                                currentPricing.child * formData.children
                              )}
                            </span>
                          </div>
                        )}

                        {/* Display Total and Discount */}
                        <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-800 items-end">
                          <span>Total:</span>
                          <div className="text-right">
                            {appliedDiscount.isApplied && (
                              <span className="text-gray-400 line-through text-sm mr-2">
                                EGP {formatPrice(originalTotalPrice)}
                              </span>
                            )}
                            <span className="text-blue-600">
                              EGP {formatPrice(finalTotalPrice)}
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
                      </div>
                    </div>
                  )}

                  {/* --- CHANGE: Book Now button now always shows EGP --- */}
                  <button
                    type="submit"
                    disabled={isSubmitting || currentPricing.adult <= 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : `Book Now - EGP ${formatPrice(finalTotalPrice)}`}
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
    </div>
  );
};

export default TripPage;

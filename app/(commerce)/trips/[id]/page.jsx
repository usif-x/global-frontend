// app/trips/[id]/page.js

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getData, postData } from "@/lib/server-axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

// Main Server Component
const TripPage = async ({ params, searchParams }) => {
  const { id } = params;

  // Enhanced error handling with better logging
  let tripData = null;
  let packageData = null;
  let relatedTrips = null;

  try {
    // Fetch trip data
    tripData = await getData(`/trips/${id}`);

    if (!tripData) {
      console.warn(`Trip with ID ${id} not found`);
      notFound();
    }

    // Fetch related data in parallel
    const promises = [];

    if (tripData.package_id) {
      promises.push(
        getData(`/packages/${tripData.package_id}`)
          .then((data) => (packageData = data))
          .catch((err) => {
            console.warn(
              `Package ${tripData.package_id} not found:`,
              err.message
            );
            packageData = null;
          })
      );
    }

    // Fetch related trips (optional)
    promises.push(
      getData("/trips?limit=3&exclude=" + id)
        .then((data) => (relatedTrips = data))
        .catch((err) => {
          console.warn("Failed to fetch related trips:", err.message);
          relatedTrips = [];
        })
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error.message);
    notFound();
  }

  // Enhanced Server Action for booking
  async function handleBooking(formData) {
    "use server";

    try {
      // Extract and validate form data
      const bookingData = {
        fullName: formData.get("fullName")?.toString().trim(),
        email: formData.get("email")?.toString().trim().toLowerCase(),
        phone: formData.get("phone")?.toString().trim(),
        nationality: formData.get("nationality")?.toString(),
        hotelName: formData.get("hotelName")?.toString().trim(),
        roomNumber: formData.get("roomNumber")?.toString().trim(),
        adults: parseInt(formData.get("adults")) || 1,
        children: parseInt(formData.get("children")) || 0,
        preferredDate: formData.get("preferredDate")?.toString(),
        specialRequests:
          formData.get("specialRequests")?.toString().trim() || "",
      };

      // Enhanced server-side validation
      const errors = [];

      if (!bookingData.fullName || bookingData.fullName.length < 2) {
        errors.push("Full name is required (minimum 2 characters)");
      }

      if (
        !bookingData.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)
      ) {
        errors.push("Valid email address is required");
      }

      if (!bookingData.phone || bookingData.phone.length < 10) {
        errors.push("Valid phone number is required");
      }

      if (!bookingData.nationality) {
        errors.push("Nationality is required");
      }

      if (!bookingData.hotelName) {
        errors.push("Hotel name is required");
      }

      if (!bookingData.roomNumber) {
        errors.push("Room number is required");
      }

      if (!bookingData.preferredDate) {
        errors.push("Preferred date is required");
      } else {
        const selectedDate = new Date(bookingData.preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          errors.push("Preferred date cannot be in the past");
        }
      }

      if (
        bookingData.adults < 1 ||
        bookingData.adults > (tripData.maxim_person || 10)
      ) {
        errors.push(
          `Number of adults must be between 1 and ${
            tripData.maxim_person || 10
          }`
        );
      }

      if (bookingData.children < 0) {
        errors.push("Number of children cannot be negative");
      }

      if (
        bookingData.adults + bookingData.children >
        (tripData.maxim_person || 10)
      ) {
        errors.push(
          `Total participants cannot exceed ${tripData.maxim_person || 10}`
        );
      }

      if (errors.length > 0) {
        const errorMessage = errors.join(", ");
        redirect(`/trips/${id}?error=${encodeURIComponent(errorMessage)}`);
      }

      // Calculate total price
      const adultPrice = tripData.adult_price || 0;
      const childPrice = tripData.child_price || adultPrice * 0.5;
      const totalPrice =
        bookingData.adults * adultPrice + bookingData.children * childPrice;

      // Prepare booking payload
      const bookingPayload = {
        trip_id: parseInt(id),
        trip_name: tripData.name,
        total_price: totalPrice,
        booking_date: new Date().toISOString(),
        status: "pending",
        ...bookingData,
      };

      // Submit booking with auth if needed
      const bookingResponse = await postData("/bookings", bookingPayload, true);

      console.log("Booking submitted successfully:", bookingResponse);

      // Redirect to success page with booking ID
      redirect(`/booking/success?booking=${bookingResponse.id || "confirmed"}`);
    } catch (error) {
      console.error("Booking submission failed:", error);

      let errorMessage = "Booking submission failed. Please try again later.";

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid booking data";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (error.response?.status === 409) {
        errorMessage = "This time slot is no longer available";
      }

      redirect(`/trips/${id}?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  // Calculate pricing and options
  const pricing = formatPrice(
    tripData.adult_price,
    tripData.has_discount,
    tripData.discount_percentage
  );
  const maxPersons = tripData.maxim_person || 10;

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
                <p className="leading-relaxed">{tripData.description}</p>
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
                <form action={handleBooking} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Icon
                      icon="lucide:calendar-check"
                      className="w-6 h-6 mr-2 text-blue-600"
                    />
                    Book Your Adventure
                  </h3>

                  {/* Error Display */}
                  {searchParams.error && (
                    <div
                      className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg"
                      role="alert"
                    >
                      <div className="flex">
                        <Icon
                          icon="lucide:alert-circle"
                          className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <strong className="font-bold">Booking Error:</strong>
                          <span className="block sm:inline ml-1">
                            {decodeURIComponent(searchParams.error)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <Input
                      name="fullName"
                      placeholder="Full Name *"
                      required
                      icon="mdi:account-outline"
                      className="text-lg"
                    />

                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address *"
                      required
                      icon="mdi:email-outline"
                      className="text-lg"
                    />

                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number *"
                      required
                      icon="mdi:phone-outline"
                      className="text-lg"
                    />

                    <Select
                      name="nationality"
                      options={countries}
                      placeholder="Select Nationality *"
                      searchable={true}
                      icon="mdi:flag-outline"
                      required
                    />

                    <Input
                      name="hotelName"
                      placeholder="Hotel Name *"
                      required
                      icon="mdi:hotel"
                      className="text-lg"
                    />

                    <Input
                      name="roomNumber"
                      placeholder="Room Number *"
                      required
                      icon="mdi:door"
                      className="text-lg"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        name="adults"
                        options={adultOptions}
                        placeholder="Adults *"
                        defaultValue="1"
                        required
                      />
                      <Select
                        name="children"
                        options={childrenOptions}
                        placeholder="Children"
                        defaultValue="0"
                      />
                    </div>

                    <Input
                      name="preferredDate"
                      type="date"
                      placeholder="Preferred Date *"
                      required
                      icon="mdi:calendar"
                      min={new Date().toISOString().split("T")[0]}
                      className="text-lg"
                    />

                    <Input
                      name="specialRequests"
                      textarea
                      placeholder="Special Requests (Optional)"
                      icon="mdi:message-text-outline"
                      rows="3"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:calendar-check" className="w-5 h-5" />
                    Book Now - €{pricing.discounted || pricing.original}
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
                    <span>Pay on Arrival Available</span>
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

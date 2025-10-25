"use client";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import { useState } from "react";

const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    contactReason: null,
    subject: "",
    message: "",
  });

  // Contact reason options
  const contactReasons = [
    {
      value: "trip",
      label: "🏖️ Trip Inquiry",
      description: "Ask about our amazing trips and destinations",
    },
    {
      value: "course",
      label: "📚 Course Information",
      description: "Learn about our educational courses",
    },
    {
      value: "discount",
      label: "🏷️ Available Discounts",
      description: "Discover current promotions and special offers",
    },
    {
      value: "booking",
      label: "✈️ Booking Support",
      description: "Need help with your existing booking",
    },
    {
      value: "general",
      label: "💬 General Question",
      description: "Any other questions or feedback",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, contactReason: selectedOption }));
    if (errors.contactReason) {
      setErrors((prev) => ({ ...prev, contactReason: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.contactReason) {
      newErrors.contactReason =
        "Please select what you want to contact us about";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form submitted:", formData);
      setIsSubmitted(true);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        contactReason: null,
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:check-circle"
                className="w-10 h-10 text-green-600"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Message Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will
              get back to you within 24 hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6">
            <Icon icon="mdi:message-text" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our trips, courses, or special offers? We'd
            love to hear from you! Send us a message and we'll respond as soon
            as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Contact Form</h2>
            <p className="text-blue-100">
              Fill out the form below and we'll get back to you shortly
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Name Fields */}
            <div className="grid  gap-6">
              <Input
                icon="mdi:account"
                name="firstName"
                type="text"
                placeholder="Full Name *"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                color="blue"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                icon="mdi:email"
                name="email"
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                color="blue"
                required
                disabled={isLoading}
              />
              <Input
                icon="mdi:phone"
                name="phone"
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                color="blue"
                required
                disabled={isLoading}
              />
            </div>

            {/* Contact Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to contact us about? *
              </label>
              <Select
                icon="mdi:help-circle"
                name="contactReason"
                options={contactReasons}
                placeholder="Select a reason for contacting us"
                value={formData.contactReason}
                onChange={handleSelectChange}
                error={errors.contactReason}
                disabled={isLoading}
                color="turquoise"
                required
              />
              {formData.contactReason && (
                <div className="mt-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                  <div className="flex items-start space-x-3">
                    <Icon
                      icon="mdi:information"
                      className="w-5 h-5 text-cyan-600 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-cyan-900">
                        {formData.contactReason.label}
                      </p>
                      <p className="text-xs text-cyan-700 mt-1">
                        {formData.contactReason.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <Input
              icon="mdi:text-subject"
              name="subject"
              type="text"
              placeholder="Subject *"
              value={formData.subject}
              onChange={handleInputChange}
              error={errors.subject}
              color="purple"
              required
              disabled={isLoading}
            />

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message *
              </label>
              <Input
                icon="mdi:message-text"
                name="message"
                textarea
                rows={6}
                placeholder="Tell us more about your inquiry... (minimum 10 characters)"
                value={formData.message}
                onChange={handleInputChange}
                error={errors.message}
                color="green"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send" className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:phone" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Call Us
            </h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-500 mt-1">Mon-Fri 9AM-6PM</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:email" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-gray-600">support@yourcompany.com</p>
            <p className="text-sm text-gray-500 mt-1">We reply within 24h</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:map-marker" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Visit Us
            </h3>
            <p className="text-gray-600">123 Travel Street</p>
            <p className="text-sm text-gray-500 mt-1">
              Adventure City, AC 12345
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

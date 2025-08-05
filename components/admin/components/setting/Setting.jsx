"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Local Imports
import Input from "@/components/ui/Input"; // Your custom Input component
import SettingService from "@/services/settingService"; // Your service file

// Enhanced skeleton loader component
const SettingsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
        <div>
          <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>

    {/* Section skeletons */}
    {[...Array(4)].map((_, sectionIndex) => (
      <div
        key={sectionIndex}
        className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, inputIndex) => (
            <div key={inputIndex} className="space-y-3">
              <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
              <div className="h-12 w-full bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Submit button skeleton */}
    <div className="flex justify-end">
      <div className="h-14 w-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
    </div>
  </div>
);

// Enhanced form section component
const FormSection = ({ title, icon, description, children, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
    <div className={`${gradient} rounded-t-2xl p-6`}>
      <div className="flex items-center gap-3 text-white">
        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
          <Icon icon={icon} className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          {description && (
            <p className="text-white/80 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{children}</div>
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          isActive ? "bg-green-500" : "bg-yellow-500"
        }`}
      ></div>
      {isActive ? "Live" : "Maintenance"}
    </div>
  );
};

export default function AdminSettingsPage() {
  // State for form data, loading, and submission status
  const [settings, setSettings] = useState({
    website_title: "",
    logo_url: "",
    default_currency: "USD",
    website_status: "active",
    contact_phone: "",
    contact_whatsapp: "",
    contact_email: "",
    social_links: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        const data = await SettingService.get();
        // Ensure all keys exist to prevent uncontrolled component errors
        setSettings({
          website_title: data.website_title || "",
          logo_url: data.logo_url || "",
          default_currency: data.default_currency || "USD",
          website_status: data.website_status || "active",
          contact_phone: data.contact_phone || "",
          contact_whatsapp: data.contact_whatsapp || "",
          contact_email: data.contact_email || "",
          social_links: {
            facebook: data.social_links?.facebook || "",
            twitter: data.social_links?.twitter || "",
            instagram: data.social_links?.instagram || "",
            linkedin: data.social_links?.linkedin || "",
          },
        });
      } catch (err) {
        toast.error("Failed to load settings. Please refresh the page.");
        setError("Could not fetch website settings.");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Generic handler for top-level form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Specific handler for nested social_links object
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [name]: value,
      },
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    toast.info("Updating settings...", {
      icon: "⚙️",
    });

    // Filter out empty social links before sending
    const cleanedSocialLinks = Object.entries(settings.social_links)
      .filter(([_, url]) => url)
      .reduce((obj, [key, url]) => {
        obj[key] = url;
        return obj;
      }, {});

    const payload = { ...settings, social_links: cleanedSocialLinks };

    try {
      await SettingService.update(payload);
      toast.success("Settings updated successfully!", {
        icon: "✅",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "An error occurred while updating.",
        {
          icon: "❌",
        }
      );
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        <div className="container mx-auto p-6 lg:p-8">
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Icon icon="mdi:alert-circle" className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Settings
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isFormDisabled = isUpdating;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Icon icon="mdi:cog" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Website Settings
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure your platform's core settings and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={settings.website_status} />
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings Section */}
          <FormSection
            title="General Settings"
            icon="mdi:web"
            description="Basic website information and branding"
            gradient="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <Input
              icon="mdi:format-title"
              name="website_title"
              placeholder="Your Website Name"
              label="Website Title"
              value={settings.website_title}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
              required
            />
            <Input
              icon="mdi:image-outline"
              name="logo_url"
              placeholder="https://example.com/logo.png"
              label="Logo URL"
              type="url"
              value={settings.logo_url}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
          </FormSection>

          {/* Configuration Section */}
          <FormSection
            title="System Configuration"
            icon="mdi:tune"
            description="Platform behavior and default settings"
            gradient="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Input
              icon="mdi:currency-usd"
              name="default_currency"
              placeholder="e.g., USD, EUR, GBP"
              label="Default Currency"
              value={settings.default_currency}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
              required
            />
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Website Status
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:power"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <select
                  name="website_status"
                  value={settings.website_status}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="active">🟢 Active (Live)</option>
                  <option value="maintenance">🟡 Maintenance Mode</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">
                {settings.website_status === "active"
                  ? "Website is live and accessible to all users"
                  : "Website shows maintenance page to visitors"}
              </p>
            </div>
          </FormSection>

          {/* Contact Information Section */}
          <FormSection
            title="Contact Information"
            icon="mdi:contact-mail"
            description="How users can reach your support team"
            gradient="bg-gradient-to-r from-green-600 to-green-700"
          >
            <Input
              icon="mdi:email-outline"
              name="contact_email"
              placeholder="support@example.com"
              label="Support Email"
              type="email"
              value={settings.contact_email}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:phone"
              name="contact_phone"
              placeholder="+1 (555) 123-4567"
              label="Contact Phone"
              value={settings.contact_phone}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:whatsapp"
              name="contact_whatsapp"
              placeholder="+1 (555) 123-4567"
              label="WhatsApp Business"
              value={settings.contact_whatsapp}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
          </FormSection>

          {/* Social Media Section */}
          <FormSection
            title="Social Media Presence"
            icon="mdi:share-variant"
            description="Connect your social media accounts"
            gradient="bg-gradient-to-r from-pink-600 to-orange-600"
          >
            <Input
              icon="mdi:facebook"
              name="facebook"
              placeholder="https://facebook.com/yourpage"
              label="Facebook Page"
              type="url"
              value={settings.social_links.facebook}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:twitter"
              name="twitter"
              placeholder="https://twitter.com/yourhandle"
              label="Twitter/X Profile"
              type="url"
              value={settings.social_links.twitter}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:instagram"
              name="instagram"
              placeholder="https://instagram.com/yourprofile"
              label="Instagram Account"
              type="url"
              value={settings.social_links.instagram}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:linkedin"
              name="linkedin"
              placeholder="https://linkedin.com/company/yourcompany"
              label="LinkedIn Company"
              type="url"
              value={settings.social_links.linkedin}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
          </FormSection>

          {/* Enhanced Submit Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Save?
                </h3>
                <p className="text-gray-600 text-sm">
                  Review your changes before saving to the system
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={isFormDisabled}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormDisabled}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isUpdating ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                      />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="mdi:content-save"
                        className="-ml-1 mr-3 h-5 w-5"
                      />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

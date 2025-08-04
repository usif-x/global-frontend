"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Local Imports
import Input from "@/components/ui/Input"; // Your custom Input component
import SettingService from "@/services/settingService"; // Your service file

// A skeleton loader component to show while fetching data
const SettingsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[...Array(3)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, inputIndex) => (
            <div key={inputIndex} className="space-y-2">
              <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
              <div className="h-11 w-full bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className="flex justify-end">
      <div className="h-12 w-32 bg-slate-300 rounded-lg"></div>
    </div>
  </div>
);

// Helper component for form sections
const FormSection = ({ title, children }) => (
  <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-200/80">
    <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
      {children}
    </div>
  </div>
);

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
    toast.info("Updating settings...");

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
      toast.success("Settings updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "An error occurred while updating."
      );
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <SettingsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        {error}
      </div>
    );
  }

  const isFormDisabled = isUpdating;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Website Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage general website configuration and contact information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings Section */}
          <FormSection title="General Settings">
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
              icon="mdi:link-variant"
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
          <FormSection title="Configuration">
            <Input
              icon="mdi:currency-usd"
              name="default_currency"
              placeholder="e.g., USD, EUR"
              label="Default Currency"
              value={settings.default_currency}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website Status
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:power"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                />
                <select
                  name="website_status"
                  value={settings.website_status}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance Mode</option>
                </select>
              </div>
            </div>
          </FormSection>

          {/* Contact Information Section */}
          <FormSection title="Contact Information">
            <Input
              icon="mdi:email-outline"
              name="contact_email"
              placeholder="contact@example.com"
              label="Contact Email"
              type="email"
              value={settings.contact_email}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:phone"
              name="contact_phone"
              placeholder="+1 234 567 890"
              label="Contact Phone"
              value={settings.contact_phone}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:whatsapp"
              name="contact_whatsapp"
              placeholder="+1 234 567 890"
              label="WhatsApp Number"
              value={settings.contact_whatsapp}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
          </FormSection>

          {/* Social Media Section */}
          <FormSection title="Social Media Links">
            <Input
              icon="mdi:facebook"
              name="facebook"
              placeholder="https://facebook.com/yourpage"
              label="Facebook"
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
              label="Twitter"
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
              label="Instagram"
              type="url"
              value={settings.social_links.instagram}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
            <Input
              icon="mdi:linkedin"
              name="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              label="LinkedIn"
              type="url"
              value={settings.social_links.linkedin}
              onChange={handleSocialLinkChange}
              disabled={isFormDisabled}
              color="turquoise"
            />
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isFormDisabled}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
            >
              {isUpdating ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

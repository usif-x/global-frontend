"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { putData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProfileDetails = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({ fullName: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.full_name || "" });
    }
  }, [user]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await putData(
        "/users/update",
        { full_name: formData.fullName },
        true
      );
      const data = await response;
      onUpdate({ name: data.full_name, updated_at: data.updated_at });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
            <Icon icon="mdi:account-details" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Profile Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <Input
          dir="ltr"
          placeholder="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          icon="mdi:account-outline"
          color="cyan"
          disabled={isLoading}
        />
        <Input
          dir="ltr"
          placeholder="Email Address"
          name="email"
          value={user.email || ""}
          icon="ic:twotone-email"
          color="cyan"
          disabled
        />
        <div className="pt-4 flex justify-start">
          <Button
            type="submit"
            color="cyan"
            text={isLoading ? "Saving..." : "Save Changes"}
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default ProfileDetails;

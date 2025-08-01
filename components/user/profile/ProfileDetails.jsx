"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { putData } from "@/lib/axios";
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
      onUpdate({ name: data.full_name, updated_at: data.updated_at }); // **UPDATE:** Pass new data to store
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
      <h2 className="text-2xl font-semibold text-gray-800">Profile Details</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <Input
          dir="ltr"
          placeholder="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          icon="mdi:account-outline"
          color="turquoise"
          disabled={isLoading}
        />
        <Input
          dir="ltr"
          placeholder="Email Address"
          name="email"
          value={user.email || ""}
          icon="ic:twotone-email"
          color="turquoise"
          disabled
        />
        <div className="pt-2 w-full flex justify-start">
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

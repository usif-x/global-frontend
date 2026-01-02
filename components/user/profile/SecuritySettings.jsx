"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { putData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";

const SecuritySettings = ({ onPasswordChangeSuccess }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      await putData(
        "/users/update/password",
        {
          old_password: passwords.currentPassword,
          new_password: passwords.newPassword,
        },
        true
      );
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(
        "Password changed successfully! You have been logged out for security. Please log in again."
      );
      onPasswordChangeSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
            <Icon icon="mdi:shield-lock" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Security Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your password and security preferences
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleChangePassword} className="space-y-6">
        <Input
          dir="ltr"
          placeholder="Current Password"
          name="currentPassword"
          type="password"
          value={passwords.currentPassword}
          onChange={handleInputChange}
          icon="solar:password-bold-duotone"
          color="cyan"
          disabled={isLoading}
        />
        <Input
          dir="ltr"
          placeholder="New Password"
          name="newPassword"
          type="password"
          value={passwords.newPassword}
          onChange={handleInputChange}
          icon="ph:password-duotone"
          color="cyan"
          disabled={isLoading}
        />
        <Input
          dir="ltr"
          placeholder="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={passwords.confirmPassword}
          onChange={handleInputChange}
          icon="ph:password-duotone"
          color="cyan"
          disabled={isLoading}
        />
        <div className="pt-4">
          <Button
            type="submit"
            color="cyan"
            text={isLoading ? "Updating..." : "Update Password"}
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;

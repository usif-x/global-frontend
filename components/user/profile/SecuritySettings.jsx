"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { putData } from "@/lib/axios";
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

      // **FIX:** Call the logout function passed from the parent
      onPasswordChangeSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <Input
          dir="ltr"
          placeholder="Current Password"
          name="currentPassword"
          type="password"
          value={passwords.currentPassword}
          onChange={handleInputChange}
          icon="solar:password-bold-duotone"
          color="turquoise"
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
          color="turquoise"
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
          color="turquoise"
          disabled={isLoading}
        />
        <div className="pt-2">
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

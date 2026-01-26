"use client";

import Alert from "@/components/ui/Alert";
import CoursesTab from "@/components/user/profile/Courses";
import NotificationsTab from "@/components/user/profile/Notifications";
import ProfileDetails from "@/components/user/profile/ProfileDetails";
import SecuritySettings from "@/components/user/profile/SecuritySettings";
import TestimonialTab from "@/components/user/profile/Testimonials";
import { getData } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const SidebarSkeleton = () => (
  <aside className="lg:col-span-3 animate-pulse">
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-200 to-blue-200" />
        <div className="h-6 w-3/5 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200 mt-2" />
      </div>
      <nav className="mt-8 space-y-2">
        <div className="h-12 w-full rounded-lg bg-slate-200" />
        <div className="h-12 w-full rounded-lg bg-slate-200" />
        <div className="h-12 w-full rounded-lg bg-slate-200" />
      </nav>
    </div>
  </aside>
);

const ContentSkeleton = () => (
  <div className="lg:col-span-9 animate-pulse">
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
      <div className="h-8 w-1/3 rounded bg-slate-200" />
      <div className="border-t border-slate-200 pt-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-1/4 h-5 rounded bg-slate-200" />
          <div className="w-2/4 h-10 rounded-lg bg-slate-200" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-1/4 h-5 rounded bg-slate-200" />
          <div className="w-2/4 h-10 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  </div>
);

const ProfilePageSkeleton = () => (
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      <SidebarSkeleton />
      <ContentSkeleton />
    </div>
  </div>
);

// ============================================================================
//  2. CHILD COMPONENTS (for better structure and separation of concerns)
// ============================================================================

const UserProfileSidebar = ({ user, activeTab, onTabChange }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString.replace(" ", "T")).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const TabButton = ({ tabName, icon, label }) => (
    <button
      onClick={() => onTabChange(tabName)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === tabName
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon icon={icon} className="mr-3 h-5 w-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="lg:col-span-3">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 sticky top-24">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="relative">
            <Image
              src={user?.avatar_url || "/image/diver.png"}
              alt={user?.name || "User"}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-cyan-500/20"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center">
              <Icon icon="mdi:check" className="text-white text-xs" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {user?.full_name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2 mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Member since</span>
            <span className="font-medium text-slate-700">
              {formatDate(user?.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Last login</span>
            <span className="font-medium text-slate-700">
              {formatDate(user?.last_login)}
            </span>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          <TabButton
            tabName="details"
            icon="mdi:account-details"
            label="Profile Details"
          />
          <TabButton
            tabName="security"
            icon="mdi:shield-lock"
            label="Security Settings"
          />
          <TabButton tabName="courses" icon="mdi:school" label="My Courses" />
          <TabButton
            tabName="notifications"
            icon="mdi:bell"
            label="Notifications"
          />
          <TabButton
            tabName="testimonials"
            icon="mdi:comment-quote"
            label="Testimonials"
          />
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <Alert
            children="Need to delete your account? Contact us via chat."
            type="danger"
          />
        </div>
      </div>
    </aside>
  );
};

// ============================================================================
//  3. MAIN PAGE COMPONENT (The Controller)
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, token, updateUser, logout } = useAuthStore();

  const [localUser, setLocalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch user data from the backend when component mounts or token changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setIsLoading(false);
        // This will be caught by the authentication check effect
        return;
      }

      try {
        const response = await getData("/users/me", true);
        setLocalUser(response);
        updateUser(response); // Keep the global store in sync
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          logout();
        } else {
          setError("Failed to load your profile. Please try refreshing.");
        }
        console.error("Fetch user data error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token, updateUser, logout]);

  // Centralized authentication check and redirection
  useEffect(() => {
    // On first load, wait until loading is complete
    if (isLoading) return;

    // After loading, if there's no token/auth or an error occurred, redirect
    if (!isAuthenticated || error) {
      if (error) toast.error(error);
      else toast.warn("You must be logged in to view this page.");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, error, router]);

  // Callback for when the user successfully changes their password
  const handlePasswordChangeSuccess = useCallback(() => {
    toast.success("Password changed successfully. Please log in again.");
    logout();
    router.push("/login");
  }, [logout, router]);

  // Callback for when user details are updated
  const handleProfileUpdate = useCallback(
    (updatedUserData) => {
      setLocalUser(updatedUserData); // Update local state
      updateUser(updatedUserData); // Update global store
      toast.success("Profile updated successfully!");
    },
    [updateUser],
  );

  // Use memoization to define tab content for scalability
  const tabContent = useMemo(
    () => ({
      details: (
        <ProfileDetails user={localUser} onUpdate={handleProfileUpdate} />
      ),
      security: (
        <SecuritySettings
          onPasswordChangeSuccess={handlePasswordChangeSuccess}
        />
      ),
      courses: <CoursesTab />,
      notifications: <NotificationsTab />,
      testimonials: <TestimonialTab />,
    }),
    [localUser, handleProfileUpdate, handlePasswordChangeSuccess],
  );

  // Show skeletons during initial load to prevent layout shift
  if (isLoading) {
    return (
      <div className=" min-h-screen pt-20">
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Icon icon="mdi:account-circle" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
              </div>
            </div>
          </div>
        </div>
        <ProfilePageSkeleton />
      </div>
    );
  }

  // If not loading and no user (due to error or auth failure), show nothing until redirect happens
  if (!localUser) {
    return null; // Or a minimal loader/message
  }

  return (
    <div className=" min-h-screen pt-20">
      {/* Modern Header */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8">
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:account-circle" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                My Profile
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your account settings, courses and more.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <UserProfileSidebar
            user={localUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="lg:col-span-9 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 transition-all duration-300">
              <div className="p-6 sm:p-8">{tabContent[activeTab]}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

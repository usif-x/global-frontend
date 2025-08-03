"use client";

import Alert from "@/components/ui/Alert";
import CoursesTab from "@/components/user/profile/Courses";
import InvoicesTab from "@/components/user/profile/Invoices";
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
  <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3 animate-pulse">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-24 h-24 rounded-full bg-gray-200" />
      <div className="h-6 w-3/5 rounded bg-gray-200" />
      <div className="h-4 w-4/5 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-200 mt-2" />
    </div>
    <nav className="mt-8 space-y-2">
      <div className="h-10 w-full rounded-md bg-gray-200" />
      <div className="h-10 w-full rounded-md bg-gray-200" />
    </nav>
  </aside>
);

const ContentSkeleton = () => (
  <div className="lg:col-span-9 animate-pulse">
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-1/4 h-5 rounded bg-gray-200" />
          <div className="w-2/4 h-8 rounded bg-gray-200" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-1/4 h-5 rounded bg-gray-200" />
          <div className="w-2/4 h-8 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

const ProfilePageSkeleton = () => (
  <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
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
      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName
          ? "bg-cyan-100 text-cyan-700 shadow-inner"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon icon={icon} className="mr-3 h-6 w-6 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
      <div className="flex flex-col items-center space-y-3 text-center">
        <Image
          src={user?.avatar_url || "/image/diver.png"} // Use a real avatar if available
          alt={user?.name || "User"}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div className="mt-2">
          <h2 className="text-xl font-bold text-gray-800">{user?.full_name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 mt-2 w-full">
          Member since: {formatDate(user?.created_at)}
        </div>
        <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 mt-2 w-full">
          Updated at: {formatDate(user?.updated_at)}
        </div>
        <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 mt-2 w-full">
          Last login: {formatDate(user?.last_login)}
        </div>
        <div className="mt-2">
          <Alert
            children="If you want to delete your account, please contact us from chatbot."
            type="danger"
          />
        </div>
      </div>
      <nav className="mt-6 space-y-1">
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
        <TabButton tabName="invoices" icon="mdi:receipt" label="Invoices" />

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
    [updateUser]
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
      invoices: <InvoicesTab />,
      notifications: <NotificationsTab />,
      testimonials: <TestimonialTab />,
    }),
    [localUser, handleProfileUpdate, handlePasswordChangeSuccess]
  );

  // Show skeletons during initial load to prevent layout shift
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen pt-20">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              My Profile
            </h1>
          </div>
        </header>
        <ProfilePageSkeleton />
      </div>
    );
  }

  // If not loading and no user (due to error or auth failure), show nothing until redirect happens
  if (!localUser) {
    return null; // Or a minimal loader/message
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            My Profile
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          <UserProfileSidebar
            user={localUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9 mt-6 lg:mt-0">
            <div className="bg-white shadow-lg rounded-lg transition-all duration-300">
              {/* Render the active tab's component */}
              <div className="p-6 sm:p-8">{tabContent[activeTab]}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const cookieStorage = {
  getItem: (name) => {
    return Cookies.get(name) || null;
  },
  setItem: (name, value) => {
    Cookies.set(name, value, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });
  },
  removeItem: (name) => {
    Cookies.remove(name, { path: "/" });
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      admin: null,
      token: null,
      userType: null,
      hasHydrated: false, // 👈 NEW

      login: ({ user, token }) => {
        set({
          isAuthenticated: true,
          user,
          token,
          userType: "user",
          admin: null,
        });
      },

      adminLogin: ({ admin, token }) => {
        // Decode the token to get the role (or get it from the API response)
        const payload = JSON.parse(atob(token.split(".")[1]));
        set({
          isAuthenticated: true,
          admin,
          token,
          userType: "admin",
          user: null,
          userRole: payload.role, // store actual role
          tokenValid: true,
          tokenVerified: new Date().toISOString(),
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          admin: null,
          token: null,
          userType: null,
        });
      },

      updateUser: (newUserData) => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                ...newUserData,
              },
            };
          }
          return state;
        });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      isAdmin: () => get().userType === "admin" && get().admin !== null,
      isUser: () => get().userType === "user" && get().user !== null,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        admin: state.admin,
        token: state.token,
        userType: state.userType,
        tokenValid: state.tokenValid, // persist
        tokenVerified: state.tokenVerified,
        userRole: state.userRole,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Called once rehydration finishes (success or fail)
        useAuthStore.getState().setHasHydrated(true);
      },
    },
  ),
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

const cookieStorage = {
  getItem: (name) => {
    return Cookies.get(name) || null;
  },
  setItem: (name, value) => {
    Cookies.set(name, value, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/'
    });
  },
  removeItem: (name) => {
    Cookies.remove(name, { path: '/' });
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

      login: ({ user, token }) => {
        set({ 
          isAuthenticated: true, 
          user, 
          token,
          userType: 'user',
          admin: null
        });
      },

      adminLogin: ({ admin, token }) => {
        set({ 
          isAuthenticated: true, 
          admin, 
          token,
          userType: 'admin',
          user: null
        });
      },

      logout: () => {
        set({ 
          isAuthenticated: false, 
          user: null,
          admin: null,
          token: null,
          userType: null
        });
      },

      // --- 👇 أضف هذه الدالة هنا 👇 ---
      updateUser: (newUserData) => {
        set((state) => {
          // تأكد من أن هناك مستخدم لتحديثه
          if (state.user) {
            return {
              user: {
                ...state.user, // احتفظ بالبيانات القديمة
                ...newUserData, // ادمج البيانات الجديدة معها
              },
            };
          }
          return state; // إذا لم يكن هناك مستخدم، لا تفعل شيئًا
        });
      },
      // --- 👆 نهاية الدالة المضافة 👆 ---

      isAdmin: () => get().userType === 'admin' && get().admin !== null,
      isUser: () => get().userType === 'user' && get().user !== null,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        admin: state.admin,
        token: state.token,
        userType: state.userType
      }),
    }
  )
);
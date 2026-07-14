import { create } from "zustand";

const USER_KEY = "auth_user";
const LEGACY_USER_KEY = "user";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  // Đăng nhập: lưu user
  login: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
      }
      set({
        isAuthenticated: Boolean(user),
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  },

  // Đăng xuất
  logout: () => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      set({
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  },

  // Khởi tạo: khôi phục user đã lưu (phiên auth thực tế được xác thực bằng cookie)
  initialize: () => {
    try {
      const userString =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
      const user = userString ? JSON.parse(userString) : null;

      if (user) {
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      set({ isLoading: false });
    }
  },
}));

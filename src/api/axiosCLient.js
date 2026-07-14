import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Flag để tránh refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const shouldSkipRefresh = (url = "") => {
  const normalizedUrl = String(url).toLowerCase();
  return (
    normalizedUrl.includes("/auth/login") ||
    normalizedUrl.includes("/auth/refresh")
  );
};

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor: tự động refresh token khi 401
api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config || {};

    if (shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh thì đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token bằng cookie
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Retry các request đang đợi
        processQueue(null);

        // Retry request gốc
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> logout
        processQueue(refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

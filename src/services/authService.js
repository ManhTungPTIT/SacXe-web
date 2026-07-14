import { api } from "../api/axiosCLient";

const authService = {
  login: async ({ email, password }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  checkAuth: async () => {
    try {
      const response = await api.post("/auth/check-auth");
      return response;
    } catch (error) {
      console.error("Error checking auth:", error);
      throw error;
    }
  },
};

export default authService;

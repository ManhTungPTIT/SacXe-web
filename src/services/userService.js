import { api } from "../api/axiosCLient";

const userService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/user/getAll");
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  // Chỉ superadmin gọi được: danh sách quản trị viên để chọn người quản lý
  // chung cư.
  getAllAdmin: async () => {
    try {
      const response = await api.get("/user/admins");
      return response;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  },
  getDetails: async (userId) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  },
};

export default userService;

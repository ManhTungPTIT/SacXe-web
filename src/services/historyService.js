import { api } from "../api/axiosCLient";

const historyService = {
  getAdminHistory: async ({ fromDate, toDate }) => {
    try {
      const response = await api.get("/history/get-admin-history", {
        params: { fromDate, toDate },
      });
      return response;
    } catch (error) {
      console.error("Error fetching admin history:", error);
      throw error;
    }
  },
};

export default historyService;

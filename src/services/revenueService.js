import { api } from "../api/axiosCLient";

const revenueService = {
  getRevenue: async () => {
    try {
      const response = await api.get("/revenue/get-revenue");
      return response;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  },
};

export default revenueService;

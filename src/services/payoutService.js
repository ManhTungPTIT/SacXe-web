import { api } from "../api/axiosCLient";

const payoutService = {
  createPayout: async () => {
    try {
      const response = await api.post("/payout/create-payout");
      return response;
    } catch (error) {
      console.error("Error creating payout:", error);
      throw error;
    }
  },
  acceptPayout: async (payoutId) => {
    try {
      const response = await api.post(`/payout/accept-payout/${payoutId}`);
      return response;
    } catch (error) {
      console.error("Error accepting payout:", error);
      throw error;
    }
  },
};

export default payoutService;

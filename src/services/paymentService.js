import { api } from "../api/axiosCLient";

const paymentService = {
  addPaymentProfile: async (paymentProfileData) => {
    try {
      const response = await api.post(
        "/payment/add-payment-profile",
        paymentProfileData,
      );
      return response;
    } catch (error) {
      console.error("Error adding payment profile:", error);
      throw error;
    }
  },
  getPaymentProfile: async () => {
    try {
      const response = await api.get("/payment/get-payment-profile");
      return response;
    } catch (error) {
      console.error("Error fetching payment profile:", error);
      throw error;
    }
  },
};

export default paymentService;

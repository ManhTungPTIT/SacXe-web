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
  getAdminTransactions: async ({ status, page = 1, limit = 20 } = {}) => {
    try {
      const response = await api.get("/payment/admin/transactions", {
        params: { status, page, limit },
      });
      return response;
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      throw error;
    }
  },
  getReconciliationStatus: async () => {
    try {
      const response = await api.get("/payment/admin/reconciliation-status");
      return response;
    } catch (error) {
      console.error("Error fetching reconciliation status:", error);
      throw error;
    }
  },
  confirmTransaction: async (transactionId) => {
    try {
      const response = await api.post(
        `/payment/admin/transactions/${transactionId}/confirm`,
      );
      return response;
    } catch (error) {
      console.error("Error confirming transaction:", error);
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

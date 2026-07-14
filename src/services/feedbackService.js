import { api } from "../api/axiosCLient";

const feedbackService = {
  getFeedbacks: async () => {
    try {
      const response = await api.get("/feedback/get-feedbacks");
      return response;
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      throw error;
    }
  },
};

export default feedbackService;

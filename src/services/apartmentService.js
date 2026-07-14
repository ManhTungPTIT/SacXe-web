import { api } from "../api/axiosCLient";

const apartmentService = {
  getAll: async () => {
    try {
      const respnose = await api.get("/apartment/get-all");
      return respnose;
    } catch (error) {
      console.error("Error fetching apartments:", error);
      throw error;
    }
  },
  addApartment: async (apartmentData) => {
    try {
      const response = await api.post("/apartment/add", apartmentData);
      return response;
    } catch (error) {
      console.error("Error adding apartment:", error);
      throw error;
    }
  },
  getApartmentDetails: async (apartmentId) => {
    try {
      const response = await api.get(`/apartment/${apartmentId}`);
      return response;
    } catch (error) {
      console.error("Error fetching apartment details:", error);
      throw error;
    }
  },
};

export default apartmentService;

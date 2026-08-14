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
  assignAdmin: async (apartmentId, adminId) => {
    try {
      const response = await api.put(`/apartment/${apartmentId}/admin`, {
        adminId,
      });
      return response;
    } catch (error) {
      console.error("Error assigning apartment admin:", error);
      throw error;
    }
  },
};

export default apartmentService;

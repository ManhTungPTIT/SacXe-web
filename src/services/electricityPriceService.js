import { api } from "../api/axiosCLient";

const electricityPriceService = {
  getPrice: async () => {
    const response = await api.get("/apartment/electricity-price");
    return response;
  },
  updatePrice: async (price) => {
    const response = await api.put("/apartment/electricity-price", { price });
    return response;
  },
  getHistory: async () => {
    const response = await api.get("/apartment/electricity-price/history");
    return response;
  },
};

export default electricityPriceService;

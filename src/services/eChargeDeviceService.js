import { api } from "../api/axiosCLient";

const eChargeDeviceService = {
  add: async (deviceData) => {
    try {
      const response = await api.post("/e-charge-device/add", deviceData);
      return response;
    } catch (error) {
      console.error("Error adding e-charge device:", error);
      throw error;
    }
  },
};

export default eChargeDeviceService;

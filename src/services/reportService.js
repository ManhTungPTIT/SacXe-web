import { api } from "../api/axiosCLient";

const reportService = {
  getReports: async ({ fromDate, toDate }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const url =
        user.role === "admin"
          ? "/report/get-admin-report"
          : "/report/get-super-admin-report";
      const response = await api.get(url, {
        params: { fromDate, toDate },
      });
      return response;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },
};

export default reportService;

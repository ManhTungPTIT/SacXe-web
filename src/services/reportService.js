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
  // Endpoint riêng, không gộp vào getReports: hai bên chạy trên hai khoảng thời
  // gian khác nhau (báo cáo là lũy kế toàn thời gian, biểu đồ này đổi theo lựa
  // chọn của người xem). Route dùng chung cho admin lẫn super admin, backend tự
  // khoá phạm vi chung cư theo token.
  getTopUpGrowth: async ({ fromDate, toDate, groupBy }) => {
    try {
      const response = await api.get("/report/get-topup-growth", {
        params: { fromDate, toDate, groupBy },
      });
      return response;
    } catch (error) {
      console.error("Error fetching top-up growth:", error);
      throw error;
    }
  },
};

export default reportService;

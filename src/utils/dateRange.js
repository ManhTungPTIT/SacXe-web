// Quy đổi mốc thời gian của dropdown trang Doanh thu thành cặp ngày gửi lên
// /report/get-admin-report.
//
// Mốc hiểu theo nghĩa TRƯỢT, không theo kỳ lịch: "1 tháng" là 30 ngày gần nhất
// chứ không phải "từ ngày 1 tháng này". Cùng quy ước với TOP_UP_RANGES trên
// trang Thống kê, và tránh việc sáng ngày 1 hàng tháng con số tụt về gần 0.

export const REVENUE_RANGES = {
  today: { label: "Hôm nay", days: 1 },
  "7d": { label: "1 tuần", days: 7 },
  "30d": { label: "1 tháng", days: 30 },
  "90d": { label: "1 quý", days: 90 },
  "365d": { label: "1 năm", days: 365 },
};

// Mặc định 1 tháng chứ không phải "Hôm nay": chọn hôm nay thì phần lớn buổi
// sáng trang sẽ hiện 0 đồng, trông như hỏng.
export const DEFAULT_REVENUE_RANGE = "30d";

const pad2 = (value) => String(value).padStart(2, "0");

const toDateParam = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

// now là tham số để test được mà không phải giả lập đồng hồ hệ thống.
export const getRangeParams = (rangeKey, now = new Date()) => {
  const preset =
    REVENUE_RANGES[rangeKey] || REVENUE_RANGES[DEFAULT_REVENUE_RANGE];

  const end = new Date(now);
  const start = new Date(now);
  // days - 1 vì khoảng đã bao gồm hôm nay. setDate tự cuộn qua mốc tháng/năm,
  // nên lùi 30 ngày từ 02/01 ra đúng ngày tháng 12 năm trước.
  start.setDate(end.getDate() - (preset.days - 1));

  return {
    fromDate: toDateParam(start),
    toDate: toDateParam(end),
  };
};

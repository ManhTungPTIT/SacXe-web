import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import EvStationRoundedIcon from "@mui/icons-material/EvStationRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import useReport from "../../hooks/queries/useReport";
import { getRangeParams } from "../../utils/dateRange";

// Đọc từ khối `rangeSummary` của getReport, không phải mảng `kpis`. Mảng đó
// được HomePage.jsx và AnalyticsPage.jsx render toàn bộ một cách tổng quát, nên
// nó không nhận thêm phần tử mới; rangeSummary là khối riêng cho đúng hàng này.
//
// Mỗi mục có { amount, display }: `display` là chuỗi đã định dạng để hiện,
// `amount` là số thô để quyết định màu (lỗ thì đỏ) mà không phải dò dấu trừ
// trong chuỗi.
const KPI_VIEWS = [
  {
    summaryKey: "cost",
    title: "Chi phí",
    helper: "Tiền điện phải trả theo khung giờ trong khoảng.",
    icon: <ReceiptLongRoundedIcon fontSize="small" />,
    color: "#b45309",
  },
  {
    summaryKey: "revenue",
    title: "Doanh thu",
    helper: "Tiền sạc thu được trong khoảng đã chọn.",
    icon: <PaidRoundedIcon fontSize="small" />,
    color: "#0f766e",
  },
  {
    summaryKey: "chargeCount",
    title: "Số lần sạc",
    helper: "Tổng số phiên sạc trong khoảng.",
    icon: <EvStationRoundedIcon fontSize="small" />,
    color: "#1d4ed8",
  },
  {
    summaryKey: "energy",
    title: "Điện năng tiêu thụ",
    helper: "Tổng điện năng các phiên sạc trong khoảng.",
    icon: <BoltRoundedIcon fontSize="small" />,
    color: "#be123c",
  },
];

// Màu cho số lỗ. Giá cao điểm 3.640đ/kWh so với giá bán mặc định 6.000đ/kWh là
// biên hẹp nên lỗ là chuyện có thể xảy ra thật, không được lọt qua mắt.
const LOSS_COLOR = "#be123c";

const RevenueRangeCards = ({ range }) => {
  const { fromDate, toDate } = getRangeParams(range);
  const { data, isLoading, isError } = useReport.useGetReport({
    fromDate,
    toDate,
  });

  const summary = data?.rangeSummary;

  const renderValue = (view) => {
    if (isLoading) return "Đang tải...";
    if (isError) return "Không tải được";
    return summary?.[view.summaryKey]?.display ?? "—";
  };

  // Chỉ lỗ mới đổi màu; số dương giữ màu đen như ba ô còn lại.
  const valueColorOf = (view) => {
    const amount = Number(summary?.[view.summaryKey]?.amount);
    return Number.isFinite(amount) && amount < 0 ? LOSS_COLOR : "text.primary";
  };

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Box
        sx={{
          display: "grid",
          // Bốn card trên một hàng từ lg trở lên. Dưới ngưỡng đó lùi về 2 cột:
          // tiêu đề "Điện năng tiêu thụ" và số tiền có dấu phân cách không đủ
          // chỗ trong một phần tư màn hình hẹp.
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.6,
        }}
      >
        {KPI_VIEWS.map((view, index) => {
          return (
            <Card
              key={view.summaryKey}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(view.color, 0.2)}`,
                boxShadow: 0,
                animation: "riseUp 460ms ease",
                animationDelay: `${120 + index * 60}ms`,
                animationFillMode: "both",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 10px 22px ${alpha(view.color, 0.18)}`,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {view.title}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      sx={{
                        mt: 0.5,
                        // Bốn card một hàng thì h5 mặc định làm số tiền dài bị
                        // tràn; thu nhỏ đúng ở ngưỡng chuyển sang 4 cột.
                        fontSize: { xs: "1.5rem", lg: "1.32rem" },
                        lineHeight: 1.25,
                        color: valueColorOf(view),
                      }}
                    >
                      {renderValue(view)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: 1.8,
                      display: "grid",
                      placeItems: "center",
                      color: view.color,
                      backgroundColor: alpha(view.color, 0.14),
                    }}
                  >
                    {view.icon}
                  </Box>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {view.helper}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default RevenueRangeCards;

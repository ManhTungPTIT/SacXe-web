import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import useReport from "../../hooks/queries/useReport";
import { getRangeParams } from "../../utils/dateRange";

// getReport trả KPI dưới dạng chuỗi đã định dạng sẵn ("1.234.567 VND"), không
// phải số — nên component này chỉ hiển thị nguyên văn. Muốn so sánh kỳ hay vẽ
// biểu đồ thì phải sửa backend cho trả số thô, không làm được ở phía client.
//
// Đọc theo id chứ không theo chỉ số mảng: với vai admin getReport luôn trả đúng
// hai KPI này, nhưng đọc theo id thì đổi thứ tự cũng không gãy.
const KPI_VIEWS = [
  {
    kpiId: "warning",
    title: "Số tiền tiêu thụ",
    helper: "Tiền sạc phát sinh trong khoảng đã chọn.",
    icon: <PaidRoundedIcon fontSize="small" />,
    color: "#b45309",
  },
  {
    kpiId: "danger",
    title: "Điện năng tiêu thụ",
    helper: "Tổng điện năng các phiên sạc trong khoảng.",
    icon: <BoltRoundedIcon fontSize="small" />,
    color: "#be123c",
  },
];

const RevenueRangeCards = ({ range }) => {
  const { fromDate, toDate } = getRangeParams(range);
  const { data, isLoading, isError } = useReport.useGetReport({
    fromDate,
    toDate,
  });

  const kpis = Array.isArray(data?.kpis) ? data.kpis : [];
  const valueOf = (kpiId) => kpis.find((kpi) => kpi.id === kpiId)?.value ?? "0";

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography variant="caption" sx={{ color: "#5b6572" }}>
        {`Số liệu theo khoảng: từ ${fromDate} đến ${toDate}`}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.6,
        }}
      >
        {KPI_VIEWS.map((view, index) => (
          <Card
            key={view.kpiId}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(view.color, 0.2)}`,
              boxShadow: 0,
              animation: "riseUp 460ms ease",
              animationDelay: `${120 + index * 60}ms`,
              animationFillMode: "both",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {view.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                    {isLoading
                      ? "Đang tải..."
                      : isError
                        ? "Không tải được"
                        : valueOf(view.kpiId)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
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
        ))}
      </Box>
    </Box>
  );
};

export default RevenueRangeCards;

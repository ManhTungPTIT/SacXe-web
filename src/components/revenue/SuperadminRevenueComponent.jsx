import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Tính năng rút tiền đã được gỡ khỏi hệ thống (thực tế không cho rút). Trang
// được giữ lại làm chỗ đặt nội dung doanh thu toàn hệ thống sau này, nên không
// gọi API nào — mọi endpoint /payout đã bị xoá ở backend.
const SuperadminRevenueComponent = () => {
  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        display: "grid",
        gap: 2,
        borderRadius: 4,
        background: `radial-gradient(circle at 6% -12%, ${alpha("#0369a1", 0.2)} 0%, transparent 45%), radial-gradient(circle at 100% 14%, ${alpha("#f59e0b", 0.16)} 0%, transparent 42%)`,
      }}
    >
      <Card
        sx={{
          borderRadius: 4,
          color: "#fff",
          background:
            "linear-gradient(125deg, #0c4a6e 0%, #0369a1 55%, #38bdf8 100%)",
          boxShadow: "0 20px 44px rgba(3, 105, 161, 0.28)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
          <Stack spacing={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
              }}
            >
              Doanh thu toàn hệ thống
            </Typography>
            <Typography sx={{ opacity: 0.94 }}>
              Chức năng rút tiền đã ngừng hoạt động.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: "1px solid #d9dee8", boxShadow: 0 }}>
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Box
            sx={{
              border: "1px dashed #d9dee8",
              borderRadius: 2.2,
              p: { xs: 2.6, md: 3.2 },
              textAlign: "center",
              backgroundColor: alpha("#f3f6fb", 0.7),
            }}
          >
            <InboxRoundedIcon sx={{ color: "#718096", fontSize: 38, mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
              Chưa có nội dung hiển thị
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.6, maxWidth: 520, mx: "auto" }}
            >
              Luồng rút tiền và lịch sử duyệt yêu cầu đã được gỡ khỏi hệ thống.
              Trang này được giữ lại để bổ sung báo cáo doanh thu toàn hệ thống
              sau này.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperadminRevenueComponent;

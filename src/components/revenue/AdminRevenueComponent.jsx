import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import useRevenue from "../../hooks/queries/useRevenue";
import ElectricityPriceCard from "./ElectricityPriceCard";

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} VNĐ`;
};

const AdminRevenueComponent = () => {
  const { data: responseData, isError, error } = useRevenue.useGetRevenue();

  const payload = responseData?.data ?? responseData;
  const revenueRecord =
    payload?.revenue && typeof payload.revenue === "object"
      ? payload.revenue?.revenue
      : null;

  const hasRevenueRecord = Boolean(revenueRecord);
  const currentRevenue = Number(revenueRecord?.revenue) || 0;
  const totalRevenue = Number(revenueRecord?.totalRevenue) || 0;

  const summaryCards = [
    {
      title: "Doanh thu hiện có",
      value: formatCurrency(currentRevenue),
      helper: "Số dư doanh thu đang ghi nhận cho chung cư.",
      icon: <AccountBalanceWalletRoundedIcon fontSize="small" />,
      color: "#0f766e",
    },
    {
      title: "Doanh thu lũy kế",
      value: formatCurrency(totalRevenue),
      helper: "Tổng doanh thu từ trước tới giờ.",
      icon: <SavingsRoundedIcon fontSize="small" />,
      color: "#1d4ed8",
    },
  ];

  if (isError) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #fecaca" }}>
        <CardContent>
          <Typography color="error" fontWeight={700}>
            Đã xảy ra lỗi khi tải doanh thu!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            {error?.response?.data?.message ||
              "Vui lòng kiểm tra kết nối hoặc thử lại sau."}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        display: "grid",
        gap: 2.2,
        borderRadius: 4,
        background: `radial-gradient(circle at 3% -12%, ${alpha("#0f766e", 0.2)} 0%, transparent 43%), radial-gradient(circle at 100% 8%, ${alpha("#d97706", 0.16)} 0%, transparent 38%)`,
        "@keyframes riseUp": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          color: "#fff",
          background:
            "linear-gradient(125deg, #064e3b 0%, #0f766e 50%, #34d399 100%)",
          boxShadow: "0 20px 40px rgba(6, 95, 70, 0.28)",
          animation: "riseUp 420ms ease",
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
                }}
              >
                Quản lý doanh thu
              </Typography>
              <Typography sx={{ mt: 0.8, opacity: 0.94 }}>
                Theo dõi dòng tiền ghi nhận được của chung cư.
              </Typography>
            </Box>

            <Chip
              label={
                hasRevenueRecord ? "Đang ghi nhận" : "Chưa có dữ liệu doanh thu"
              }
              sx={{
                color: "#fff",
                fontWeight: 700,
                backgroundColor: alpha("#fff", 0.2),
                borderRadius: 1.8,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

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
        {summaryCards.map((item, index) => (
          <Card
            key={item.title}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(item.color, 0.2)}`,
              boxShadow: 0,
              animation: "riseUp 460ms ease",
              animationDelay: `${120 + index * 60}ms`,
              animationFillMode: "both",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 10px 22px ${alpha(item.color, 0.18)}`,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                    {item.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.8,
                    display: "grid",
                    placeItems: "center",
                    color: item.color,
                    backgroundColor: alpha(item.color, 0.14),
                  }}
                >
                  {item.icon}
                </Box>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {item.helper}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #d9dee8",
          boxShadow: "none",
          animation: "riseUp 540ms ease",
          width: "100%",
        }}
      >
        <CardContent sx={{ pb: 1.1, width: "100%" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountBalanceWalletRoundedIcon
              fontSize="small"
              sx={{ color: "#3f4b5a" }}
            />
            <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
              Doanh thu chung cư
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#d9dee8" }} />

        <CardContent sx={{ p: { xs: 1.6, md: 2 }, width: "100%" }}>
          <Box
            sx={{
              p: 1.4,
              borderRadius: 2,
              border: `1px solid ${alpha("#0f766e", 0.2)}`,
              backgroundColor: alpha("#0f766e", 0.06),
            }}
          >
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Doanh thu đã ghi nhận
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.5, fontWeight: 700, color: "#0f766e" }}
            >
              {formatCurrency(currentRevenue)}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.6, color: "#5b6572" }}>
              {hasRevenueRecord
                ? "Số liệu cập nhật theo từng phiên sạc phát sinh."
                : "Chung cư chưa phát sinh doanh thu nào."}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ElectricityPriceCard />
    </Box>
  );
};

export default AdminRevenueComponent;

import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
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
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import useRevenue from "../../hooks/queries/useRevenue";
import {
  DEFAULT_REVENUE_RANGE,
  REVENUE_RANGES,
} from "../../utils/dateRange";
import ElectricityPriceCard from "./ElectricityPriceCard";
import RevenueRangeCards from "./RevenueRangeCards";

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} VNĐ`;
};

const AdminRevenueComponent = () => {
  const { data: responseData, isError, error } = useRevenue.useGetRevenue();
  const [range, setRange] = useState(DEFAULT_REVENUE_RANGE);

  // Thân response là { revenue: { revenue: [...] }, message }: controller bọc
  // một lớp, service bọc thêm một lớp nữa, và tầng trong cùng là MẢNG các bản
  // ghi doanh thu theo ngày (revenue.service.js gom mỗi ngày một document).
  //
  // Bản cũ đọc `payload.revenue.revenue` như một object rồi lấy `.revenue` của
  // nó — trên một mảng thì thuộc tính đó là undefined, Number(undefined) là NaN
  // và `|| 0` nuốt luôn thành 0. Thẻ vì thế luôn hiện "0 VNĐ" kể cả khi chung cư
  // đã ghi nhận lợi nhuận.
  const payload = responseData?.data ?? responseData;
  const revenueRows = Array.isArray(payload?.revenue?.revenue)
    ? payload.revenue.revenue
    : [];

  const hasRevenueRecord = revenueRows.length > 0;
  const currentRevenue = revenueRows.reduce(
    (total, row) => total + (Number(row?.revenue) || 0),
    0,
  );

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

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.2}
              sx={{ flexWrap: "wrap", rowGap: 1 }}
            >
              <Chip
                label={
                  hasRevenueRecord
                    ? "Đang ghi nhận"
                    : "Chưa có dữ liệu doanh thu"
                }
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  backgroundColor: alpha("#fff", 0.2),
                  borderRadius: 1.8,
                }}
              />

              {/* Nền card là gradient tối nên ô chọn phải có nền sáng riêng,
                  nếu không chữ đen trên nền xanh đậm gần như không đọc được. */}
              <TextField
                select
                size="small"
                value={range}
                onChange={(event) => setRange(event.target.value)}
                sx={{
                  minWidth: 140,
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              >
                {Object.entries(REVENUE_RANGES).map(([key, preset]) => (
                  <MenuItem key={key} value={key}>
                    {preset.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <RevenueRangeCards range={range} />

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
              Lợi nhuận chung cư
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#d9dee8" }} />

        {/* Con số này KHÔNG theo khoảng lọc ở trên — nó là số dư của cả chung
            cư. Để chung hàng với dải KPI theo khoảng thì người đọc sẽ tưởng nó
            cũng đổi theo ô chọn khoảng. */}
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
              Lợi nhuận đã ghi nhận
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.5, fontWeight: 700, color: "#0f766e" }}
            >
              {formatCurrency(currentRevenue)}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.6, color: "#5b6572" }}>
              {hasRevenueRecord
                ? "Số dư lợi nhuận đang ghi nhận cho chung cư."
                : "Chung cư chưa phát sinh lợi nhuận nào."}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ElectricityPriceCard />
    </Box>
  );
};

export default AdminRevenueComponent;

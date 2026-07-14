import { useState } from "react";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { toast } from "react-toastify";
import useRevenue from "../../hooks/queries/useRevenue";
import usePayout from "../../hooks/queries/usePayout";

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} VNĐ`;
};

const toPercent = (value) => {
  const parsed = Number(value) || 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const AdminRevenueComponent = () => {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useRevenue.useGetRevenue();

  const payload = responseData?.data ?? responseData;
  const revenueRecord =
    payload?.revenue && typeof payload.revenue === "object"
      ? payload.revenue?.revenue
      : null;

  const hasRevenueRecord = Boolean(revenueRecord);
  const currentRevenue = Number(revenueRecord?.revenue) || 0;
  const totalRevenue = Number(revenueRecord?.totalRevenue) || 0;
  const spentRevenue = Math.max(totalRevenue - currentRevenue, 0);
  const currentRatio =
    totalRevenue > 0 ? (currentRevenue / totalRevenue) * 100 : 0;
  const spentRatio = totalRevenue > 0 ? (spentRevenue / totalRevenue) * 100 : 0;
  const payouts = Array.isArray(revenueRecord?.payouts)
    ? payload?.revenue.payouts
    : [];
  const payoutCount = payouts.length;
  const canWithdraw = hasRevenueRecord && currentRevenue > 0;

  const { mutateAsync: createPayout, isLoading: isCreatingPayout } =
    usePayout.useCreatePayout();

  const handleOpenWithdrawDialog = () => {
    if (!canWithdraw) {
      toast.info("Hiện chưa có số dư khả dụng để rút.");
      return;
    }

    setWithdrawDialogOpen(true);
  };

  const handleCloseWithdrawDialog = () => {
    if (isCreatingPayout) return;
    setWithdrawDialogOpen(false);
  };

  const handleConfirmWithdraw = () => {
    if (!canWithdraw) {
      toast.info("Hiện chưa có số dư khả dụng để rút.");
      return;
    }
    createPayout(
      {},
      {
        onSuccess: () => {
          toast.success("Yêu cầu rút tiền đã được tạo thành công!");
          handleCloseWithdrawDialog();
        },
        onError: (requestError) => {
          handleCloseWithdrawDialog();
          toast.error(
            requestError?.response?.data?.message ||
              "Đã có lỗi xảy ra khi tạo yêu cầu rút tiền. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  const summaryCards = [
    {
      title: "Doanh thu hiện có",
      value: formatCurrency(currentRevenue),
      helper: "Số dư đang có thể rút.",
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
    {
      title: "Số lần rút tiền",
      value: payoutCount,
      helper: "Số lần rút tiền đã được ghi nhận.",
      icon: <ReceiptLongRoundedIcon fontSize="small" />,
      color: "#be123c",
    },
    {
      title: "Tỷ lệ số dư còn lại",
      value: `${toPercent(currentRatio)}%`,
      helper: `${toPercent(spentRatio)}% doanh thu đã được chi trả.`,
      icon: <TrendingUpRoundedIcon fontSize="small" />,
      color: "#b45309",
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
    <>
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
                  Theo dõi dòng tiền và thực hiện yêu cầu rút tiền về tài khoản
                  nhận của chung cư.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Chip
                  label={canWithdraw ? "Sẵn sàng rút" : "Chưa có số dư rút"}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    backgroundColor: alpha("#fff", 0.2),
                    borderRadius: 1.8,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PaidRoundedIcon />}
                  onClick={handleOpenWithdrawDialog}
                  disabled={!canWithdraw || isCreatingPayout}
                  sx={{
                    px: 2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    backgroundColor: "#fff",
                    color: "#065f46",
                    boxShadow: "0 10px 18px rgba(8, 29, 57, 0.22)",
                    "&:hover": {
                      backgroundColor: alpha("#fff", 0.92),
                    },
                    "&.Mui-disabled": {
                      color: alpha("#065f46", 0.6),
                      backgroundColor: alpha("#fff", 0.65),
                    },
                  }}
                >
                  {isCreatingPayout ? "Đang xử lý..." : "Rút tiền về tài khoản"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
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

        <Box
          sx={{
            display: "grid",
            gap: 1.6,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "0.95fr 1.25fr",
            },
            width: "100%",
          }}
        >
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
                <PaidRoundedIcon fontSize="small" sx={{ color: "#3f4b5a" }} />
                <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                  Rút tiền
                </Typography>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: "#d9dee8" }} />

            <CardContent
              sx={{
                p: { xs: 1.6, md: 2 },
                display: "grid",
                gap: 1.2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  p: 1.4,
                  borderRadius: 2,
                  border: `1px solid ${alpha("#0f766e", 0.2)}`,
                  backgroundColor: alpha("#0f766e", 0.06),
                }}
              >
                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                  Số dư khả dụng để rút
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mt: 0.5, fontWeight: 700, color: "#0f766e" }}
                >
                  {formatCurrency(currentRevenue)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ mt: 0.6, color: "#5b6572" }}
                >
                  {canWithdraw
                    ? "Yêu cầu rút sẽ được xử lý theo tài khoản nhận tiền đã cấu hình."
                    : "Hiện chưa có số dư để tạo yêu cầu rút tiền."}
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<PaidRoundedIcon />}
                  onClick={handleOpenWithdrawDialog}
                  disabled={!canWithdraw || isCreatingPayout}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    backgroundColor: "#0f766e",
                    "&:hover": {
                      backgroundColor: "#0a5a54",
                    },
                  }}
                >
                  {isCreatingPayout
                    ? "Đang gửi yêu cầu..."
                    : "Rút toàn bộ số dư"}
                </Button>

                <Chip
                  label={`Đã rút: ${formatCurrency(spentRevenue)}`}
                  sx={{
                    borderRadius: 1.7,
                    backgroundColor: alpha("#be123c", 0.12),
                    color: "#9f1239",
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #d9dee8",
              boxShadow: "none",
              animation: "riseUp 560ms ease",
              width: "100%",
            }}
          >
            <CardContent sx={{ pb: 1.1, width: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ReceiptLongRoundedIcon
                  fontSize="small"
                  sx={{ color: "#3f4b5a" }}
                />
                <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                  Lịch sử rút tiền
                </Typography>
                <Typography variant="body2" sx={{ color: "#687282" }}>
                  ({payoutCount} mục)
                </Typography>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: "#d9dee8" }} />

            <CardContent
              sx={{
                p: { xs: 1.6, md: 2 },
                display: "grid",
                gap: 1.1,
                width: "100%",
              }}
            >
              {!hasRevenueRecord || payoutCount === 0 ? (
                <Box
                  sx={{
                    border: "1px dashed #d9dee8",
                    borderRadius: 2.2,
                    p: { xs: 2.3, md: 2.7 },
                    textAlign: "center",
                    backgroundColor: alpha("#f3f6fb", 0.7),
                  }}
                >
                  <InboxRoundedIcon
                    sx={{ color: "#718096", fontSize: 34, mb: 0.8 }}
                  />
                  <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                    Chưa có lịch sử rút tiền
                  </Typography>
                </Box>
              ) : (
                payouts.map((item, index) => {
                  const payout =
                    typeof item === "string" ? { _id: item } : item || {};
                  const id = payout?._id;
                  const amount = Number(payout?.amount) || 0;
                  const status = String(payout?.status || "").toLowerCase();
                  const statusConfig = {
                    pending: {
                      label: "Đang chờ",
                      color: "#b45309",
                      background: alpha("#f59e0b", 0.12),
                    },
                    approved: {
                      label: "Đã duyệt",
                      color: "#0f766e",
                      background: alpha("#14b8a6", 0.12),
                    },
                    completed: {
                      label: "Hoàn tất",
                      color: "#166534",
                      background: alpha("#22c55e", 0.12),
                    },
                    success: {
                      label: "Thành công",
                      color: "#166534",
                      background: alpha("#22c55e", 0.12),
                    },
                    rejected: {
                      label: "Từ chối",
                      color: "#b91c1c",
                      background: alpha("#ef4444", 0.12),
                    },
                    failed: {
                      label: "Thất bại",
                      color: "#b91c1c",
                      background: alpha("#ef4444", 0.12),
                    },
                    canceled: {
                      label: "Đã hủy",
                      color: "#475569",
                      background: alpha("#64748b", 0.12),
                    },
                  }[status] || {
                    label: status || "Không rõ",
                    color: "#475569",
                    background: alpha("#64748b", 0.12),
                  };
                  const createdAt = payout?.createdAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(payout.createdAt))
                    : "N/A";

                  return (
                    <Box
                      key={id || `payout-${index}`}
                      sx={{
                        borderRadius: 2.5,
                        border: "1px solid #e2e8f0",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.92) 100%)",
                        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                        p: 1.8,
                        display: "grid",
                        gap: 1.3,
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          borderColor: "#cbd5e1",
                          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.1)",
                        },
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              mt: 0.1,
                              fontWeight: 800,
                              color: "#0f172a",
                              lineHeight: 1.15,
                            }}
                          >
                            {formatCurrency(amount)}
                          </Typography>
                        </Box>

                        <Chip
                          label={statusConfig.label}
                          sx={{
                            fontWeight: 700,
                            color: statusConfig.color,
                            backgroundColor: statusConfig.background,
                            borderRadius: 1.6,
                          }}
                        />
                      </Stack>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            backgroundColor: alpha("#334155", 0.04),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Tạo lúc
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 700, color: "#1f2937" }}
                          >
                            {createdAt}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            backgroundColor: alpha("#be123c", 0.05),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Mã giao dịch
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#7f1d1d",
                              wordBreak: "break-word",
                            }}
                          >
                            {id}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Dialog
        open={withdrawDialogOpen}
        onClose={handleCloseWithdrawDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận rút tiền</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#4b5563" }}>
            Bạn sắp tạo yêu cầu rút tiền về tài khoản nhận tiền của chung cư.
            Vui lòng kiểm tra lại số dư trước khi xác nhận.
          </DialogContentText>
          <Typography sx={{ mt: 1.2, fontWeight: 700, color: "#0f766e" }}>
            Số tiền rút: {formatCurrency(currentRevenue)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseWithdrawDialog}
            disabled={isCreatingPayout}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={<PaidRoundedIcon />}
            onClick={handleConfirmWithdraw}
            disabled={isCreatingPayout}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              backgroundColor: "#0f766e",
            }}
          >
            {isCreatingPayout ? "Đang xử lý..." : "Xác nhận rút tiền"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminRevenueComponent;

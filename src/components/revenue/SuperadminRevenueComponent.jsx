import { useMemo, useState } from "react";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useRevenue from "../../hooks/queries/useRevenue";
import useApartment from "../../hooks/queries/useApartment";
import usePayout from "../../hooks/queries/usePayout";
import { toast } from "react-toastify";

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} VNĐ`;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getApartmentId = (apartment) => {
  if (!apartment) return "";
  if (typeof apartment === "string" || typeof apartment === "number") {
    return String(apartment);
  }

  if (typeof apartment === "object") {
    return String(apartment._id || apartment.id || apartment.apartmentId || "");
  }

  return "";
};

const normalizeHistories = (responseData) => {
  const payload = responseData?.data ?? responseData;
  const candidates = [
    payload?.histories,
    payload?.data?.histories,
    payload?.result?.histories,
    payload?.payouts,
    payload?.data?.payouts,
    Array.isArray(payload) ? payload : null,
  ];

  const list = candidates.find((candidate) => Array.isArray(candidate)) || [];

  return list.map((item) => {
    if (!item || typeof item !== "object") {
      return {
        _id: String(item || ""),
        apartmentId: "N/A",
        amount: 0,
        status: "unknown",
        createdAt: null,
        updatedAt: null,
      };
    }

    return {
      _id: item._id,
      imageUrl: item.imageUrl,
      apartmentId: item.apartmentId,
      amount: Number(item.amount) || 0,
      status: String(item.status || "unknown").toLowerCase(),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
};

const SuperadminRevenueComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApartmentId, setSelectedApartmentId] = useState("all");
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);

  const { mutate: acceptPayout } = usePayout.useAcceptPayout();

  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useRevenue.useGetPayoutHistories(
    selectedApartmentId === "all" ? undefined : selectedApartmentId,
    selectedStatus === "all" ? undefined : selectedStatus,
  );

  const { data: apartmentDatas } = useApartment.useGetAll();
  const apartments = apartmentDatas?.data || [];
  const apartmentOptions = useMemo(
    () => [{ _id: "all", name: "Tất cả" }, ...apartments],
    [apartments],
  );

  const allHistories = useMemo(
    () => normalizeHistories(responseData),
    [responseData],
  );

  const histories = useMemo(() => {
    return allHistories.filter((item) => {
      const matchedStatus =
        selectedStatus === "all" ? true : item.status === selectedStatus;
      const matchedApartment =
        selectedApartmentId === "all"
          ? true
          : getApartmentId(item.apartmentId) === selectedApartmentId;
      return matchedStatus && matchedApartment;
    });
  }, [allHistories, selectedStatus, selectedApartmentId]);

  const statusCount = histories.reduce((accumulator, item) => {
    const key = item.status || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const totalAmount = histories.reduce(
    (accumulator, item) => accumulator + (Number(item.amount) || 0),
    0,
  );

  const statusOptions = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Đang chờ" },
    { key: "completed", label: "Thành công" },
  ];

  const getStatusUi = (status) => {
    return (
      {
        pending: {
          label: "Đang chờ",
          color: "#b45309",
          bg: alpha("#f59e0b", 0.14),
        },
        completed: {
          label: "Thành công",
          color: "#166534",
          bg: alpha("#22c55e", 0.14),
        },
      }[status] || {
        label: status || "Không rõ",
        color: "#475569",
        bg: alpha("#64748b", 0.14),
      }
    );
  };

  const handleOpenHistoryDetail = (historyItem) => {
    setSelectedHistory(historyItem);
    setHistoryDetailOpen(true);
  };

  const handleCloseHistoryDetail = () => {
    setHistoryDetailOpen(false);
    setSelectedHistory(null);
  };

  const handleConfirmTransferredUi = () => {
    acceptPayout(selectedHistory?._id, {
      onSuccess: () => {
        toast.success("Cập nhật trạng thái rút tiền thành công!");
      },
    });
    handleCloseHistoryDetail();
  };

  if (isError) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #fecaca" }}>
        <CardContent>
          <Typography color="error" fontWeight={700}>
            Đã xảy ra lỗi khi tải lịch sử rút tiền
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
              Theo dõi lịch sử rút tiền của các chung cư theo trạng thái và
              chung cư.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Chip
                label={`Tổng bản ghi: ${histories.length}`}
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  backgroundColor: alpha("#fff", 0.2),
                }}
              />
              <Chip
                label={`Tổng tiền: ${formatCurrency(totalAmount)}`}
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  backgroundColor: alpha("#fff", 0.2),
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: "1px solid #d9dee8", boxShadow: 0 }}>
        <CardContent
          sx={{ p: { xs: 1.8, md: 2.2 }, display: "grid", gap: 1.2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptLongRoundedIcon
              sx={{ color: "#334155" }}
              fontSize="small"
            />
            <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>
              Lọc trạng thái
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {statusOptions.map((option) => (
              <Chip
                key={option.key}
                clickable
                label={
                  option.key === "all"
                    ? option.label
                    : `${option.label} (${statusCount[option.key] || 0})`
                }
                onClick={() => setSelectedStatus(option.key)}
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.7,
                  color: selectedStatus === option.key ? "#fff" : "#334155",
                  backgroundColor:
                    selectedStatus === option.key ? "#0369a1" : "#e2e8f0",
                }}
              />
            ))}
          </Stack>

          <Divider sx={{ borderColor: "#d9dee8" }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <ApartmentRoundedIcon sx={{ color: "#334155" }} fontSize="small" />
            <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>
              Lọc chung cư
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {apartmentOptions.map((apartment) => (
              <Chip
                key={apartment?._id}
                clickable
                label={apartment?.name}
                onClick={() =>
                  setSelectedApartmentId(
                    apartment?._id === "all"
                      ? "all"
                      : String(apartment?._id || ""),
                  )
                }
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.7,
                  color:
                    selectedApartmentId === String(apartment?._id)
                      ? "#fff"
                      : "#334155",
                  backgroundColor:
                    selectedApartmentId === String(apartment?._id)
                      ? "#0f766e"
                      : "#e2e8f0",
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: "1px solid #d9dee8", boxShadow: 0 }}>
        <CardContent
          sx={{ p: { xs: 1.8, md: 2.2 }, display: "grid", gap: 1.2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <PaidRoundedIcon fontSize="small" sx={{ color: "#334155" }} />
            <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>
              Lịch sử rút tiền
            </Typography>
          </Stack>

          {histories.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed #d9dee8",
                borderRadius: 2.2,
                p: { xs: 2.2, md: 2.6 },
                textAlign: "center",
                backgroundColor: alpha("#f3f6fb", 0.7),
              }}
            >
              <InboxRoundedIcon
                sx={{ color: "#718096", fontSize: 34, mb: 0.8 }}
              />
              <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                Không có dữ liệu lịch sử phù hợp
              </Typography>
            </Box>
          ) : (
            histories.map((item, index) => {
              const statusUi = getStatusUi(item.status);
              return (
                <Box
                  key={item._id || `history-${index}`}
                  onClick={() => handleOpenHistoryDetail(item)}
                  sx={{
                    borderRadius: 2.4,
                    border: "1px solid #e2e8f0",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.92) 100%)",
                    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                    p: 1.6,
                    display: "grid",
                    gap: 1,
                    cursor: "pointer",
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 14px 32px rgba(15, 23, 42, 0.12)",
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      {formatCurrency(item.amount)}
                    </Typography>
                    <Chip
                      label={statusUi.label}
                      sx={{
                        fontWeight: 700,
                        color: statusUi.color,
                        backgroundColor: statusUi.bg,
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
                        Chung cư
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                        {item.apartmentId?.name || "N/A"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        backgroundColor: alpha("#0369a1", 0.05),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Tạo lúc
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                        {formatDateTime(item.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    Bấm để xem ảnh chứng từ và thao tác chuyển tiền.
                  </Typography>
                </Box>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog
        open={historyDetailOpen}
        onClose={handleCloseHistoryDetail}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2.5 },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.6 } }}
        >
          Chi tiết rút tiền
        </DialogTitle>
        <DialogContent
          sx={{
            display: "grid",
            gap: 1.3,
            px: { xs: 2, sm: 3 },
            pb: { xs: 1.2, sm: 1.8 },
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Số tiền
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                {formatCurrency(selectedHistory?.amount)}
              </Typography>
            </Box>
            <Chip
              label={getStatusUi(selectedHistory?.status).label}
              sx={{
                fontWeight: 700,
                color: getStatusUi(selectedHistory?.status).color,
                backgroundColor: getStatusUi(selectedHistory?.status).bg,
                borderRadius: 1.6,
                alignSelf: "flex-start",
              }}
            />
          </Stack>

          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #d9dee8",
              overflow: "hidden",
              backgroundColor: alpha("#f8fafc", 0.9),
              minHeight: 220,
              display: "grid",
              placeItems: "center",
            }}
          >
            {selectedHistory?.imageUrl ? (
              <Box
                component="img"
                src={selectedHistory.imageUrl}
                alt="Ảnh chứng từ chuyển tiền"
                sx={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 600, px: 2 }}
              >
                Không có ảnh chứng từ cho giao dịch này.
              </Typography>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: "#475569" }}>
            Chung cư: {selectedHistory?.apartmentId?.name || "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            Thời gian tạo: {formatDateTime(selectedHistory?.createdAt)}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 2.2 },
            pt: { xs: 0.5, sm: 1 },
            gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseHistoryDetail}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={handleConfirmTransferredUi}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              width: { xs: "100%", sm: "auto" },
            }}
            disabled={selectedHistory?.status === "completed"}
          >
            Đã chuyển tiền thành công
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperadminRevenueComponent;

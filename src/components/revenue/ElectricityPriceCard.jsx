import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import useElectricityPrice from "../../hooks/queries/useElectricityPrice";

// Phải khớp ELECTRICITY_PRICE_MIN / MAX ở backend
// (src/services/aparment.service.js) — chặn ở đây chỉ để báo sớm, backend vẫn
// là nơi quyết định.
const PRICE_MIN = 1000;
const PRICE_MAX = 20000;

const formatPrice = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} đ/kWh`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} · ${day}`;
};

const ElectricityPriceCard = () => {
  const { data: priceResponse, isLoading } = useElectricityPrice.useGetPrice();
  const { data: historyResponse } = useElectricityPrice.useGetHistory();
  const { mutateAsync, isPending } = useElectricityPrice.useUpdatePrice();

  const priceInfo = priceResponse?.data ?? {};
  const currentPrice = Number(priceInfo.price) || 0;
  const isDefault = Boolean(priceInfo.isDefault);
  const logs = Array.isArray(historyResponse?.data) ? historyResponse.data : [];

  const [draft, setDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const draftPrice = Number(draft);
  const isDraftValid =
    Number.isInteger(draftPrice) &&
    draftPrice >= PRICE_MIN &&
    draftPrice <= PRICE_MAX;

  const handleConfirm = async () => {
    try {
      await mutateAsync(draftPrice);
      setFeedback({
        severity: "success",
        text: `Đã đổi giá điện thành ${formatPrice(draftPrice)}.`,
      });
      setDraft("");
    } catch (error) {
      setFeedback({
        severity: "error",
        text:
          error?.response?.data?.message ||
          "Không đổi được giá điện. Vui lòng thử lại.",
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #d9dee8",
        boxShadow: "none",
        animation: "riseUp 500ms ease",
        width: "100%",
      }}
    >
      <CardContent sx={{ pb: 1.1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BoltRoundedIcon fontSize="small" sx={{ color: "#d97706" }} />
          <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
            Giá điện
          </Typography>
        </Stack>
      </CardContent>

      <Divider sx={{ borderColor: "#d9dee8" }} />

      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Box
          sx={{
            p: 1.4,
            borderRadius: 2,
            border: `1px solid ${alpha("#d97706", 0.24)}`,
            backgroundColor: alpha("#d97706", 0.06),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Giá đang áp dụng
            </Typography>
            {isDefault && (
              <Chip
                size="small"
                label="Mặc định hệ thống"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
          <Typography
            variant="h5"
            sx={{ mt: 0.5, fontWeight: 700, color: "#b45309" }}
          >
            {isLoading ? "Đang tải..." : formatPrice(currentPrice)}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 1.6 }}>
          Giá mới chỉ áp dụng cho phiên sạc bắt đầu sau khi lưu. Phiên đang sạc
          vẫn giữ mức giá lúc bắt đầu.
        </Alert>

        {feedback && (
          <Alert
            severity={feedback.severity}
            sx={{ mt: 1.2 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.text}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.2}
          sx={{ mt: 1.8 }}
        >
          <TextField
            label="Giá mới (đồng/kWh)"
            size="small"
            type="number"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            error={draft !== "" && !isDraftValid}
            helperText={
              draft !== "" && !isDraftValid
                ? `Nhập số nguyên từ ${PRICE_MIN} đến ${PRICE_MAX}`
                : " "
            }
            sx={{ maxWidth: 260 }}
          />
          <Box>
            <Button
              variant="contained"
              disabled={!isDraftValid || isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {isPending ? "Đang lưu..." : "Lưu giá mới"}
            </Button>
          </Box>
        </Stack>
      </CardContent>

      <Divider sx={{ borderColor: "#d9dee8" }} />

      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <HistoryRoundedIcon fontSize="small" sx={{ color: "#3f4b5a" }} />
          <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
            Lịch sử đổi giá
          </Typography>
        </Stack>

        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Chưa có lần đổi giá nào.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Giá cũ</TableCell>
                  <TableCell>Giá mới</TableCell>
                  <TableCell>Người đổi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell>
                      {log.oldPrice === null || log.oldPrice === undefined
                        ? "Mặc định hệ thống"
                        : formatPrice(log.oldPrice)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatPrice(log.newPrice)}
                    </TableCell>
                    <TableCell>{log.changedBy?.name || "Không rõ"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>

      <Dialog
        open={confirmOpen}
        onClose={isPending ? undefined : () => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận đổi giá điện</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography>
              Từ <strong>{formatPrice(currentPrice)}</strong> sang{" "}
              <strong>{formatPrice(draftPrice)}</strong>.
            </Typography>
            <Alert severity="warning">
              Giá này được dùng để trừ tiền thật trong ví người dùng. Kiểm tra
              lại con số trước khi lưu.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Đang lưu..." : "Đổi giá"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ElectricityPriceCard;

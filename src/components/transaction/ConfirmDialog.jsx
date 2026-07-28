import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

const formatCurrency = (amount) =>
  `${new Intl.NumberFormat("vi-VN").format(amount || 0)} ₫`;

const Row = ({ label, value }) => (
  <Stack direction="row" spacing={2}>
    <Typography sx={{ minWidth: 96, color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600, wordBreak: "break-all" }}>
      {value}
    </Typography>
  </Stack>
);

const ConfirmDialog = ({ open, transaction, isPending, onClose, onConfirm }) => {
  if (!transaction) return null;

  const customerName = transaction.user?.name || "Không rõ";
  const customerContact =
    transaction.user?.phoneNumber || transaction.user?.email || "chưa có SĐT";

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Xác nhận cộng tiền</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Row label="Khách" value={`${customerName} (${customerContact})`} />
          <Row label="Số tiền" value={formatCurrency(transaction.amount)} />
          <Row label="Nội dung" value={transaction.content} />
          <Alert severity="warning" sx={{ mt: 1 }}>
            Chỉ xác nhận khi bạn đã thấy khoản chuyển khoản này trong app ngân
            hàng. Thao tác này không hoàn tác được.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Huỷ
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Đang xử lý..." : "Cộng tiền"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

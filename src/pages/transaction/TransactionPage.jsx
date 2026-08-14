import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import usePayment from "../../hooks/queries/usePayment";
import ConfirmDialog from "../../components/transaction/ConfirmDialog";

const LIMIT = 20;

const TABS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "completed", label: "Đã cộng tiền" },
  { value: "cancelled", label: "Đã huỷ" },
];

const formatCurrency = (amount) =>
  `${new Intl.NumberFormat("vi-VN").format(amount || 0)} ₫`;

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
  });
  return `${time} · ${day}`;
};

// Trả lời một câu hỏi mà bảng giao dịch không trả lời được: giao dịch còn nằm ở
// "Chờ xử lý" là vì chưa có tiền về, hay vì đối soát tự động đang chết? Hai ca
// đó đòi hai hành động ngược nhau — một cái phải đợi, một cái phải duyệt tay.
const ReconciliationBanner = ({ status }) => {
  if (!status) {
    return null;
  }

  if (!status.loopRunning) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Đối soát tự động KHÔNG chạy</strong> (server thiếu cấu hình
        ACB). Mọi giao dịch phải duyệt tay ở trang này — không có gì tự cộng
        tiền cho khách.
      </Alert>
    );
  }

  if (!status.autoCheckEnabled) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>API ngân hàng đang lỗi</strong> ({status.consecutiveFailures}{" "}
        lần liên tiếp). Hệ thống tạm thời không tự cộng tiền được — hãy đối
        chiếu app ngân hàng và duyệt tay.
        {status.lastSucceededAt && (
          <> Lần đọc được sao kê gần nhất: {formatDateTime(status.lastSucceededAt)}.</>
        )}
      </Alert>
    );
  }

};

const TransactionPage = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isError } = usePayment.useAdminTransactions({
    status,
    page,
    limit: LIMIT,
  });
  const { data: reconciliation } = usePayment.useReconciliationStatus();
  const { mutateAsync, isPending } = usePayment.useConfirmTransaction();

  // useMemo để mảng giữ nguyên tham chiếu giữa các lần render: useEffect bên
  // dưới phụ thuộc vào nó, tạo mảng mới mỗi render là chạy lại mỗi render.
  const transactions = useMemo(() => data?.transactions || [], [data]);
  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));
  const claimedCount = transactions.filter(
    (transaction) => transaction.claimedAt,
  ).length;
  const autoCheckEnabled = Boolean(reconciliation?.autoCheckEnabled);

  // Vòng lặp tự động vừa cộng tiền đúng lúc admin đang mở hộp thoại xác nhận.
  // Backend chặn được cộng lần hai (trả 409), nhưng để hộp thoại mở là mời admin
  // bấm vào một nút chắc chắn báo lỗi. Đóng luôn và nói rõ vì sao.
  useEffect(() => {
    if (!selected || isPending || isLoading) {
      return;
    }

    const stillListed = transactions.some(
      (transaction) => transaction._id === selected._id,
    );

    if (!stillListed) {
      setSelected(null);
      toast.info(
        `Giao dịch ${formatCurrency(selected.amount)} của ${
          selected.user?.name || "khách hàng"
        } vừa được xử lý ở nơi khác, không cần duyệt tay nữa.`,
      );
    }
  }, [transactions, selected, isPending, isLoading]);

  const handleChangeTab = (_event, value) => {
    setStatus(value);
    setPage(1);
  };

  const handleConfirm = async () => {
    try {
      await mutateAsync(selected._id);
      toast.success(
        `Đã cộng ${formatCurrency(selected.amount)} cho ${
          selected.user?.name || "khách hàng"
        }`,
      );
      setSelected(null);
    } catch (error) {
      // Hiển thị nguyên văn message từ backend: "đã cộng rồi" và "không đúng
      // chung cư" là hai tình huống khác hẳn nhau, admin cần biết cái nào.
      toast.error(
        error?.response?.data?.message ||
          "Không cộng tiền được, vui lòng thử lại",
      );
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Đối soát giao dịch
      </Typography>

      <ReconciliationBanner status={reconciliation} />

      {claimedCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{claimedCount} khách đã báo chuyển khoản</strong> và đang chờ
          bạn duyệt. Các giao dịch này nằm ở đầu danh sách.
        </Alert>
      )}

      {status === "cancelled" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Giao dịch khách tự huỷ, chỉ để tra cứu — không cộng tiền được từ đây.
          Nếu khách khiếu nại là đã chuyển khoản thật, hãy đề nghị khách tạo mã
          QR mới.
        </Alert>
      )}

      <Card>
        <Tabs value={status} onChange={handleChangeTab} sx={{ px: 2 }}>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <CardContent>
          {isLoading && (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          )}

          {isError && (
            <Alert severity="error">Không tải được danh sách giao dịch.</Alert>
          )}

          {!isLoading && !isError && transactions.length === 0 && (
            <Typography
              sx={{ py: 6, textAlign: "center", color: "text.secondary" }}
            >
              Không có giao dịch nào.
            </Typography>
          )}

          {!isLoading && !isError && transactions.length > 0 && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                      <TableCell>Nội dung CK</TableCell>
                      <TableCell align="right">
                        {status === "completed" ? "Người duyệt" : ""}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id} hover>
                        <TableCell>
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>
                            {transaction.user?.name || "Không rõ"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.user?.phoneNumber ||
                              transaction.user?.email}
                          </Typography>
                          {transaction.claimedAt && (
                            <Chip
                              size="small"
                              color="warning"
                              label={`Khách báo đã chuyển · ${formatDateTime(
                                transaction.claimedAt,
                              )}`}
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {transaction.content}
                        </TableCell>
                        <TableCell align="right">
                          {status === "completed" && (
                            <Chip
                              size="small"
                              label={
                                transaction.source === "manual"
                                  ? transaction.confirmedByUser?.name || "Admin"
                                  : "Hệ thống"
                              }
                              color={
                                transaction.source === "manual"
                                  ? "warning"
                                  : "default"
                              }
                            />
                          )}
                          {status === "cancelled" && (
                            <Typography variant="body2" color="text.secondary">
                              Khách tự huỷ
                            </Typography>
                          )}
                          {status === "pending" && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setSelected(transaction)}
                            >
                              Xác nhận
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_event, value) => setPage(value)}
                />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(selected)}
        transaction={selected}
        isPending={isPending}
        autoCheckEnabled={autoCheckEnabled}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default TransactionPage;

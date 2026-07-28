import React, { useState } from "react";
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
  { value: "failed", label: "Thất bại" },
  { value: "completed", label: "Đã cộng tiền" },
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

const TransactionPage = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isError } = usePayment.useAdminTransactions({
    status,
    page,
    limit: LIMIT,
  });
  const { mutateAsync, isPending } = usePayment.useConfirmTransaction();

  const transactions = data?.transactions || [];
  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

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
      <Alert severity="info" sx={{ mb: 2 }}>
        Dùng khi API ngân hàng không tự khớp được. Hãy đối chiếu với app ngân
        hàng trước khi xác nhận.
      </Alert>

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
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {transaction.content}
                        </TableCell>
                        <TableCell align="right">
                          {status === "completed" ? (
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
                          ) : (
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
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default TransactionPage;

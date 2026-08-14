import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useUser from "../../hooks/queries/useUser";

const statusStyles = {
  active: {
    color: "#00695c",
    backgroundColor: "#d8f3ed",
  },
  warning: {
    color: "#b45309",
    backgroundColor: "#ffedd5",
  },
  paused: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
  },
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)}đ`;

const getUsersFromResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;

  return [];
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "KH";

const normalizeStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (["warning", "low_balance", "attention"].includes(normalized)) {
    return "warning";
  }

  if (["paused", "inactive", "blocked", "disabled"].includes(normalized)) {
    return "paused";
  }

  return "active";
};

const getStatusLabel = (status) => {
  if (status === "warning") return "Cần chú ý";
  if (status === "paused") return "Tạm dừng";
  return "Đang dùng";
};

const normalizeHistory = (histories = []) =>
  Array.isArray(histories)
    ? histories.map((item, index) => ({
        code: item?.code || item?.transactionCode || item?._id || `NAP-${index + 1}`,
        time: item?.time || item?.createdAt || item?.date || "N/A",
        method: item?.method || item?.paymentMethod || "Chuyển khoản",
        handler: item?.handler || item?.handledBy?.name || item?.admin?.name || "Hệ thống",
        amount: Number(item?.amount) || 0,
        status: item?.statusLabel || item?.status || "Thành công",
      }))
    : [];

const normalizeCustomer = (user, index) => {
  const name =
    user?.name ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    `Khách hàng ${index + 1}`;
  const status = normalizeStatus(user?.status || user?.accountStatus);

  return {
    id: user?.customerCode || user?.code || user?._id || user?.id || `KH-${index + 1}`,
    name,
    initials: user?.initials || getInitials(name),
    plan: user?.plan?.name || user?.planName || user?.packageName || "Chưa cập nhật",
    balance:
      Number(user?.balance) ||
      Number(user?.wallet?.balance) ||
      Number(user?.currentBalance) ||
      0,
    totalDeposit: Number(user?.totalDeposit) || Number(user?.totalTopup) || 0,
    monthlyUsage: user?.monthlyUsage || user?.usageThisMonth || "0 GB",
    monthlyCost: Number(user?.monthlyCost) || Number(user?.usageCostThisMonth) || 0,
    lastDepositDate:
      user?.lastDepositDate || user?.lastTopupDate || user?.lastPayment?.createdAt || "N/A",
    lastDepositAmount:
      Number(user?.lastDepositAmount) || Number(user?.lastPayment?.amount) || 0,
    phone: user?.phone || user?.phoneNumber || "Chưa cập nhật",
    email: user?.email || user?.userEmail || "Chưa cập nhật",
    location:
      user?.location ||
      user?.address ||
      user?.placeOfResidence ||
      user?.apartment?.address ||
      "Chưa cập nhật",
    status,
    statusLabel: getStatusLabel(status),
    helper: user?.helper || user?.note || "Theo dữ liệu từ hệ thống",
    depositCount:
      Number(user?.depositCount) ||
      Number(user?.topupCount) ||
      (Array.isArray(user?.history) ? user.history.length : 0),
    history: normalizeHistory(user?.history || user?.transactions || user?.payments),
  };
};

const User = () => {
  const theme = useTheme();
  const { data: usersResponse, isLoading: isUserLoading, isError: isUserError } =
    useUser.useGetAll();
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const customers = useMemo(() => {
    const users = getUsersFromResponse(usersResponse);

    return users.map(normalizeCustomer);
  }, [usersResponse]);

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchStatus =
        statusFilter === "all" || customer.status === statusFilter;
      const matchKeyword =
        !keyword ||
        [customer.name, customer.phone, customer.id]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchStatus && matchKeyword;
    });
  }, [customers, searchTerm, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / rowsPerPage));
  const paginatedCustomers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;

    return filteredCustomers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCustomers, page, rowsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedId) ||
    filteredCustomers[0] ||
    customers[0] ||
    null;

  const stats = selectedCustomer
    ? [
        {
          label: "Số dư hiện tại",
          value: formatCurrency(selectedCustomer.balance),
          helper: selectedCustomer.helper,
        },
        {
          label: "Tổng đã nạp",
          value: formatCurrency(selectedCustomer.totalDeposit),
          helper: `${selectedCustomer.depositCount} giao dịch thành công`,
        },
        {
          label: "Sử dụng tháng này",
          value: selectedCustomer.monthlyUsage,
          helper: `Đã trừ ${formatCurrency(selectedCustomer.monthlyCost)}`,
        },
        
      ]
    : [];

  return (
    <Box
      sx={{
        maxWidth: 980,
        mx: "auto",
        display: "grid",
        gap: 2,
        color: "#0f172a",
      }}
    >
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 0,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        }}
      >
        <CardContent sx={{ p: { xs: 1.8, md: 2 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography fontWeight={800}>Quản lý khách hàng</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.7, maxWidth: 260 }}
              >
                Theo dõi thông tin sử dụng, số dư và lịch sử nạp tiền
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                size="small"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo tên"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    bgcolor: "#f8fafc",
                  },
                }}
              />
             
              
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 0,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 1.6 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={800}>Danh sách</Typography>
              {isUserLoading ? (
                <Chip label="Đang tải" size="small" variant="outlined" />
              ) : null}
              {isUserError ? (
                <Chip
                  label="Lỗi tải dữ liệu"
                  size="small"
                  sx={{
                    color: "#b45309",
                    bgcolor: "#ffedd5",
                    fontWeight: 700,
                  }}
                />
              ) : null}
            </Stack>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                minWidth: 104,
                "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang dùng</MenuItem>
              <MenuItem value="warning">Cần chú ý</MenuItem>
              <MenuItem value="paused">Tạm dừng</MenuItem>
            </TextField>
          </Stack>

          <Divider />

          <Box>
            {filteredCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => {
              const isSelected = customer.id === selectedCustomer?.id;
              const style = statusStyles[customer.status];

              return (
                <Box
                  key={customer.id}
                  onClick={() => setSelectedId(customer.id)}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 1.6,
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 1.3,
                    alignItems: "start",
                    cursor: "pointer",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: isSelected ? "#ddf4ef" : "#fff",
                    "&:hover": {
                      bgcolor: isSelected ? "#ddf4ef" : "#f8fafc",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      bgcolor: "#e8f0ff",
                      color: "#2454ff",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {customer.initials}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800}>{customer.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {customer.id} · {customer.plan}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                      Số dư {formatCurrency(customer.balance)}
                    </Typography>
                  </Box>
                  <Chip
                    label={customer.statusLabel}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: 99,
                      fontWeight: 700,
                      color: style.color,
                      bgcolor: style.backgroundColor,
                    }}
                  />
                </Box>
              );
            })
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography fontWeight={700}>
                  {isUserLoading
                    ? "Đang tải danh sách khách hàng..."
                    : "Không có khách hàng nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                  {isUserError
                    ? "Không lấy được dữ liệu từ máy chủ. Vui lòng thử lại sau."
                    : "Dữ liệu sẽ hiển thị khi BE trả về danh sách user."}
                </Typography>
              </Box>
            )}
          </Box>

          {filteredCustomers.length > 0 ? (
            <>
              <Divider />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{ px: 1.6, py: 1.4 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {(page - 1) * rowsPerPage + 1}-
                  {Math.min(page * rowsPerPage, filteredCustomers.length)} trong{" "}
                  {filteredCustomers.length} khách hàng
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    select
                    size="small"
                    value={rowsPerPage}
                    onChange={(event) => setRowsPerPage(Number(event.target.value))}
                    sx={{
                      width: 86,
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                    }}
                  >
                    {[5, 10, 20].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_event, value) => setPage(value)}
                    size="small"
                    color="primary"
                  />
                </Stack>
              </Stack>
            </>
          ) : null}
        </CardContent>
      </Card>

      {selectedCustomer ? (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 0,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
            sx={{ p: { xs: 1.6, sm: 2 } }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1.5,
                  bgcolor: "#d8f3ed",
                  color: "#00695c",
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                {selectedCustomer.initials}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" fontWeight={900}>
                    {selectedCustomer.name}
                  </Typography>
                  <Chip
                    label={selectedCustomer.statusLabel}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: 99,
                      fontWeight: 700,
                      color: statusStyles[selectedCustomer.status].color,
                      bgcolor: statusStyles[selectedCustomer.status].backgroundColor,
                    }}
                  />
                </Stack>
                <Stack
                  direction="row"
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 0.7, color: "text.secondary" }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{selectedCustomer.id}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{selectedCustomer.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{selectedCustomer.email}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{selectedCustomer.location}</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <IconButton
                sx={{
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Divider />

          <Box
            sx={{
              p: { xs: 1.6, sm: 2 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {stats.map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 1.5,
                  minHeight: 110,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography sx={{ mt: 1, fontWeight: 900, fontSize: 18 }}>
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.helper}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ px: { xs: 1.6, sm: 2 }, pb: 2 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 0,
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1}
                  sx={{ p: 1.6 }}
                >
                  <Typography fontWeight={900}>Lịch sử nạp tiền</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptLongRoundedIcon />}
                    sx={{
                      borderRadius: 1.5,
                      color: "#0f172a",
                      borderColor: theme.palette.divider,
                    }}
                  >
                    Tải lịch sử
                  </Button>
                </Stack>

                <TableContainer>
                  <Table size="small" sx={{ minWidth: 680 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell>Mã giao dịch</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Phương thức</TableCell>
                        <TableCell>Người xử lý</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCustomer.history.map((item) => (
                        <TableRow key={item.code} hover>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.time}</TableCell>
                          <TableCell>{item.method}</TableCell>
                          <TableCell>{item.handler}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.status}
                              size="small"
                              sx={{
                                height: 24,
                                borderRadius: 99,
                                fontWeight: 800,
                                color: "#00695c",
                                bgcolor: "#d8f3ed",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
      ) : null}
    </Box>
  );
};

export default User;

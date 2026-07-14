import React, { useMemo, useState } from "react";
import useHistory from "../../hooks/queries/useHistory";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
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
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";

const HistoryPage = () => {
  const theme = useTheme();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [year, month] = selectedMonth.split("-").map(Number);
  const startDateObj = new Date(year, month - 1, 1);
  const endDateObj = new Date(year, month, 1);

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const fromDate = formatDate(startDateObj);
  const toDate = formatDate(endDateObj);
  const {
    data: historyData,
    isLoading,
    isError,
  } = useHistory.useGetHistoryForAdmin({ fromDate, toDate });

  const tableTitle = historyData?.table?.title || "Dữ liệu khách hàng";
  const rows = Array.isArray(historyData?.table?.rows)
    ? historyData.table.rows
    : [];

  const filteredRows = useMemo(() => {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    const matchedRows = rows.filter((row) => {
      if (!lowerSearchTerm) return true;

      return Object.values(row || {})
        .join(" ")
        .toLowerCase()
        .includes(lowerSearchTerm);
    });

    return matchedRows.slice(0, rowsPerPage);
  }, [rows, rowsPerPage, searchTerm]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={1.3} alignItems="center">
          <CircularProgress size={34} thickness={4.5} />
          <Typography variant="body2" color="text.secondary">
            Đang tải lịch sử...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #fecaca" }}>
        <CardContent>
          <Typography color="error" fontWeight={700}>
            Đã xảy ra lỗi khi tải lịch sử!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            Vui lòng kiểm tra kết nối hoặc thử lại sau.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: { xs: 1.2, sm: 2, md: 2.5 } }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "none",
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <TableChartRoundedIcon
                fontSize="small"
                sx={{ color: "#3f4b5a" }}
              />
              <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                {tableTitle}
              </Typography>
            </Stack>

            <TextField
              type="month"
              size="small"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.8,
                  bgcolor: "#fff",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#d9dee8" }} />

        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={1.5}
            sx={{
              mb: 2,
              p: 1.2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              backgroundColor: alpha(theme.palette.primary.light, 0.08),
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Typography sx={{ color: "#404a58", fontWeight: 600 }}>
                Hiển thị
              </Typography>
              <TextField
                select
                size="small"
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                sx={{
                  minWidth: 80,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.8,
                    bgcolor: "#fff",
                  },
                }}
              >
                {[10, 25, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={{ color: "#404a58", fontWeight: 600 }}>
                mục
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ color: "#404a58", fontWeight: 600 }}>
                Tìm kiếm:
              </Typography>
              <TextField
                size="small"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nhập từ khóa"
                sx={{
                  minWidth: { xs: "100%", sm: 240 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.8,
                    bgcolor: "#fff",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{ color: "#64748b", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>

          <TableContainer
            sx={{
              border: "1px solid #d9dee8",
              borderRadius: 1.5,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                height: 7,
                width: 7,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: alpha(theme.palette.divider, 0.24),
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.34),
                borderRadius: 8,
              },
            }}
          >
            <Table sx={{ minWidth: { xs: 560, md: 680 } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f3f6fb" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Tên
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Biển số xe
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Số lần sạc
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Điện năng tiêu thụ
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Số tiền
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, index) => (
                  <TableRow key={`${row.name}-${row.startDate}`} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.licencePlate}</TableCell>
                    <TableCell>{row.chargingCount}</TableCell>
                    <TableCell>{row.energyConsumption}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                  </TableRow>
                ))}

                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography sx={{ color: "#687282" }}>
                        Không có dữ liệu nào phù hợp với truy vấn của bạn.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default HistoryPage;

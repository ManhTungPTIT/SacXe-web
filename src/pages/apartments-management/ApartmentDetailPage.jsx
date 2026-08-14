import React, { useState } from "react";
import useApartment from "../../hooks/queries/useApartment";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PowerRoundedIcon from "@mui/icons-material/PowerRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import AddEChargeDeviceComponent from "../../components/eChargeDevice/AddEChargeDeviceComponent";
import AssignAdminComponent from "../../components/aparment/AssignAdminComponent";
import useEChargeDevice from "../../hooks/queries/useEChargeDevice";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const formatDate = (value, withTime = false) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString(
    "vi-VN",
    withTime
      ? {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
  );
};

const formatCurrency = (value) => {
  const parsed = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} VNĐ`;
};

const getUsageTone = (percent) => {
  if (percent >= 90) return "error";
  if (percent >= 70) return "warning";
  if (percent > 0) return "info";
  return "success";
};

const sortDeviceOutletsByIndex = (device) => {
  if (!device || !Array.isArray(device.outlets)) return device;

  return {
    ...device,
    outlets: [...device.outlets].sort((a, b) => {
      const aIndex = Number(a?.index);
      const bIndex = Number(b?.index);

      return (
        (Number.isFinite(aIndex) ? aIndex : Number.MAX_SAFE_INTEGER) -
        (Number.isFinite(bIndex) ? bIndex : Number.MAX_SAFE_INTEGER)
      );
    }),
  };
};

const ApartmentDetailPage = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const params = useParams();
  const apartmentId = params.id;
  const { state } = useLocation();
  // Chỉ nhận bản ghi chung cư qua route state, để phần đầu trang hiện ngay
  // không phải chờ request. Danh sách trụ và ổ luôn lấy từ /apartment/:id:
  // route state không tồn tại khi mở thẳng URL hay F5, và nếu để nó chặn
  // request (enabled: routeDevices.length === 0) thì trang lấy dữ liệu từ hai
  // nguồn khác nhau tuỳ đường vào — đúng lý do bảng ổ từng rỗng.
  const routeApartment = state?.apartment;
  const {
    data: responseData,
    isLoading,
    isError,
  } = useApartment.useGetDetails(apartmentId);
  const [formData, setFormData] = useState({
    deviceCode: "",
    totalSlots: "",
    address: "",
    latitude: "",
    longitude: "",
    apartmentId: apartmentId,
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const addEChargeDeviceMutation = useEChargeDevice.useAdd();

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddSubmit = (newDeviceData) => {
    const latitude = Number(newDeviceData.latitude);
    const longitude = Number(newDeviceData.longitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Vĩ độ phải nằm trong khoảng -90 đến 90.");
      return;
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Kinh độ phải nằm trong khoảng -180 đến 180.");
      return;
    }

    addEChargeDeviceMutation.mutate(
      {
        ...newDeviceData,
        latitude,
        longitude,
        apartmentId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["APARTMENT_DETAILS", apartmentId],
          });
          setFormData({
            deviceCode: "",
            totalSlots: "",
            address: "",
            latitude: "",
            longitude: "",
            apartmentId: apartmentId,
          });
          toast.success("Thêm thiết bị thành công.");
          handleCloseAddDialog();
        },
        onError: (error) => {
          console.error("Error adding e-charge device:", error);
          toast.error(
            error?.response?.data?.message ||
              error?.error?.message ||
              "Có lỗi xảy ra khi thêm thiết bị.",
          );
        },
      },
    );
  };

  // Dữ liệu API thắng route state: state.apartment được chụp lúc rời trang danh
  // sách và không bao giờ đổi, nên nếu để nó ưu tiên thì phân công quản lý xong,
  // invalidate xong, trang vẫn hiện tên admin cũ. Route state chỉ còn nhiệm vụ
  // hiện nhanh phần đầu trang lúc request chưa về.
  const apartment = responseData?.data?.apartment || routeApartment;
  const eChargeDevices = responseData?.data?.eChargeDevices;
  const devices = Array.isArray(eChargeDevices) ? eChargeDevices : [];
  // Bảng ổ đọc từ chính `devices` của API. Mảng `outlets` do getApartmentDetails
  // trả kèm mỗi trụ; trước đây endpoint không có nó nên bảng chỉ sống được nhờ
  // dữ liệu chuyền qua route state.
  const selectedDevice = sortDeviceOutletsByIndex(devices[0]);
  const outletRows = Array.isArray(selectedDevice?.outlets)
    ? selectedDevice.outlets
    : [];
  const deviceTotalSlots =
    Number(selectedDevice?.totalSlots) || outletRows.length;

  const totalSlots = devices.reduce(
    (sum, device) =>
      sum +
      (Number(device?.totalSlots) ||
        (Array.isArray(device?.outlets) ? device.outlets.length : 0)),
    0,
  );
  const availableSlots = devices.reduce(
    (sum, device) =>
      sum +
      (Number(device?.availableSlots) ||
        (Array.isArray(device?.outlets)
          ? device.outlets.filter(
              (outlet) => !outlet?.isBroken && !outlet?.isUsing,
            ).length
          : 0)),
    0,
  );
  const usedSlots = Math.max(totalSlots - availableSlots, 0);

  const dashboardStats = {
    totalDevices: devices.length,
    totalSlots,
    availableSlots,
    occupancyRate:
      totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0,
    totalRevenue:
      Number(apartment?.revenue) ||
      Number(apartment?.totalRevenue) ||
      devices.reduce((sum, device) => sum + (Number(device?.revenue) || 0), 0),
  };

  if (isError) {
    return (
      <Card sx={{ borderRadius: 4, boxShadow: 0, border: "1px solid #fee2e2" }}>
        <CardContent>
          <Typography color="error" fontWeight={600}>
            Có lỗi xảy ra khi tải thông tin chung cư.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const summaryCards = [
    {
      title: "Thiết bị đã đăng ký",
      value: dashboardStats.totalDevices,
      helper: "Trạm sạc đang hoạt động",
      icon: <ApartmentRoundedIcon fontSize="small" />,
      color: "#1d7be6",
    },
    {
      title: "Tổng số ổ cắm",
      value: dashboardStats.totalSlots,
      helper: `Còn trống ${dashboardStats.availableSlots} ổ`,
      icon: <PowerRoundedIcon fontSize="small" />,
      color: "#16a34a",
    },
    {
      title: "Đang sử dụng",
      value: `${dashboardStats.occupancyRate}%`,
      helper: "Mức tải toàn bộ hệ thống",
      icon: <ElectricBoltRoundedIcon fontSize="small" />,
      color: "#eab308",
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(dashboardStats.totalRevenue),
      helper: "Lũy kế đến hiện tại",
      icon: <SellRoundedIcon fontSize="small" />,
      color: "#f97316",
    },
  ];

  return (
    <>
      <Box
        sx={{
          p: { xs: 1.3, sm: 2, md: 3 },
          display: "grid",
          gap: { xs: 1.8, sm: 2.2, md: 2.5 },
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.default} 52%)`,
          borderRadius: 4,
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background:
              "linear-gradient(125deg, #0f4c81 0%, #1d7be6 55%, #4db6ff 100%)",
            color: "#fff",
            boxShadow: "0 20px 40px rgba(21, 105, 208, 0.28)",
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
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {apartment?.name || "Chưa cập nhật tên chung cư"}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 1.2 }}
                >
                  <Chip
                    icon={
                      <PersonRoundedIcon sx={{ color: "#fff !important" }} />
                    }
                    label={
                      "Người quản lý: " +
                      (apartment?.owner?.name || "Chưa có quản lý")
                    }
                    size="small"
                    sx={{
                      color: "#fff",
                      backgroundColor: alpha("#fff", 0.2),
                      borderRadius: 1.5,
                    }}
                  />
                  <Chip
                    icon={
                      <CalendarMonthRoundedIcon
                        sx={{ color: "#fff !important" }}
                      />
                    }
                    label={`Thêm ngày ${formatDate(apartment?.createdAt)}`}
                    size="small"
                    sx={{
                      color: "#fff",
                      backgroundColor: alpha("#fff", 0.2),
                      borderRadius: 1.5,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={1.8}>
          {summaryCards.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: `1px solid ${alpha(item.color, 0.2)}`,
                  boxShadow: 0,
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
                    spacing={1.2}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mt: 0.5 }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        minWidth: 34,
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
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                boxShadow: 0,
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2.4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Thông tin chung
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Người quản lý
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {apartment?.owner?.name || "Chưa cập nhật"}
                      </Typography>
                      {/* Nút đặt sát đúng trường mà nó sửa, không giấu trong
                          header trang. */}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ManageAccountsRoundedIcon />}
                        onClick={() => setOpenAssignDialog(true)}
                        sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
                      >
                        {apartment?.owner ? "Đổi quản lý" : "Phân công quản lý"}
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Địa chỉ chung cư
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="flex-start"
                      sx={{ mt: 0.4 }}
                    >
                      <PlaceRoundedIcon
                        sx={{ mt: 0.2, color: "text.secondary", fontSize: 18 }}
                      />
                      <Typography variant="body2">
                        {apartment?.address || "Chưa cập nhật"}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ổ cắm đã sử dụng trong tòa nhà
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.8 }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={dashboardStats.occupancyRate}
                        color={getUsageTone(dashboardStats.occupancyRate)}
                        sx={{
                          flex: 1,
                          height: 9,
                          borderRadius: 99,
                          backgroundColor: alpha(theme.palette.grey[400], 0.25),
                        }}
                      />
                      <Typography variant="body2" fontWeight={700}>
                        {dashboardStats.occupancyRate}%
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày khởi tạo hệ thống
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(apartment?.createdAt, true)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tổng doanh thu lũy kế
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: "#d97706" }}
                    >
                      {formatCurrency(dashboardStats.totalRevenue)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                boxShadow: 0,
              }}
            >
              <CardContent sx={{ p: 2.2 }}>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.3,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Danh sách thiết bị sạc
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Theo dõi công suất và trạng thái sử dụng theo từng trạm.
                    </Typography>
                  </Box>
                  <Button
                    onClick={handleOpenAddDialog}
                    variant="outlined"
                    startIcon={<AddCircleRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Thêm thiết bị
                  </Button>
                </Box>

                <TableContainer
                  component={Box}
                  sx={{
                    maxHeight: 420,
                    overflow: "auto",
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
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
                  <Table
                    stickyHeader
                    size="small"
                    sx={{ minWidth: { xs: 610, sm: 680 } }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            fontWeight: 700,
                            whiteSpace: { xs: "normal", sm: "nowrap" },
                            fontSize: { xs: 12, sm: 13 },
                            py: { xs: 1, sm: 1.3 },
                            color: theme.palette.text.primary,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08,
                            ),
                          },
                        }}
                      >
                        <TableCell>Mã thiết bị</TableCell>
                        <TableCell>Ngày thêm</TableCell>
                        <TableCell>Tổng ổ cắm</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        {/* <TableCell>Sử dụng</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {outletRows.length > 0 ? (
                        
                        outletRows.map((item) => {
                          console.log(item)
                          const totalSlots = deviceTotalSlots;
                          const availableSlots =
                            Number(item?.availableSlots) || 0;
                          const usedSlots = Math.max(
                            totalSlots - availableSlots,
                            0,
                          );
                          const usedPercent =
                            totalSlots > 0
                              ? Math.round((usedSlots / totalSlots) * 100)
                              : 0;
                          const statusTone = getUsageTone(usedPercent);

                          return (
                            <TableRow
                              key={item._id}
                              hover
                              sx={{
                                "&:nth-of-type(odd)": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.02,
                                  ),
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={700}>
                                  {item?.index || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {formatDate(item?.createdAt, true)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`${totalSlots} ổ cắm`}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{item.isBroken ? "Bị hỏng" : (
                                item.isUsing ? "Đang sử dụng" : "Có thể sử dụng"                                                            
                              )}</TableCell>
                              {/* <TableCell
                                sx={{ minWidth: { xs: 160, sm: 190 } }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <LinearProgress
                                    variant="determinate"
                                    value={usedPercent}
                                    color={statusTone}
                                    sx={{
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 99,
                                      backgroundColor: alpha(
                                        theme.palette.grey[400],
                                        0.25,
                                      ),
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${usedPercent}%`}
                                    color={statusTone}
                                    variant="outlined"
                                  />
                                </Stack>
                              </TableCell> */}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                            <Stack alignItems="center" spacing={1}>
                              <ElectricBoltRoundedIcon
                                sx={{ color: "text.secondary", opacity: 0.6 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Chưa có thiết bị nào được gắn.
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <AddEChargeDeviceComponent
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={Boolean(
          addEChargeDeviceMutation?.isPending ||
          addEChargeDeviceMutation?.isLoading,
        )}
      />

      <AssignAdminComponent
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        apartmentId={apartmentId}
        apartmentName={apartment?.name || "chung cư này"}
        currentOwnerId={apartment?.owner?._id}
      />
    </>
  );
};

export default ApartmentDetailPage;

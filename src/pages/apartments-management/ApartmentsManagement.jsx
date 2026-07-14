import React, { useMemo, useState } from "react";
import useApartment from "../../hooks/queries/useApartment";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PowerRoundedIcon from "@mui/icons-material/PowerRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddApartmentComponent from "../../components/aparment/AddApartmentComponent";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApartmentsManagementPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    sex: "",
    placeOfResidence: "",
  });
  const { data: response, isLoading, isError } = useApartment.useGetAll();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const addApartmentMutation = useApartment.useAddApartment();

  const navigate = useNavigate();

  const apartmentsList = useMemo(
    () => (Array.isArray(response?.data) ? response.data : []),
    [response?.data],
  );

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalApartments = apartmentsList.length;
    const totalDevices = apartmentsList.reduce(
      (sum, apartment) =>
        sum +
        (Number(apartment?.productQuantity) ||
          Number(apartment?.deviceCount) ||
          0),
      0,
    );
    const recentApartments = apartmentsList.filter((apartment) => {
      const created = apartment?.createdAt
        ? new Date(apartment.createdAt)
        : null;
      return created && created >= startOfMonth;
    }).length;
    const withAddress = apartmentsList.filter((apartment) =>
      Boolean(apartment?.address?.trim()),
    ).length;
    const coverageRate =
      totalApartments > 0
        ? Math.round((withAddress / totalApartments) * 100)
        : 0;

    return {
      totalApartments,
      totalDevices,
      recentApartments,
      coverageRate,
    };
  }, [apartmentsList]);

  const isAddingApartment = Boolean(
    addApartmentMutation?.isPending || addApartmentMutation?.isLoading,
  );

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddSubmit = (newFormData) => {
    const adminPayload = {
      name: newFormData.adminName?.trim(),
      email: newFormData.email?.trim(),
      password: newFormData.password?.trim(),
      phoneNumber: newFormData.phoneNumber?.trim(),
      sex: newFormData.sex?.trim(),
      placeOfResidence: newFormData.placeOfResidence?.trim(),
    };

    if (adminPayload.password !== newFormData.confirmPassword?.trim()) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    const payload = {
      name: newFormData.name?.trim(),
      address: newFormData.address?.trim(),
      admin: adminPayload,
    };

    const isEmailValid = /^\S+@\S+\.\S+$/.test(adminPayload.email || "");

    if (
      !payload.name ||
      !payload.address ||
      !adminPayload.name ||
      !adminPayload.email ||
      !adminPayload.password ||
      !adminPayload.phoneNumber ||
      !adminPayload.sex ||
      !adminPayload.placeOfResidence
    ) {
      toast.error(
        "Vui lòng nhập đầy đủ thông tin chung cư và tài khoản admin.",
      );
      return;
    }

    if (!isEmailValid) {
      toast.error("Email admin chưa đúng định dạng.");
      return;
    }

    addApartmentMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          name: "",
          address: "",
          adminName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          sex: "",
          placeOfResidence: "",
        });
        toast.success("Thêm chung cư và tài khoản admin thành công.");
        handleCloseAddDialog();
      },
      onError: (error) => {
        console.error("Error adding apartment:", error);
        toast.error(
          error?.response?.data?.message || "Có lỗi xảy ra khi thêm chung cư.",
        );
      },
    });
  };

  if (isError) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #fecaca" }}>
        <CardContent>
          <Typography color="error" fontWeight={700}>
            Đã xảy ra lỗi khi tải dữ liệu!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            Vui lòng kiểm tra kết nối hoặc thử lại sau.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const summaryCards = [
    {
      title: "Tổng chung cư",
      value: dashboardStats.totalApartments,
      helper: "Đang được quản lý",
      icon: <ApartmentRoundedIcon fontSize="small" />,
      color: "#1d7be6",
    },
    {
      title: "Tổng thiết bị",
      value: dashboardStats.totalDevices,
      helper: "Trạm sạc đã lắp đặt",
      icon: <PowerRoundedIcon fontSize="small" />,
      color: "#16a34a",
    },
    {
      title: "Mới trong tháng",
      value: dashboardStats.recentApartments,
      helper: "Cập nhật gần nhất",
      icon: <EventAvailableRoundedIcon fontSize="small" />,
      color: "#f97316",
    },
    {
      title: "Tỷ lệ đủ địa chỉ",
      value: `${dashboardStats.coverageRate}%`,
      helper: "Chất lượng dữ liệu",
      icon: <PlaceRoundedIcon fontSize="small" />,
      color: "#9333ea",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.2, sm: 1.8, md: 3 },
        display: "grid",
        gap: { xs: 1.6, sm: 2, md: 2.2 },
        borderRadius: 4,
        background: `radial-gradient(circle at 2% -10%, ${alpha("#1d7be6", 0.16)} 0%, transparent 42%), radial-gradient(circle at 100% 10%, ${alpha("#f97316", 0.12)} 0%, transparent 38%)`,
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
            "linear-gradient(125deg, #0f4c81 0%, #1d7be6 55%, #4db6ff 100%)",
          boxShadow: "0 20px 40px rgba(21, 105, 208, 0.28)",
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
                Quản lý chung cư
              </Typography>
              <Typography sx={{ mt: 0.7, opacity: 0.95 }}>
                Theo dõi danh sách tòa nhà, số thiết bị và điều hướng chi tiết.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleRoundedIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2.5,
                fontWeight: 700,
                backgroundColor: "#fff",
                color: "#145cae",
                boxShadow: "0 10px 18px rgba(8, 29, 57, 0.22)",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.92),
                },
              }}
            >
              Thêm chung cư
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
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
              animationDelay: `${120 + index * 70}ms`,
              animationFillMode: "both",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 10px 22px ${alpha(item.color, 0.18)}`,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
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

      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          boxShadow: "0 10px 26px rgba(15, 35, 66, 0.08)",
        }}
      >
        <CardContent sx={{ pb: 1.2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Danh sách chung cư
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhấn vào từng dòng để vào trang chi tiết thiết bị.
              </Typography>
            </Box>
            <Chip
              label={`${apartmentsList.length} chung cư`}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            />
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.85) }} />

        <CardContent>
          <TableContainer
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              overflow: "auto",
              maxHeight: 560,
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
              sx={{ minWidth: { xs: 620, sm: 700, md: 760 } }}
              aria-label="apartments table"
            >
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      color: "#1f2937",
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      fontSize: { xs: 12, sm: 14 },
                      py: { xs: 1.1, sm: 1.6 },
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <TableCell sx={{ width: 56 }}>STT</TableCell>
                  <TableCell>Tên chung cư</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell align="center">Số lượng thiết bị</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {apartmentsList.length > 0 ? (
                  apartmentsList.map((row, index) => {
                    const deviceCount =
                      Number(row?.productQuantity) ||
                      Number(row?.deviceCount) ||
                      0;

                    return (
                      <TableRow
                        key={row._id || `${row?.name || "apartment"}-${index}`}
                        onClick={() =>
                          navigate(`/apartments-management/${row._id}`)
                        }
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.02,
                            ),
                          },
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08,
                            ),
                            cursor: "pointer",
                          },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography fontWeight={700}>
                            {row?.name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.6}
                            alignItems="flex-start"
                          >
                            <PlaceRoundedIcon
                              sx={{
                                color: "text.secondary",
                                fontSize: 16,
                                mt: 0.4,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {row?.address || "Chưa cập nhật"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${deviceCount} thiết bị`}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(row?.createdAt)}</TableCell>
                        <TableCell
                          align="right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              sx={{
                                color: "#1d7be6",
                                ml: 0.3,
                              }}
                              onClick={() =>
                                navigate(`/apartments-management/${row._id}`)
                              }
                            >
                              <ArrowForwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Stack spacing={1} alignItems="center">
                        <ApartmentRoundedIcon
                          sx={{ color: "text.secondary", opacity: 0.55 }}
                        />
                        <Typography color="text.secondary">
                          Chưa có dữ liệu chung cư.
                        </Typography>
                        <Button
                          variant="text"
                          startIcon={<AddCircleRoundedIcon />}
                          onClick={handleOpenAddDialog}
                        >
                          Thêm chung cư đầu tiên
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <AddApartmentComponent
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isAddingApartment}
      />
    </Box>
  );
};

export default ApartmentsManagementPage;

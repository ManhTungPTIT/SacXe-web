import React, { useEffect, useState } from "react";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
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
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthContext } from "../../contexts/AuthContext";
import { useAuthStore } from "../../stores/authStore";
import usePayment from "../../hooks/queries/usePayment";
import {
  BANK_OPTIONS,
  findBankByCode,
  findBankByName,
} from "../../constants/banks";

const parseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const formatRole = (role) => {
  const roleText = String(role || "admin").toLowerCase();
  if (roleText.includes("super")) return "Super Admin";
  return "Admin";
};

const INITIAL_PAYMENT_FORM = {
  bankCode: "",
  bankName: "",
  cardNumber: "",
  cardHolderName: "",
};

const extractPaymentProfile = (value) => {
  if (!value || typeof value !== "object") return null;
  if (value.data && typeof value.data === "object" && !value._id) {
    return value.data;
  }
  return value;
};

const getApartmentId = (profile, adminUser) => {
  return (
    profile?.apartmentId ||
    adminUser?.apartmentId ||
    adminUser?.apartment?._id ||
    adminUser?.apartmentId?._id ||
    ""
  );
};

const getApiErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const SettingsPage = () => {
  const { user: contextUser, isLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] =
    useState(false);
  const [paymentForm, setPaymentForm] = useState(INITIAL_PAYMENT_FORM);

  const { data: paymentProfileResponse, isLoading: isPaymentProfileLoading } =
    usePayment.useGetPaymentProfile();
  const { mutateAsync: addPaymentProfile, isLoading: isSavingPaymentProfile } =
    usePayment.useAddPaymentProfile();
  const paymentProfile = extractPaymentProfile(paymentProfileResponse);

  const legacyUser = parseJson(localStorage.getItem("user"));
  const storedUser = parseJson(localStorage.getItem("auth_user"));
  console.log("Context user:", contextUser);
  console.log("Legacy user from localStorage:", legacyUser);
  console.log("Auth store user:", storedUser);
  const adminUser = storedUser || legacyUser || contextUser;

  const roleLabel = formatRole(adminUser?.role);
  const isSuperAdmin = roleLabel === "Super Admin";
  const roleColor = isSuperAdmin ? "#f97316" : "#1d7be6";

  useEffect(() => {
    if (!paymentProfile) return;

    const matchedBank =
      findBankByCode(paymentProfile.bankCode) ||
      findBankByName(paymentProfile.bankName);

    setPaymentForm({
      bankCode: matchedBank?.code || "",
      bankName: matchedBank?.name || "",
      cardNumber: paymentProfile.cardNumber || "",
      cardHolderName: paymentProfile.cardHolderName || "",
    });
  }, [paymentProfile]);

  const hasPaymentProfile = Boolean(paymentProfile?._id);
  const apartmentId = getApartmentId(paymentProfile, adminUser);
  const selectedBank = findBankByCode(paymentForm.bankCode);

  const isPaymentFormValid =
    Boolean(paymentForm.bankCode.trim()) &&
    Boolean(paymentForm.cardNumber.trim()) &&
    Boolean(paymentForm.cardHolderName.trim());

  const paymentTextFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: alpha("#f5f8fc", 0.8),
      "& fieldset": {
        borderColor: "#d9dee8",
      },
      "&:hover fieldset": {
        borderColor: alpha("#1d7be6", 0.45),
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1d7be6",
      },
    },
  };

  console.log("adminUser", adminUser);

  const profileItems = [
    {
      label: "Họ và tên",
      value: adminUser?.name || "Chưa cập nhật",
      icon: <BadgeRoundedIcon fontSize="small" />,
    },
    {
      label: "Email",
      value: adminUser?.email || adminUser?.userEmail || "Chưa cập nhật",
      icon: <AlternateEmailRoundedIcon fontSize="small" />,
    },
    {
      label: "Số điện thoại",
      value: adminUser?.phone || adminUser?.phoneNumber || "Chưa cập nhật",
      icon: <PhoneRoundedIcon fontSize="small" />,
    },
  ];

  const securityInfo = [
    {
      title: "Vai trò hệ thống",
      value: roleLabel,
      icon: <ShieldRoundedIcon fontSize="small" />,
      color: roleColor,
    },
    {
      title: "Trạng thái tài khoản",
      value: "Đang hoạt động",
      icon: <VerifiedUserRoundedIcon fontSize="small" />,
      color: "#16a34a",
    },
  ];

  const handlePaymentInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "bankCode") {
      const bank = findBankByCode(value);
      setPaymentForm((prev) => ({
        ...prev,
        bankCode: value,
        bankName: bank?.name || "",
      }));
      return;
    }

    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPaymentPayload = () => {
    const bank = findBankByCode(paymentForm.bankCode);

    if (!bank) {
      toast.error("Vui long chon ngan hang hop le.");
      return null;
    }

    const payload = {
      bankCode: bank.code,
      bankName: bank.name,
      cardNumber: paymentForm.cardNumber.trim(),
      cardHolderName: paymentForm.cardHolderName.trim(),
    };

    if (apartmentId) {
      payload.apartmentId = apartmentId;
    }

    return payload;
  };

  const savePaymentProfile = async (payload, isUpdating) => {
    try {
      await addPaymentProfile(payload);
      await queryClient.invalidateQueries({ queryKey: ["payment-profile"] });

      toast.success(
        isUpdating
          ? "Cập nhật thông tin thanh toán thành công."
          : "Thêm thông tin thanh toán thành công.",
      );
    } catch (error) {
      console.error("Save payment profile error:", error);
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể lưu thông tin thanh toán, vui lòng thử lại.",
        ),
      );
    }
  };

  const handlePaymentProfileSubmit = async (event) => {
    event.preventDefault();

    if (!isPaymentFormValid || isSavingPaymentProfile) return;

    if (hasPaymentProfile) {
      setPaymentConfirmDialogOpen(true);
      return;
    }

    const payload = buildPaymentPayload();
    if (!payload) return;

    await savePaymentProfile(payload, false);
  };

  const handleClosePaymentConfirmDialog = () => {
    if (isSavingPaymentProfile) return;
    setPaymentConfirmDialogOpen(false);
  };

  const handleConfirmPaymentProfileUpdate = async () => {
    if (!isPaymentFormValid || isSavingPaymentProfile) return;

    const payload = buildPaymentPayload();
    if (!payload) return;

    setPaymentConfirmDialogOpen(false);
    await savePaymentProfile(payload, true);
  };

  const handleLogout = () => {
    try {
      useAuthStore.getState().logout();
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
      queryClient.clear();
      toast.success("Đăng xuất thành công.");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Không thể đăng xuất, vui lòng thử lại.");
    }
  };

  const handleOpenLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = () => {
    handleCloseLogoutDialog();
    handleLogout();
  };

  return (
    <>
      <Box
        sx={{
          p: { xs: 1.5, md: 3 },
          display: "grid",
          gap: 2.2,
          borderRadius: 4,
          background: `radial-gradient(circle at 2% -10%, ${alpha("#1d7be6", 0.16)} 0%, transparent 42%), radial-gradient(circle at 100% 10%, ${alpha("#16a34a", 0.12)} 0%, transparent 38%)`,
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
                  Cài đặt tài khoản
                </Typography>
                <Typography sx={{ mt: 0.7, opacity: 0.95 }}>
                  Quản lý thông tin quản trị viên và thao tác bảo mật cho phiên
                  đăng nhập hiện tại.
                </Typography>
              </Box>

              <Stack direction={{ xs: "row", sm: "row" }} spacing={1}>
                <Chip
                  icon={
                    <AdminPanelSettingsRoundedIcon
                      sx={{ color: "#fff !important" }}
                    />
                  }
                  label={roleLabel}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    backgroundColor: alpha("#fff", 0.2),
                    borderRadius: 1.8,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={handleOpenLogoutDialog}
                  sx={{
                    px: 2,
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
                  Đăng xuất
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
              md: "1.6fr 1fr",
            },
            gap: 1.8,
          }}
        >
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #d9dee8",
              boxShadow: "none",
              animation: "riseUp 480ms ease",
            }}
          >
            <CardContent sx={{ pb: 1.1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <InfoRoundedIcon fontSize="small" sx={{ color: "#3f4b5a" }} />
                <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                  Thông tin tài khoản
                </Typography>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: "#d9dee8" }} />

            <CardContent
              sx={{ p: { xs: 1.4, md: 2 }, display: "grid", gap: 1 }}
            >
              {profileItems.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e7edf5",
                    p: 1.4,
                    backgroundColor: alpha("#f5f8fc", 0.7),
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          display: "grid",
                          placeItems: "center",
                          color: "#1d7be6",
                          backgroundColor: alpha("#1d7be6", 0.12),
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#687282" }}>
                        {item.label}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#243041",
                        textAlign: "right",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #d9dee8",
              boxShadow: "none",
              animation: "riseUp 540ms ease",
            }}
          >
            <CardContent sx={{ pb: 1.1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShieldRoundedIcon fontSize="small" sx={{ color: "#3f4b5a" }} />
                <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                  Bảo mật & phân quyền
                </Typography>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: "#d9dee8" }} />

            <CardContent
              sx={{ p: { xs: 1.4, md: 1.8 }, display: "grid", gap: 1 }}
            >
              {securityInfo.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(item.color, 0.22)}`,
                    p: 1.4,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          display: "grid",
                          placeItems: "center",
                          color: item.color,
                          backgroundColor: alpha(item.color, 0.14),
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#687282" }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 700, color: "#243041" }}>
                      {item.value}
                    </Typography>
                  </Stack>
                </Box>
              ))}

              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutRoundedIcon />}
                onClick={handleOpenLogoutDialog}
                sx={{ mt: 0.5, borderRadius: 2, fontWeight: 700 }}
              >
                Đăng xuất khỏi hệ thống
              </Button>
            </CardContent>
          </Card>
        </Box>

        {contextUser && contextUser.role !== "superadmin" && (
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #d9dee8",
              boxShadow: "none",
              animation: "riseUp 620ms ease",
            }}
          >
            <CardContent sx={{ pb: 1.1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccountBalanceRoundedIcon
                  fontSize="small"
                  sx={{ color: "#3f4b5a" }}
                />
                <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                  Thông tin thanh toán
                </Typography>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: "#d9dee8" }} />

            <CardContent sx={{ p: { xs: 1.4, md: 2 } }}>
              <form onSubmit={handlePaymentProfileSubmit}>
                <Stack spacing={1.5}>
                  <Typography variant="body2" sx={{ color: "#687282" }}>
                    {isPaymentProfileLoading
                      ? "Đang tải dữ liệu thanh toán..."
                      : hasPaymentProfile
                        ? "Đã có hồ sơ thanh toán. Bạn có thể chỉnh sửa và lưu lại."
                        : "Chưa có hồ sơ thanh toán. Vui lòng nhập thông tin để thêm mới."}
                  </Typography>

                  <TextField
                    select
                    label="Ngân hàng"
                    name="bankCode"
                    value={paymentForm.bankCode}
                    onChange={handlePaymentInputChange}
                    required
                    fullWidth
                    sx={paymentTextFieldSx}
                    helperText={
                      selectedBank
                        ? `Mã ngân hàng: ${selectedBank.code}`
                        : "Chọn ngân hàng từ danh sách"
                    }
                  >
                    <MenuItem value="" disabled>
                      Chọn ngân hàng
                    </MenuItem>
                    {BANK_OPTIONS.map((bankOption) => (
                      <MenuItem key={bankOption.code} value={bankOption.code}>
                        {`${bankOption.name} (${bankOption.code})`}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Số tài khoản / số thẻ"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handlePaymentInputChange}
                    required
                    fullWidth
                    sx={paymentTextFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardRoundedIcon
                            sx={{ color: "#6b7280", fontSize: 19 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Tên chủ tài khoản"
                    name="cardHolderName"
                    value={paymentForm.cardHolderName}
                    onChange={handlePaymentInputChange}
                    required
                    fullWidth
                    sx={paymentTextFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon
                            sx={{ color: "#6b7280", fontSize: 19 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="flex-end"
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        isSavingPaymentProfile ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <SaveRoundedIcon />
                        )
                      }
                      disabled={!isPaymentFormValid || isSavingPaymentProfile}
                      sx={{
                        minWidth: { xs: "100%", sm: 220 },
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    >
                      {isSavingPaymentProfile
                        ? "Đang lưu..."
                        : hasPaymentProfile
                          ? "Lưu cập nhật"
                          : "Thêm thông tin thanh toán"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
      <Dialog
        open={paymentConfirmDialogOpen}
        onClose={handleClosePaymentConfirmDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Xác nhận lưu cập nhật
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#4b5563" }}>
            Bạn có chắc chắn muốn lưu cập nhật thông tin thanh toán không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button
            variant="outlined"
            onClick={handleClosePaymentConfirmDialog}
            disabled={isSavingPaymentProfile}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSavingPaymentProfile ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveRoundedIcon />
              )
            }
            onClick={handleConfirmPaymentProfileUpdate}
            disabled={isSavingPaymentProfile}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {isSavingPaymentProfile ? "Đang lưu..." : "Xác nhận lưu"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận đăng xuất</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#4b5563" }}>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseLogoutDialog}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutRoundedIcon />}
            onClick={handleConfirmLogout}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsPage;

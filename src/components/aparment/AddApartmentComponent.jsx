import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import DomainAddRoundedIcon from "@mui/icons-material/DomainAddRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import WcRoundedIcon from "@mui/icons-material/WcRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";

const INITIAL_FORM_STATE = {
  name: "",
  address: "",
  adminName: "",
  email: "",
  password: "",
  phoneNumber: "",
  sex: "",
  placeOfResidence: "",
};

const AddApartmentComponent = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && isFormValid) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  const isEmailValid = /^\S+@\S+\.\S+$/.test(formData.email?.trim() || "");

  const isFormValid =
    Boolean(formData.name?.trim()) &&
    Boolean(formData.address?.trim()) &&
    Boolean(formData.adminName?.trim()) &&
    Boolean(formData.email?.trim()) &&
    Boolean(formData.password?.trim()) &&
    Boolean(formData.phoneNumber?.trim()) &&
    Boolean(formData.sex?.trim()) &&
    Boolean(formData.placeOfResidence?.trim()) &&
    isEmailValid;

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.primary.light, 0.05),
      "& fieldset": {
        borderColor: alpha(theme.palette.primary.main, 0.2),
      },
      "&:hover fieldset": {
        borderColor: alpha(theme.palette.primary.main, 0.35),
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflowY: "auto",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          boxShadow: "0 24px 56px rgba(15, 76, 129, 0.26)",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.4 },
          color: "#fff",
          background:
            "linear-gradient(125deg, #0f4c81 0%, #1d7be6 55%, #4db6ff 100%)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ opacity: 0.9, letterSpacing: 0.8 }}
            >
              APARTMENT
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Thêm chung cư mới
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
              Tạo tòa nhà mới để bắt đầu quản lý thiết bị và hoạt động sạc.
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            aria-label="Đóng"
            sx={{
              color: "#fff",
              backgroundColor: alpha("#fff", 0.18),
              "&:hover": {
                backgroundColor: alpha("#fff", 0.28),
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: 0.2,
              }}
            >
              Thông tin chung cư
            </Typography>
            <TextField
              label="Tên chung cư"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              autoFocus
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: 0.2,
                pt: 0.4,
              }}
            >
              Tài khoản admin quản lý chung cư
            </Typography>

            <TextField
              label="Tên admin"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              fullWidth
              required
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
              error={Boolean(formData.email) && !isEmailValid}
              helperText={
                Boolean(formData.email) && !isEmailValid
                  ? "Email chưa đúng định dạng."
                  : ""
              }
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Mật khẩu"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              type="password"
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              type="password"
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth required sx={textFieldSx}>
              <InputLabel id="admin-sex-label">Giới tính</InputLabel>
              <Select
                labelId="admin-sex-label"
                name="sex"
                value={formData.sex}
                label="Giới tính"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <WcRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                }
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Nơi cư trú"
              name="placeOfResidence"
              value={formData.placeOfResidence}
              onChange={handleChange}
              fullWidth
              required
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeWorkRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.6, sm: 2 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.1, sm: 1.6 },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Kiểm tra thông tin trước khi xác nhận.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: { xs: "100%", sm: "auto" },
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleClose} color="inherit">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || isSubmitting}
              sx={{ minWidth: 122, borderRadius: 2, fontWeight: 700 }}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DomainAddRoundedIcon />
                )
              }
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddApartmentComponent;

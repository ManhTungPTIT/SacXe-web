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
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import PowerRoundedIcon from "@mui/icons-material/PowerRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";

const AddEChargeDeviceComponent = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setFormData({
      deviceCode: "",
      totalSlots: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    onClose();
  };

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

  const isFormValid =
    Boolean(formData.deviceCode?.trim()) &&
    Number(formData.totalSlots) > 0 &&
    Boolean(formData.address?.trim()) &&
    formData.latitude !== "" &&
    formData.longitude !== "";

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
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
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
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Thêm thiết bị mới
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
              Khai báo trạm sạc cho chung cư và cấu hình vị trí lắp đặt.
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
          <Stack spacing={1.8}>
            <TextField
              label="Mã cổng thiết bị"
              name="deviceCode"
              value={formData.deviceCode}
              onChange={handleChange}
              fullWidth
              required
              autoFocus
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Số ổ cắm"
              type="number"
              name="totalSlots"
              value={formData.totalSlots}
              onChange={handleChange}
              fullWidth
              required
              sx={textFieldSx}
              inputProps={{ min: 1, step: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PowerRoundedIcon
                      sx={{ color: "text.secondary", fontSize: 19 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Địa chỉ cụ thể"
              type="text"
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Vĩ độ"
                placeholder="-90 đến 90"
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                fullWidth
                required
                sx={textFieldSx}
                inputProps={{ min: -90, max: 90, step: "any" }}
                helperText="Khoảng hợp lệ: -90 đến 90"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MyLocationRoundedIcon
                        sx={{ color: "text.secondary", fontSize: 19 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Kinh độ"
                placeholder="-180 đến 180"
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                fullWidth
                required
                sx={textFieldSx}
                inputProps={{ min: -180, max: 180, step: "any" }}
                helperText="Khoảng hợp lệ: -180 đến 180"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ExploreRoundedIcon
                        sx={{ color: "text.secondary", fontSize: 19 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
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
                  <ElectricBoltRoundedIcon />
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

export default AddEChargeDeviceComponent;

import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthMutation from "../../../hooks/queries/useAuthMutation";

const LoginPage = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const { mutate: login } = useAuthMutation.useLogin();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.email || !values.password) {
      setError("Email và mật khẩu không được bỏ trống.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    login(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          if (data?.user?.role === "user") {
            toast.error("Tài khoản không đúng!");
            return;
          }
          toast.success("Đăng nhập thành công!");
          navigate("/");
        },
        onError: (err) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Đăng nhập thất bại. Vui lòng thử lại.";
          setError(message);
          setTimeout(() => setError(""), 3000);
        },
      },
    );
  };

  return (
    <>
      <Grid
        container
        component="main"
        sx={{
          minHeight: "100dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: 1.2, sm: 5 },
          position: "relative",
        }}
      >
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          component={Paper}
          elevation={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: { xs: "auto", sm: "100%" },
            borderRadius: { xs: 2, sm: 0 },
            borderTopLeftRadius: { sm: 4 },
            borderBottomLeftRadius: { sm: 4 },
            borderTopRightRadius: { xs: 2, sm: 0 },
            borderBottomRightRadius: { xs: 2, sm: 0 },
          }}
        >
          <Box
            sx={{
              my: { xs: 4, sm: 8 },
              mx: { xs: 2, sm: 4 },
              width: "100%",
              maxWidth: { xs: "100%", sm: 420 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
              ĐĂNG NHẬP
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={values.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="remember"
                    color="primary"
                    checked={values.remember}
                    onChange={handleChange}
                  />
                }
                label="Lưu đăng nhập"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Đăng nhập
              </Button>

              <Grid
                container
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Grid item xs>
                  <Link
                    component={RouterLink}
                    to="/auth/forgot-password"
                    variant="body2"
                    sx={{
                      textDecoration: "none",
                      ":hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={6}
          sx={{
            background: "linear-gradient(135deg, #0f172a 0%, #0b1220 100%)",
            color: "#fff",
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            height: "100%",
            borderRadius: { sx: 2, sm: 0 },
            borderTopRightRadius: { sm: 4 },
            borderBottomRightRadius: { sm: 4 },
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Quản lý sạc xe trong tòa nhà của bạn
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>
              Kiểm soát việc sử dụng trạm sạc, theo dõi hoạt động và đảm bảo an
              toàn cho cư dân của bạn.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                mt: 3,
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 46, opacity: 0.95 }} />
              <Box>
                <Typography variant="h6">Quản lý sạc xe</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Dễ dàng theo dõi và kiểm soát việc sử dụng trạm sạc trong tòa
                  nhà của bạn, đảm bảo mọi người đều có thể sạc xe một cách công
                  bằng và hiệu quả.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {error && (
          // để cảnh báo lỗi góc trên bên phải
          <Alert
            severity="error"
            sx={{
              position: "fixed",
              top: { xs: 10, sm: 16 },
              right: { xs: 10, sm: 16 },
              left: { xs: 10, sm: "auto" },
              zIndex: 1600,
            }}
          >
            {error}
          </Alert>
        )}
      </Grid>
    </>
  );
};

export default LoginPage;

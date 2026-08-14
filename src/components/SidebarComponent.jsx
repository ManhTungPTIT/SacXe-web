import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const parseUser = () => {
  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("auth_user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const SidebarComponent = ({
  mobileOpen = false,
  onMobileClose,
  width = 260,
}) => {
  const user = parseUser();
  const location = useLocation();

  const navItems = [
    { label: "Trang chủ", path: "/", icon: <HomeRoundedIcon /> },
    { label: "Khách hàng", path: "/users", icon: <PeopleAltRoundedIcon /> },
    { label: "Doanh thu", path: "/revenue", icon: <AttachMoneyIcon /> },
    {
      label: "Đối soát giao dịch",
      path: "/transaction",
      icon: <ReceiptLongRoundedIcon />,
    },
    {
      label: "Thông báo",
      path: "/notifications",
      icon: <NotificationsIcon />,
    },
    { label: "Cài đặt", path: "/settings", icon: <SettingsIcon /> },
  ];

  if (user?.role === "superadmin") {
    navItems.splice(2, 0, {
      label: "Quản lý chung cư",
      path: "/apartments-management",
      icon: <LocationCityIcon />,
    });
  } else {
    navItems.splice(2, 0, {
      label: "Lịch sử sạc",
      path: "/history",
      icon: <HistoryRoundedIcon />,
    });
  }

  const isActiveItem = (itemPath) => {
    if (itemPath === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === itemPath ||
      location.pathname.startsWith(`${itemPath}/`)
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        width: { xs: "80vw", sm: width },
        maxWidth: 280,
        bgcolor: "#101b2d",
        color: "#fff",
        px: 2,
        py: 3,
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        E-Charge Safe
      </Typography>

      <List sx={{ p: 0 }}>
        {navItems.map((item) => {
          const isActive = isActiveItem(item.path);

          return (
            <ListItemButton
              component={Link}
              to={item.path}
              key={item.label}
              selected={isActive}
              onClick={onMobileClose}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: "#e8edf7",
                "&.Mui-selected": {
                  bgcolor: "rgba(93, 173, 255, 0.22)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(93, 173, 255, 0.3)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width,
          display: { xs: "none", md: "block" },
          zIndex: 1200,
        }}
      >
        {sidebarContent}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: { xs: "80vw", sm: width },
            maxWidth: 280,
            borderRight: "none",
            boxSizing: "border-box",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default SidebarComponent;

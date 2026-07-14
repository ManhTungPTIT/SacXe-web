import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent";

const SIDEBAR_WIDTH = 260;

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenSidebar = () => {
    setMobileOpen(true);
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SidebarComponent
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseSidebar}
        width={SIDEBAR_WIDTH}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          p: { xs: 1.5, sm: 2, md: 3 },
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ display: { xs: "flex", md: "none" }, mb: 1.5, px: 0.5 }}
        >
          <IconButton
            onClick={handleOpenSidebar}
            sx={{
              color: "#0f172a",
              bgcolor: "#fff",
              border: "1px solid #d9dee8",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
              "&:hover": {
                bgcolor: "#f8fafc",
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 800, color: "#1e293b", pr: 1 }}>
            E-Charge Safe
          </Typography>
        </Stack>

        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;

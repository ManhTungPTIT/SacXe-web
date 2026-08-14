import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  Radio,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { toast } from "react-toastify";
import useApartment from "../../hooks/queries/useApartment";
import useUser from "../../hooks/queries/useUser";

// Ba trạng thái của một dòng, suy từ admin.apartmentId so với chung cư đang mở.
const getAdminAssignment = (admin, apartmentId) => {
  const assignedId = admin?.apartmentId?._id;

  if (!assignedId) {
    return { kind: "free", label: "Chưa phân công", color: "default" };
  }
  if (String(assignedId) === String(apartmentId)) {
    return { kind: "current", label: "Quản lý chung cư này", color: "success" };
  }
  return {
    kind: "elsewhere",
    label: `Đang quản lý: ${admin.apartmentId?.name || "chung cư khác"}`,
    color: "warning",
    apartmentName: admin.apartmentId?.name || "chung cư khác",
  };
};

const AssignAdminComponent = ({
  open,
  onClose,
  apartmentId,
  apartmentName,
  currentOwnerId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { data: adminsResponse, isLoading } = useUser.useGetAllAdmin({
    enabled: open,
  });
  const { mutateAsync, isPending } = useApartment.useAssignAdmin();

  const admins = useMemo(
    () => (Array.isArray(adminsResponse?.data) ? adminsResponse.data : []),
    [adminsResponse],
  );

  // Mở lại dialog thì bắt đầu từ trạng thái sạch, không giữ lựa chọn lần trước.
  useEffect(() => {
    if (open) {
      setKeyword("");
      setSelectedId(null);
    }
  }, [open]);

  // Số admin xấp xỉ số chung cư nên lọc client-side là đủ, không cần tìm kiếm
  // phía server hay phân trang.
  const visibleAdmins = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return admins;
    return admins.filter(
      (admin) =>
        String(admin.name || "")
          .toLowerCase()
          .includes(needle) ||
        String(admin.email || "")
          .toLowerCase()
          .includes(needle),
    );
  }, [admins, keyword]);

  const selectedAdmin = admins.find(
    (admin) => String(admin._id) === String(selectedId),
  );
  const selectedAssignment = selectedAdmin
    ? getAdminAssignment(selectedAdmin, apartmentId)
    : null;

  const handleConfirm = async () => {
    try {
      await mutateAsync({ apartmentId, adminId: selectedId });
      toast.success(`Đã giao ${selectedAdmin?.name} quản lý ${apartmentName}.`);
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi phân công quản lý.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {currentOwnerId ? "Đổi quản lý chung cư" : "Phân công quản lý"}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          {apartmentName}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo tên hoặc email"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon
                  sx={{ color: "text.secondary", fontSize: 19 }}
                />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={26} />
          </Stack>
        ) : visibleAdmins.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
            <PersonRoundedIcon sx={{ color: "text.secondary", opacity: 0.6 }} />
            <Typography variant="body2" color="text.secondary">
              {admins.length === 0
                ? "Chưa có tài khoản quản trị viên nào trong hệ thống."
                : "Không tìm thấy quản trị viên phù hợp."}
            </Typography>
          </Stack>
        ) : (
          <List
            sx={{
              mt: 1,
              maxHeight: 320,
              overflowY: "auto",
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              borderRadius: 2,
              py: 0,
            }}
          >
            {visibleAdmins.map((admin) => {
              const assignment = getAdminAssignment(admin, apartmentId);
              const isCurrent = assignment.kind === "current";

              return (
                <ListItemButton
                  key={admin._id}
                  disabled={isCurrent}
                  selected={String(selectedId) === String(admin._id)}
                  onClick={() => setSelectedId(admin._id)}
                  sx={{ alignItems: "flex-start", gap: 1, py: 1.2 }}
                >
                  <Radio
                    size="small"
                    checked={String(selectedId) === String(admin._id)}
                    disabled={isCurrent}
                    sx={{ p: 0, mt: 0.3 }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0, sm: 1 }}
                      sx={{ alignItems: { sm: "baseline" } }}
                    >
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {admin.name || "Chưa đặt tên"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {admin.email}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={assignment.label}
                      color={assignment.color}
                      variant={
                        assignment.kind === "free" ? "filled" : "outlined"
                      }
                      sx={{ mt: 0.6, fontWeight: 600 }}
                    />
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}

        {/* Chỗ DUY NHẤT trong luồng mà một chung cư không liên quan bị ảnh
            hưởng, nên cảnh báo phải nêu đích danh tên chung cư đó. */}
        {selectedAssignment?.kind === "elsewhere" && (
          <Alert severity="warning" sx={{ mt: 1.8 }}>
            {selectedAdmin.name} đang quản lý {selectedAssignment.apartmentName}.
            Sau khi chuyển, {selectedAssignment.apartmentName} sẽ không còn người
            quản lý.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.8 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>
          Huỷ
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedId || isPending}
          sx={{ minWidth: 122, borderRadius: 2, fontWeight: 700 }}
          startIcon={
            isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isPending ? "Đang lưu..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignAdminComponent;

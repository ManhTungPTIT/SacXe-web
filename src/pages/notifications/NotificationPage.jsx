import { useMemo } from "react";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import useNotification from "../../hooks/queries/useNotification";

const formatDateTime = (value) => {
  if (!value) return "Không rõ thời gian";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeAgo = (value) => {
  if (!value) return "Không rõ";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60 * 1000) return "Vừa xong";

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(months / 12);
  return `${years} năm trước`;
};

const shortId = (value) => {
  return value;
};

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const NotificationPage = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useNotification.useGetNotifications();

  const feedbacks = useMemo(() => {
    const list = responseData?.data?.feedbacks;
    if (!Array.isArray(list)) return [];

    return [...list].sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [responseData]);

  const total = Number(responseData?.data?.total) || feedbacks.length;
  const withImageCount = feedbacks.filter((item) =>
    Boolean(item?.imageUrl),
  ).length;
  const todayCount = feedbacks.filter((item) =>
    isToday(item?.createdAt),
  ).length;

  if (isError) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #fecaca" }}>
        <CardContent>
          <Typography color="error" fontWeight={700}>
            Đã xảy ra lỗi khi tải thông báo!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            {error?.response?.data?.message ||
              "Vui lòng kiểm tra kết nối hoặc thử lại sau."}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const summaryCards = [
    {
      title: "Tổng thông báo",
      value: total,
      helper: "Feedback đã ghi nhận",
      icon: <ForumRoundedIcon fontSize="small" />,
      color: "#1d7be6",
    },
    {
      title: "Có hình ảnh",
      value: withImageCount,
      helper: "Kèm ảnh minh họa",
      icon: <PhotoRoundedIcon fontSize="small" />,
      color: "#16a34a",
    },
    {
      title: "Hôm nay",
      value: todayCount,
      helper: "Mới trong ngày",
      icon: <TodayRoundedIcon fontSize="small" />,
      color: "#f97316",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        display: "grid",
        gap: 2.2,
        borderRadius: 4,
        background: `radial-gradient(circle at 2% -10%, ${alpha("#1d7be6", 0.16)} 0%, transparent 42%), radial-gradient(circle at 100% 10%, ${alpha("#4db6ff", 0.12)} 0%, transparent 38%)`,
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
                Thông báo phản hồi
              </Typography>
              <Typography sx={{ mt: 0.7, opacity: 0.95 }}>
                Danh sách phản hồi từ người dùng, cập nhật theo thời gian thực
                tế.
              </Typography>
            </Box>

            <Chip
              icon={
                <NotificationsActiveRoundedIcon
                  sx={{ color: "#fff !important" }}
                />
              }
              label={`${total} thông báo`}
              sx={{
                color: "#fff",
                fontWeight: 700,
                backgroundColor: alpha("#fff", 0.2),
                borderRadius: 1.8,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
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
          border: "1px solid #d9dee8",
          boxShadow: "none",
          animation: "riseUp 520ms ease",
        }}
      >
        <CardContent sx={{ pb: 1.1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NotificationsActiveRoundedIcon
              fontSize="small"
              sx={{ color: "#3f4b5a" }}
            />
            <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
              Danh sách thông báo
            </Typography>
            <Typography variant="body2" sx={{ color: "#687282" }}>
              ({feedbacks.length} mục)
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#d9dee8" }} />

        <CardContent
          sx={{ p: { xs: 1.4, md: 1.8 }, display: "grid", gap: 1.3 }}
        >
          {feedbacks.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed #d9dee8",
                borderRadius: 2.2,
                p: { xs: 2.5, md: 3 },
                textAlign: "center",
                backgroundColor: alpha("#f3f6fb", 0.7),
              }}
            >
              <InboxRoundedIcon
                sx={{ color: "#718096", fontSize: 34, mb: 0.8 }}
              />
              <Typography sx={{ fontWeight: 700, color: "#2b3441" }}>
                Chưa có thông báo nào
              </Typography>
              <Typography variant="body2" sx={{ color: "#687282", mt: 0.6 }}>
                Khi người dùng gửi phản hồi, thông tin sẽ hiển thị tại đây.
              </Typography>
            </Box>
          ) : (
            feedbacks.map((item, index) => (
              <Card
                key={item?._id || `${item?.createdAt}-${index}`}
                sx={{
                  borderRadius: 2.4,
                  border: "1px solid #e4e9f2",
                  boxShadow: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    borderColor: alpha("#1d7be6", 0.45),
                    boxShadow: `0 10px 22px ${alpha("#1d7be6", 0.12)}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.6, sm: 2 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.6}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.2}
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          mt: 0.1,
                          width: 34,
                          height: 34,
                          borderRadius: 1.8,
                          display: "grid",
                          placeItems: "center",
                          color: "#1d7be6",
                          backgroundColor: alpha("#1d7be6", 0.12),
                          flexShrink: 0,
                        }}
                      >
                        <ForumRoundedIcon fontSize="small" />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={0.8}
                          alignItems={{ xs: "flex-start", md: "center" }}
                        >
                          <Typography
                            sx={{ fontWeight: 700, color: "#243041" }}
                          >
                            Thông báo từ {shortId(item?.fromUserId?.name)}
                          </Typography>
                          <Chip
                            size="small"
                            icon={
                              <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                            }
                            label={formatTimeAgo(item?.createdAt)}
                            sx={{
                              bgcolor: alpha("#1d7be6", 0.1),
                              color: "#1c5ea7",
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#2b3441",
                            mt: 0.6,
                            lineHeight: 1.55,
                            wordBreak: "break-word",
                          }}
                        >
                          {item?.content || "Không có nội dung phản hồi."}
                        </Typography>

                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={0.8}
                          sx={{ mt: 1.1 }}
                        >
                          <Chip
                            size="small"
                            icon={
                              <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
                            }
                            label={formatDateTime(item?.createdAt)}
                            sx={{ bgcolor: "#f4f7fb", color: "#445164" }}
                          />
                          <Chip
                            size="small"
                            icon={<PersonRoundedIcon sx={{ fontSize: 15 }} />}
                            label={`Người gửi: ${shortId(item?.fromUserId?.name)}`}
                            sx={{ bgcolor: "#f4f7fb", color: "#445164" }}
                          />
                        </Stack>
                      </Box>
                    </Stack>

                    {item?.imageUrl ? (
                      <Box
                        component="a"
                        href={item.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          flexShrink: 0,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #d9dee8",
                          width: { xs: "100%", sm: 130 },
                          height: { xs: 180, sm: 98 },
                          display: "block",
                          textDecoration: "none",
                        }}
                      >
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={`feedback-${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationPage;

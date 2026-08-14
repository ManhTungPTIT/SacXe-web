import { useMemo, useState } from "react";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import EvStationRoundedIcon from "@mui/icons-material/EvStationRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  Box,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useReport from "../../hooks/queries/useReport";

const toneMap = {
  primary: {
    line: "#1d7be6",
    hover: "#156ad0",
    area: "rgba(29, 123, 230, 0.14)",
    gradient: "linear-gradient(135deg, #0f4c81 0%, #1d7be6 55%, #4db6ff 100%)",
  },
  warning: {
    line: "#d97706",
    hover: "#b45309",
    area: "rgba(249, 115, 22, 0.14)",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #fb923c 100%)",
  },
  success: {
    line: "#16a34a",
    hover: "#15803d",
    area: "rgba(22, 163, 74, 0.14)",
    gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 52%, #4ade80 100%)",
  },
  danger: {
    line: "#dc2626",
    hover: "#b91c1c",
    area: "rgba(220, 38, 38, 0.14)",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 54%, #f87171 100%)",
  },
};

const kpiIconMap = {
  warning: <PaidRoundedIcon fontSize="small" />,
  danger: <BoltRoundedIcon fontSize="small" />,
  success: <EvStationRoundedIcon fontSize="small" />,
  title: <ApartmentRoundedIcon fontSize="small" />,
};

const CHART_PADDING = { top: 20, right: 16, bottom: 38, left: 44 };
const EMPTY_ROWS = [];

// Khoảng thời gian và mức gom nhóm đi thành cặp: cùng là "12 tháng" thì gom
// theo tháng, còn "7 ngày" gom theo ngày. Mặc định 7 ngày để mở dashboard lên
// là thấy ngay tuần vừa rồi.
const TOP_UP_RANGES = {
  "7d": { label: "7 ngày", groupBy: "day", days: 7 },
  "30d": { label: "30 ngày", groupBy: "day", days: 30 },
  "12m": { label: "12 tháng", groupBy: "month", months: 12 },
};
const DEFAULT_TOP_UP_RANGE = "7d";

const toDateParam = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getTopUpRangeParams = (rangeKey) => {
  const preset = TOP_UP_RANGES[rangeKey] || TOP_UP_RANGES[DEFAULT_TOP_UP_RANGE];
  const end = new Date();
  const start = new Date(end);

  if (preset.months) {
    // Lùi về ngày 1 của tháng đầu tiên, nếu không tháng cũ nhất sẽ bị cắt cụt.
    start.setMonth(end.getMonth() - (preset.months - 1), 1);
  } else {
    // days - 1: khoảng đã bao gồm cả hôm nay.
    start.setDate(end.getDate() - (preset.days - 1));
  }

  return {
    fromDate: toDateParam(start),
    toDate: toDateParam(end),
    groupBy: preset.groupBy,
  };
};

const formatVnd = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(value || 0)} VND`;

const getDayOnlyAxisLabel = (label) => {
  const text = String(label ?? "");
  const isoMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) return String(Number(isoMatch[3]));

  const dayFirstMatch = text.match(/(\d{1,2})[/-]\d{1,2}(?:[/-]\d{2,4})?$/);
  if (dayFirstMatch) return String(Number(dayFirstMatch[1]));

  return text;
};

const getAreaChartGeometry = (values = [], chartSize) => {
  if (!values || values.length === 0) {
    return { points: [], linePath: "", areaPath: "", yTicks: [] };
  }

  const { width, height } = chartSize;
  const plotWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const min = 0;
  const max = Math.max(...values, 1);
  const range = max - min;
  const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = CHART_PADDING.left + stepX * index;
    const y =
      CHART_PADDING.top +
      (1 - (value - min) / range) * (plotHeight === 0 ? 1 : plotHeight);

    return { x, y, value };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height - CHART_PADDING.bottom} L ${points[0].x} ${height - CHART_PADDING.bottom} Z`
      : "";

  let yValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(max - ratio * range),
  );
  const yTicks = [...new Set(yValues)].map((value) => {
    const y = CHART_PADDING.top + (1 - (value - min) / range) * plotHeight;
    return { y, value };
  });

  return { points, linePath, areaPath, yTicks };
};

const AreaChartPlaceholder = ({
  labels = [],
  values = [],
  chartSize,
  xAxisLabelFormatter = (label) => label,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const safeValues = Array.isArray(values) ? values : [];
  const safeLabels = Array.isArray(labels) ? labels : [];

  if (safeValues.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: chartSize.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Chưa có dữ liệu biểu đồ.</Typography>
      </Box>
    );
  }

  const { width, height } = chartSize;
  const geometry = getAreaChartGeometry(safeValues, chartSize);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: "100%", height: "auto", display: "block" }}
      >
        {geometry.yTicks.map((tick) => (
          <g key={`y-${tick.y}`}>
            <line
              x1={CHART_PADDING.left}
              y1={tick.y}
              x2={width - CHART_PADDING.right}
              y2={tick.y}
              stroke="#dfe5ee"
            />
            <text
              x={8}
              y={tick.y + 4}
              fill="#687282"
              fontSize="12"
              fontFamily="Segoe UI, sans-serif"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {geometry.areaPath ? (
          <path d={geometry.areaPath} fill={toneMap.primary.area} />
        ) : null}

        {geometry.linePath ? (
          <path
            d={geometry.linePath}
            fill="none"
            stroke={toneMap.primary.line}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : null}

        {geometry.points.map((point, index) => (
          <g key={`point-${safeLabels[index] || index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "6" : "4"}
              fill={toneMap.primary.line}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 30}
                  y={point.y < 35 ? point.y + 15 : point.y - 32}
                  width="60"
                  height="22"
                  rx="4"
                  fill="#2b3441"
                />
                <text
                  x={point.x}
                  y={point.y < 35 ? point.y + 30 : point.y - 17}
                  fill="#fff"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Segoe UI, sans-serif"
                  fontWeight="bold"
                >
                  {point.value}
                </text>
              </g>
            )}
          </g>
        ))}

        {safeLabels.map((label, index) => {
          const x =
            CHART_PADDING.left +
            ((chartSize.width - CHART_PADDING.left - CHART_PADDING.right) /
              (safeLabels.length - 1 || 1)) *
              index;

          return (
            <text
              key={`x-${label}`}
              x={x}
              y={height - 12}
              fill="#687282"
              fontSize="12"
              textAnchor="middle"
              fontFamily="Segoe UI, sans-serif"
            >
              {xAxisLabelFormatter(label)}
            </text>
          );
        })}
      </Box>
    </Box>
  );
};

const BarChartPlaceholder = ({ labels = [], values = [], chartSize }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const safeValues = Array.isArray(values) ? values : [];
  const safeLabels = Array.isArray(labels) ? labels : [];

  if (safeValues.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: chartSize.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Chưa có dữ liệu biểu đồ.</Typography>
      </Box>
    );
  }

  const { width, height } = chartSize;
  const plotWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const max = Math.max(...safeValues, 1);
  const slotWidth = plotWidth / safeValues.length;
  const barWidth = Math.min(56, slotWidth * 0.7);

  let yValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(max - max * ratio),
  );
  const yTicks = [...new Set(yValues)].map((value) => {
    const y = CHART_PADDING.top + (1 - value / max) * plotHeight;
    return { y, value };
  });

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: "100%", height: "auto", display: "block" }}
      >
        {yTicks.map((tick) => (
          <g key={`bar-y-${tick.y}`}>
            <line
              x1={CHART_PADDING.left}
              y1={tick.y}
              x2={width - CHART_PADDING.right}
              y2={tick.y}
              stroke="#dfe5ee"
            />
            <text
              x={8}
              y={tick.y + 4}
              fill="#687282"
              fontSize="12"
              fontFamily="Segoe UI, sans-serif"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {safeValues.map((value, index) => {
          const barHeight = (value / max) * plotHeight;
          const x =
            CHART_PADDING.left + slotWidth * index + (slotWidth - barWidth) / 2;
          const y = CHART_PADDING.top + (plotHeight - barHeight);

          return (
            <g key={`bar-${safeLabels[index] || index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill={
                  hoveredIndex === index
                    ? toneMap.primary.hover
                    : toneMap.primary.line
                }
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                fill="#687282"
                fontSize="12"
                textAnchor="middle"
                fontFamily="Segoe UI, sans-serif"
              >
                {safeLabels[index]}
              </text>
              {hoveredIndex === index && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 30}
                    y={y < 35 ? y + 10 : y - 32}
                    width="60"
                    height="22"
                    rx="4"
                    fill="#2b3441"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y < 35 ? y + 25 : y - 17}
                    fill="#fff"
                    fontSize="12"
                    textAnchor="middle"
                    fontFamily="Segoe UI, sans-serif"
                    fontWeight="bold"
                  >
                    {value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </Box>
    </Box>
  );
};

const AnalyticsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [topUpRange, setTopUpRange] = useState(DEFAULT_TOP_UP_RANGE);

  const chartSize = useMemo(() => {
    if (isMobile) {
      return { width: 320, height: 220 };
    }
    if (isTablet) {
      return { width: 500, height: 244 };
    }
    return { width: 620, height: 260 };
  }, [isMobile, isTablet]);

  const now = new Date();
  const endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const fromDate = "2024-01-01";
  const toDate = formatDate(endDateObj);

  const { data: reportData } = useReport.useGetReport({
    fromDate,
    toDate,
  });

  const topUpParams = useMemo(
    () => getTopUpRangeParams(topUpRange),
    [topUpRange],
  );

  const { data: topUpGrowth, isLoading: isTopUpLoading } =
    useReport.useGetTopUpGrowth(topUpParams);

  const dashboardData = {
    kpis: reportData?.kpis,
    barChart: reportData?.barChart,
    table: reportData?.table,
  };

  const tableRows = dashboardData?.table?.rows || EMPTY_ROWS;
  const tableTitle = dashboardData?.table?.title || "Dữ liệu khách hàng";
  const isCustomerTable = tableTitle === "Dữ liệu khách hàng";

  const fallbackKpis = [
    { id: "warning", title: "Số tiền tiêu thụ", value: "--", tone: "warning" },
    { id: "danger", title: "Điện năng tiêu thụ", value: "--", tone: "danger" },
    { id: "success", title: "Số lượng xe hoạt động", value: "--", tone: "success" },
    { id: "title", title: "Số lượng chung cư", value: "--", tone: "primary" },
  ];

  const kpiItems = dashboardData?.kpis?.length
    ? dashboardData.kpis
    : fallbackKpis;

  const filteredRows = useMemo(() => {
    if (!tableRows.length) return [];

    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    const rows = tableRows.filter((row) => {
      if (!lowerSearchTerm) {
        return true;
      }

      return Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(lowerSearchTerm);
    });

    return rows.slice(0, rowsPerPage);
  }, [rowsPerPage, searchTerm, tableRows]);

  const chartCardSx = {
    borderRadius: 3,
    boxShadow: "0 10px 28px rgba(15, 35, 66, 0.08)",
    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 14px 32px rgba(15, 35, 66, 0.12)",
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.2, md: 1.5 },
        borderRadius: 4,
        background: `radial-gradient(circle at 4% -10%, ${alpha("#1d7be6", 0.16)} 0%, transparent 42%), radial-gradient(circle at 100% 8%, ${alpha("#f97316", 0.12)} 0%, transparent 36%)`,
        "@keyframes riseUp": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            color: "#fff",
            background:
              "linear-gradient(125deg, #0f4c81 0%, #1d7be6 55%, #4db6ff 100%)",
            boxShadow: "0 22px 44px rgba(15, 76, 129, 0.3)",
            animation: "riseUp 420ms ease",
          }}
        >
          <CardContent sx={{ p: { xs: 2.3, md: 3 } }}>
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
                    lineHeight: 1.15,
                    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
                  }}
                >
                  Báo cáo lũy kế toàn hệ thống
                </Typography>
                <Typography sx={{ mt: 0.7, opacity: 0.95 }}>
                  Theo dõi xu hướng vận hành xuyên suốt toàn bộ thời gian.
                </Typography>
              </Box>

              <Stack
                spacing={1}
                alignItems={{ xs: "flex-start", md: "flex-end" }}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <Chip
                  label="Lũy kế từ thời điểm vận hành"
                  size="small"
                  sx={{
                    color: "#fff",
                    borderColor: alpha("#fff", 0.5),
                    backgroundColor: alpha("#fff", 0.14),
                    borderRadius: 1.5,
                    fontWeight: 600,
                  }}
                  variant="outlined"
                />
                <Chip
                  icon={
                    <QueryStatsRoundedIcon sx={{ color: "#fff !important" }} />
                  }
                  label={`${tableRows.length} bản ghi nguồn`}
                  size="small"
                  sx={{
                    color: "#fff",
                    backgroundColor: alpha("#fff", 0.2),
                    borderRadius: 1.5,
                    "& .MuiChip-icon": {
                      color: "#fff",
                    },
                  }}
                />
              </Stack>
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
            gap: 2,
          }}
        >
          {kpiItems.map((item, index) => {
            const tone = toneMap[item.tone] || toneMap.primary;

            return (
              <Card
                key={item.id || `${item.title}-${index}`}
                sx={{
                  overflow: "hidden",
                  borderRadius: 3,
                  color: "#fff",
                  boxShadow: "0 16px 34px rgba(15, 35, 66, 0.16)",
                  background: tone.gradient,
                  animation: "riseUp 480ms ease",
                  animationDelay: `${120 + index * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <CardContent sx={{ p: 2.2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, opacity: 0.92 }}>
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.7,
                          fontSize: 30,
                          lineHeight: 1,
                          fontWeight: 700,
                          fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
                        }}
                      >
                        {item.value ?? "--"}
                      </Typography>
                      <Typography sx={{ mt: 1.1, opacity: 0.88, fontSize: 12 }}>
                        Cập nhật theo dữ liệu lũy kế
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: alpha("#fff", 0.2),
                      }}
                    >
                      {kpiIconMap[item.id] || (
                        <QueryStatsRoundedIcon fontSize="small" />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Card sx={chartCardSx}>
            <CardContent sx={{ pb: 1.2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <QueryStatsRoundedIcon
                    fontSize="small"
                    sx={{ color: toneMap.primary.line }}
                  />
                  <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                    {topUpGrowth?.title || "Tăng trưởng tiền nạp (VND)"}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flexWrap: "wrap", rowGap: 1 }}
                >
                  <Chip
                    size="small"
                    label={formatVnd(topUpGrowth?.total)}
                    sx={{
                      backgroundColor: alpha(toneMap.primary.line, 0.12),
                      color: toneMap.primary.line,
                      fontWeight: 600,
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={topUpRange}
                    onChange={(event) => setTopUpRange(event.target.value)}
                    sx={{ minWidth: 116 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthRoundedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  >
                    {Object.entries(TOP_UP_RANGES).map(([key, preset]) => (
                      <MenuItem key={key} value={key}>
                        {preset.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.85) }} />

            <CardContent>
              {isTopUpLoading ? (
                <Box
                  sx={{
                    height: chartSize.height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Đang tải dữ liệu…
                  </Typography>
                </Box>
              ) : (
                <AreaChartPlaceholder
                  labels={topUpGrowth?.labels}
                  values={topUpGrowth?.values}
                  chartSize={chartSize}
                  xAxisLabelFormatter={
                    topUpRange === "30d" ? getDayOnlyAxisLabel : undefined
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card sx={chartCardSx}>
            <CardContent sx={{ pb: 1.2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BarChartRoundedIcon
                    fontSize="small"
                    sx={{ color: toneMap.warning.line }}
                  />
                  <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                    {dashboardData?.barChart?.title || "Biểu đồ cột"}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={`${dashboardData?.barChart?.values?.length || 0} cột`}
                  sx={{
                    backgroundColor: alpha(toneMap.warning.line, 0.12),
                    color: toneMap.warning.line,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </CardContent>

            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.85) }} />

            <CardContent>
              <BarChartPlaceholder
                labels={dashboardData?.barChart?.labels}
                values={dashboardData?.barChart?.values}
                chartSize={chartSize}
              />
            </CardContent>
          </Card>
        </Box>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 28px rgba(15, 35, 66, 0.08)",
            border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          }}
        >
          <CardContent sx={{ pb: 1.2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <TableChartRoundedIcon
                  fontSize="small"
                  sx={{ color: toneMap.primary.line }}
                />
                <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                  {tableTitle}
                </Typography>
              </Stack>

              <Chip
                size="small"
                icon={<EvStationRoundedIcon fontSize="small" />}
                label={`${filteredRows.length} dòng hiển thị`}
                sx={{
                  backgroundColor: alpha(toneMap.primary.line, 0.12),
                  color: toneMap.primary.line,
                  fontWeight: 600,
                }}
              />
            </Stack>
          </CardContent>

          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.85) }} />

          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={1.5}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
              >
                <TuneRoundedIcon sx={{ color: "#475569", fontSize: 19 }} />
                <Typography sx={{ color: "#334155", fontWeight: 600 }}>
                  Hiển thị
                </Typography>
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={(event) =>
                    setRowsPerPage(Number(event.target.value))
                  }
                  sx={{
                    minWidth: 82,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.8,
                      bgcolor: "#fff",
                    },
                  }}
                >
                  {[10, 25, 50].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography sx={{ color: "#334155", fontWeight: 600 }}>
                  mục
                </Typography>
              </Stack>

              <TextField
                size="small"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm theo từ khóa"
                sx={{
                  minWidth: { xs: "100%", md: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.8,
                    bgcolor: "#fff",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{ color: "#64748b", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <TableContainer
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                borderRadius: 2,
                overflow: "auto",
                maxHeight: 520,
                "&::-webkit-scrollbar": {
                  height: 7,
                  width: 7,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: alpha(theme.palette.divider, 0.24),
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.36),
                  borderRadius: 8,
                },
              }}
            >
              {isCustomerTable ? (
                <Table stickyHeader sx={{ minWidth: { xs: 560, md: 680 } }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: 700,
                          whiteSpace: { xs: "normal", sm: "nowrap" },
                          fontSize: { xs: 12, sm: 14 },
                          py: { xs: 1.1, sm: 1.6 },
                          color: "#1f2937",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                        },
                      }}
                    >
                      <TableCell>Tên</TableCell>
                      <TableCell>Biển số xe</TableCell>
                      <TableCell>Số lần sạc</TableCell>
                      <TableCell>Điện năng tiêu thụ</TableCell>
                      <TableCell>Số tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row, index) => (
                      <TableRow
                        key={`${row?.name || "customer"}-${row?.startDate || index}`}
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
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.licencePlate}</TableCell>
                        <TableCell>{row.chargingCount}</TableCell>
                        <TableCell>{row.energyConsumption}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <Typography sx={{ color: "#64748b" }}>
                            Không có dữ liệu nào phù hợp với truy vấn của bạn.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              ) : (
                <Table stickyHeader sx={{ minWidth: { xs: 560, md: 680 } }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: 700,
                          whiteSpace: { xs: "normal", sm: "nowrap" },
                          fontSize: { xs: 12, sm: 14 },
                          py: { xs: 1.1, sm: 1.6 },
                          color: "#1f2937",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                        },
                      }}
                    >
                      <TableCell>Chung cư</TableCell>
                      <TableCell>Số thiết bị</TableCell>
                      <TableCell>Số lần sạc</TableCell>
                      <TableCell>Điện năng tiêu thụ</TableCell>
                      <TableCell>Số tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row, index) => (
                      <TableRow
                        key={`${row?.apartmentName || "apartment"}-${row?.startDate || index}`}
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
                        <TableCell>{row.apartmentName}</TableCell>
                        <TableCell>{row.deviceCount}</TableCell>
                        <TableCell>{row.chargingCount}</TableCell>
                        <TableCell>{row.energyConsumption}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <Typography sx={{ color: "#64748b" }}>
                            Không có dữ liệu nào phù hợp với truy vấn của bạn.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default AnalyticsPage;

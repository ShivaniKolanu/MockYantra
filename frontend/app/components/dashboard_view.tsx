"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

const overviewCards = [
  { label: "Total Projects", value: "12", change: "+2 this week" },
  { label: "Total APIs", value: "47", change: "+8 this week" },
  { label: "Mock Records Generated", value: "128K", change: "+14%" },
  { label: "Error Rate", value: "1.8%", change: "-0.4%" },
];

const requestSeries = [1200, 1450, 1380, 1660, 1720, 1910, 1840];
const requestLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const methodData = [
  { id: 0, value: 44, label: "GET" },
  { id: 1, value: 26, label: "POST" },
  { id: 2, value: 14, label: "PUT" },
  { id: 3, value: 9, label: "PATCH" },
  { id: 4, value: 7, label: "DELETE" },
];

const statusLabels = ["2xx", "3xx", "4xx", "5xx"];
const statusData = [4100, 430, 720, 190];

const topApis = [
  { name: "GET /users", requests: 1860, successRate: 98 },
  { name: "POST /orders", requests: 1210, successRate: 95 },
  { name: "GET /products", requests: 980, successRate: 99 },
  { name: "PATCH /users/{id}", requests: 620, successRate: 94 },
  { name: "DELETE /sessions/{id}", requests: 420, successRate: 97 },
];

export default function DashboardView() {
  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.2}>
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1.35rem", fontWeight: 700 }}>Dashboard</Typography>
          <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", mt: 0.5 }}>
            Quick overview of API usage, health, and generation activity.
          </Typography>
        </Box>
        <Chip
          label="Last 7 days"
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          }}
        />
      </Stack>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {overviewCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.14)",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)",
              }}
            >
              <Typography sx={{ color: "rgba(244, 242, 255, 0.78)", fontSize: "0.9rem" }}>{card.label}</Typography>
              <Typography sx={{ color: "#FFFFFF", fontSize: "1.7rem", fontWeight: 800, mt: 0.7 }}>{card.value}</Typography>
              <Typography sx={{ color: "#B9F5D0", fontWeight: 600, mt: 0.4, fontSize: "0.86rem" }}>{card.change}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Requests Over Time</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              Tracks overall request volume and trend through the week.
            </Typography>
            <LineChart
              height={280}
              xAxis={[{ scaleType: "point", data: requestLabels }]}
              series={[
                {
                  data: requestSeries,
                  label: "Requests",
                  color: "#B6A5FF",
                  showMark: false,
                  curve: "monotoneX",
                },
              ]}
              grid={{ horizontal: true }}
              margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
              height: "100%",
            }}
          >
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Method Distribution</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              Share of traffic by HTTP method.
            </Typography>
            <PieChart
              height={280}
              series={[
                {
                  data: methodData,
                  innerRadius: 55,
                  outerRadius: 95,
                  paddingAngle: 2,
                  cornerRadius: 5,
                  cx: 120,
                  cy: 120,
                },
              ]}
              colors={["#B6A5FF", "#7BDCC3", "#79B8FF", "#FFD36E", "#FF8FA3"]}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Status Code Distribution</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              High-level health snapshot by response class.
            </Typography>
            <BarChart
              height={260}
              xAxis={[{ scaleType: "band", data: statusLabels }]}
              series={[{ data: statusData, label: "Responses", color: "#8ED1FC" }]}
              grid={{ horizontal: true }}
              margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Top APIs By Traffic</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.88rem", mb: 1.2 }}>
              Most frequently used endpoints and their success rates.
            </Typography>

            <Stack spacing={1.4}>
              {topApis.map((api) => (
                <Box key={api.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.92)", fontWeight: 600 }}>{api.name}</Typography>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.78)", fontSize: "0.86rem" }}>
                      {api.requests.toLocaleString()} req
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={api.successRate}
                    sx={{
                      height: 8,
                      borderRadius: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: api.successRate >= 97 ? "#7BDCC3" : "#B6A5FF",
                        borderRadius: 8,
                      },
                    }}
                  />
                  <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.8rem", mt: 0.45 }}>
                    Success rate: {api.successRate}%
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

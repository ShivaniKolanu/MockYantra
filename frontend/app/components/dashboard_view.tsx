"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

type ApiRecord = {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  isActive?: boolean;
  responseSchema?: unknown;
  createdAt?: string;
};

type ProjectRecord = {
  id: string;
  name: string;
  apis: ApiRecord[];
};

type StoredResponseSchema = {
  sampleData?: unknown;
};

function extractSampleCount(responseSchema: unknown): number {
  let parsed: unknown = responseSchema;

  if (typeof responseSchema === "string") {
    try {
      parsed = JSON.parse(responseSchema);
    } catch {
      return 0;
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return 0;
  }

  const payload = parsed as StoredResponseSchema;
  return Array.isArray(payload.sampleData) ? payload.sampleData.length : 0;
}

function getDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function normalizeDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardView() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const data = (await response.json()) as ProjectRecord[];

        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardData = useMemo(() => {
    const apis = projects.flatMap((project) =>
      project.apis.map((api) => ({
        ...api,
        projectName: project.name,
        sampleCount: extractSampleCount(api.responseSchema),
      }))
    );

    const totalProjects = projects.length;
    const totalApis = apis.length;
    const totalMockRows = apis.reduce((sum, api) => sum + api.sampleCount, 0);
    const activeApis = apis.filter((api) => api.isActive).length;
    const inactiveApis = totalApis - activeApis;
    const activeProjects = projects.filter((project) => project.apis.some((api) => api.isActive)).length;

    const methodOrder = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const methodCounts = methodOrder.map((method) => ({
      id: method,
      label: method,
      value: apis.filter((api) => api.method === method).length,
    }));

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: normalizeDay(date),
        label: getDateLabel(date),
      };
    });

    const createdByDay = last7Days.map((day) =>
      apis.filter((api) => {
        if (!api.createdAt) {
          return false;
        }

        return normalizeDay(new Date(api.createdAt)) === day.key;
      }).length
    );

    const topApis = [...apis]
      .sort((left, right) => right.sampleCount - left.sampleCount)
      .slice(0, 5);

    const projectLabels = projects.map((project) => project.name);
    const projectApiCounts = projects.map((project) => project.apis.length);

    return {
      totalProjects,
      totalApis,
      totalMockRows,
      activeApis,
      inactiveApis,
      activeProjects,
      inactiveProjects: totalProjects - activeProjects,
      methodCounts,
      createdLabels: last7Days.map((day) => day.label),
      createdByDay,
      topApis,
      projectLabels,
      projectApiCounts,
    };
  }, [projects]);

  if (loading) {
    return (
      <Box sx={{ px: 4, py: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={20} sx={{ color: "#84E3CF" }} />
        <Typography sx={{ color: "rgba(228, 255, 246, 0.82)" }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 4, py: 3 }}>
        <Typography sx={{ color: "#FFB4C4", fontWeight: 600 }}>{error}</Typography>
      </Box>
    );
  }

  const overviewCards = [
    {
      label: "Total Projects",
      value: String(dashboardData.totalProjects),
      change: `${dashboardData.activeProjects} with hosted APIs`,
    },
    {
      label: "Total APIs",
      value: String(dashboardData.totalApis),
      change: `${dashboardData.activeApis} active, ${dashboardData.inactiveApis} inactive`,
    },
    {
      label: "Mock Rows Stored",
      value: dashboardData.totalMockRows.toLocaleString(),
      change: "Across all generated datasets",
    },
    {
      label: "Hosted Coverage",
      value: dashboardData.totalApis > 0
        ? `${Math.round((dashboardData.activeApis / dashboardData.totalApis) * 100)}%`
        : "0%",
      change: `${dashboardData.inactiveProjects} projects without hosted APIs`,
    },
  ];

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.2}>
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1.35rem", fontWeight: 700 }}>Dashboard</Typography>
          <Typography sx={{ color: "rgba(228, 255, 246, 0.82)", mt: 0.5 }}>
            Live overview of your projects, hosted APIs, and generated mock datasets.
          </Typography>
        </Box>
        <Chip
          label={(
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.9 }}>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4ADE80",
                  boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.85)",
                  animation: "livePulse 1.4s ease-in-out infinite",
                  "@keyframes livePulse": {
                    "0%": {
                      opacity: 1,
                      boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.85)",
                    },
                    "70%": {
                      opacity: 0.5,
                      boxShadow: "0 0 0 8px rgba(74, 222, 128, 0)",
                    },
                    "100%": {
                      opacity: 1,
                      boxShadow: "0 0 0 0 rgba(74, 222, 128, 0)",
                    },
                  },
                }}
              />
              Live workspace data
            </Box>
          )}
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
              <Typography sx={{ color: "rgba(228, 255, 246, 0.78)", fontSize: "0.9rem" }}>{card.label}</Typography>
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
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>APIs Created In Last 7 Days</Typography>
            <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              Shows creation activity based on API timestamps in your current workspace.
            </Typography>
            <LineChart
              height={280}
              xAxis={[{ scaleType: "point", data: dashboardData.createdLabels }]}
              series={[
                {
                  data: dashboardData.createdByDay,
                  label: "APIs created",
                  color: "#B6A5FF",
                  showMark: true,
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
            <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              Breakdown of stored APIs by HTTP method.
            </Typography>
            <PieChart
              height={280}
              series={[
                {
                  data: dashboardData.methodCounts,
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
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>APIs Per Project</Typography>
            <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.88rem", mb: 1 }}>
              Shows how APIs are distributed across your current projects.
            </Typography>
            <BarChart
              height={260}
              xAxis={[{ scaleType: "band", data: dashboardData.projectLabels }]}
              series={[{ data: dashboardData.projectApiCounts, label: "APIs", color: "#8ED1FC" }]}
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
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Top APIs By Sample Rows</Typography>
            <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.88rem", mb: 1.2 }}>
              Ranked by how many generated rows are currently stored per API.
            </Typography>

            <Stack spacing={1.4}>
              {dashboardData.topApis.length === 0 ? (
                <Typography sx={{ color: "rgba(228, 255, 246, 0.68)", fontSize: "0.9rem" }}>
                  No APIs found yet. Create one to populate the dashboard.
                </Typography>
              ) : (
                dashboardData.topApis.map((api) => {
                  const maxRows = Math.max(dashboardData.topApis[0]?.sampleCount ?? 1, 1);
                  const progress = Math.max((api.sampleCount / maxRows) * 100, api.sampleCount > 0 ? 8 : 0);

                  return (
                    <Box key={api.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography sx={{ color: "rgba(228, 255, 246, 0.92)", fontWeight: 600 }}>
                          {api.method} {api.name}
                        </Typography>
                        <Typography sx={{ color: "rgba(228, 255, 246, 0.78)", fontSize: "0.86rem" }}>
                          {api.sampleCount.toLocaleString()} rows
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 8,
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: api.isActive ? "#7BDCC3" : "#B6A5FF",
                            borderRadius: 8,
                          },
                        }}
                      />
                      <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.8rem", mt: 0.45 }}>
                        Project: {api.projectName}  -  {api.isActive ? "Hosted" : "Not hosted"}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


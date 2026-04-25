"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type ApiData = {
  id: string;
  name: string;
  method: string;
  endpoint: string;
  isActive: boolean;
  description: string | null;
  responseSchema: {
    schema: Record<string, unknown>;
    sampleData: Record<string, unknown>[];
    endpointPath: string;
  } | null;
  createdAt: string;
};

type ApiViewProps = {
  project: string;
  api: string;
  apiId: string;
  onHostingStatusChanged?: () => void;
};

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "#4ade80", color: "#052e16" },
  POST: { bg: "#60a5fa", color: "#0c1a2e" },
  PUT: { bg: "#fbbf24", color: "#1c1407" },
  PATCH: { bg: "#c084fc", color: "#1a0b2e" },
  DELETE: { bg: "#f87171", color: "#1c0404" },
};

function getMethodStyle(method: string) {
  return METHOD_COLORS[method.toUpperCase()] ?? { bg: "#84E3CF", color: "#07352F" };
}

function getCodeSnippets(endpoint: string, method: string) {
  return {
    curl: `curl -X ${method} "${endpoint}" \\
  -H "Content-Type: application/json"`,
    fetch: `const response = await fetch("${endpoint}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`,
    axios: `import axios from "axios";

const { data } = await axios({
  method: "${method.toLowerCase()}",
  url: "${endpoint}",
  headers: {
    "Content-Type": "application/json"
  }
});

console.log(data);`,
    python: `import requests

url = "${endpoint}"
headers = {"Content-Type": "application/json"}

response = requests.request("${method}", url, headers=headers)
print(response.json())`,
  };
}

type FetchResult = {
  error: string | null;
  apiData: ApiData | null;
  visibleCount: number;
};

const INITIAL_FETCH: FetchResult = { error: null, apiData: null, visibleCount: 50 };

export default function ApiView({ project, api, apiId, onHostingStatusChanged }: ApiViewProps) {
  const [fetchedForId, setFetchedForId] = useState<string | null>(null);
  const [fetchResult, setFetchResult] = useState<FetchResult>(INITIAL_FETCH);
  const [snippetTab, setSnippetTab] = useState(0);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Derived state avoids any synchronous setState in the effect body
  const loading = fetchedForId !== apiId;

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/apis/${apiId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load API details");
        return res.json() as Promise<ApiData>;
      })
      .then((data) => {
        if (!cancelled) {
          setFetchResult({ error: null, apiData: data, visibleCount: 50 });
          setFetchedForId(apiId);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchResult({
            error: err instanceof Error ? err.message : "Unknown error",
            apiData: null,
            visibleCount: 50,
          });
          setFetchedForId(apiId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiId]);

  const { error, apiData, visibleCount } = fetchResult;
  const sampleData = apiData?.responseSchema?.sampleData ?? [];
  const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
  const visibleRows = sampleData.slice(0, visibleCount);
  const endpoint = apiData?.endpoint ?? "";
  const method = apiData?.method ?? "GET";
  const methodStyle = getMethodStyle(method);
  const endpointPath = apiData?.responseSchema?.endpointPath ?? "";
  const runtimeUrl =
    typeof window !== "undefined" && endpointPath
      ? `${window.location.origin}${endpointPath}`
      : endpointPath;

  const snippets = useMemo(() => getCodeSnippets(endpoint, method), [endpoint, method]);
  const snippetItems = [
    { label: "cURL", code: snippets.curl },
    { label: "Fetch", code: snippets.fetch },
    { label: "Axios", code: snippets.axios },
    { label: "Python", code: snippets.python },
  ];

  const activeSnippet = snippetItems[snippetTab];

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 40;
    if (nearBottom && visibleCount < sampleData.length) {
        setFetchResult((prev) => ({
          ...prev,
          visibleCount: Math.min(prev.visibleCount + 50, sampleData.length),
        }));
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
    } catch {
      // clipboard may be blocked in some environments
    }
  };

  const toggleHosting = async (nextValue: boolean) => {
    setToggleError(null);
    setToggleLoading(true);

    try {
      const response = await fetch(`/api/apis/${apiId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: nextValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update hosting status");
      }

      setFetchResult((prev) => ({
        ...prev,
        apiData: prev.apiData ? { ...prev.apiData, isActive: nextValue } : prev.apiData,
      }));

      onHostingStatusChanged?.();
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ px: 4, py: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={20} sx={{ color: "#84E3CF" }} />
        <Typography sx={{ color: "rgba(228, 255, 246, 0.72)" }}>Loading API...</Typography>
      </Box>
    );
  }

  if (error || !apiData) {
    return (
      <Box sx={{ px: 4, py: 3 }}>
        <Typography sx={{ color: "#f87171" }}>{error ?? "API not found."}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" separator="/" sx={{ color: "#E9FFF8" }}>
        <Typography sx={{ color: "rgba(228, 255, 246, 0.82)", fontWeight: 500 }}>
          {project}
        </Typography>
        <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>{api}</Typography>
      </Breadcrumbs>

      <Grid container spacing={2} sx={{ mt: 1.2 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
              height: "100%",
              minHeight: { lg: 360 },
            }}
          >
            <Stack spacing={1.2}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.12rem" }}>API Details</Typography>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: apiData.isActive
                    ? "1px solid rgba(74, 222, 128, 0.32)"
                    : "1px solid rgba(248, 113, 113, 0.24)",
                  background: apiData.isActive
                    ? "rgba(74, 222, 128, 0.08)"
                    : "rgba(248, 113, 113, 0.06)",
                }}
              >
                <Stack spacing={0.6}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                    <Box>
                      <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>
                        {apiData.isActive ? "Hosting is ON" : "Hosting is OFF"}
                      </Typography>
                      <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.84rem" }}>
                        {apiData.isActive
                          ? "Requests to this path will return the stored mock rows."
                          : "Requests to this path will return 404 until you turn hosting on."}
                      </Typography>
                    </Box>

                    <FormControlLabel
                      sx={{ mr: 0 }}
                      control={
                        <Switch
                          checked={apiData.isActive}
                          disabled={toggleLoading}
                          onChange={(_, checked) => void toggleHosting(checked)}
                        />
                      }
                      label={apiData.isActive ? "On" : "Off"}
                    />
                  </Stack>

                  <Typography sx={{ color: "rgba(228, 255, 246, 0.78)", fontSize: "0.82rem", wordBreak: "break-all" }}>
                    Local runtime URL: {runtimeUrl || endpointPath || endpoint}
                  </Typography>

                  {toggleError && (
                    <Typography sx={{ color: "#fca5a5", fontSize: "0.82rem" }}>
                      {toggleError}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip label={method} sx={{ backgroundColor: methodStyle.bg, color: methodStyle.color, fontWeight: 800 }} />
                <Typography sx={{ color: "rgba(228, 255, 246, 0.92)", wordBreak: "break-all" }}>{endpoint}</Typography>
              </Box>

              {apiData.description && (
                <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.88rem" }}>
                  {apiData.description}
                </Typography>
              )}

              <Grid container spacing={1.2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.82rem" }}>Method</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>{method}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.82rem" }}>Response</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>JSON</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.82rem" }}>Mock Rows</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>{sampleData.length}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.82rem" }}>Fields</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>{columns.length}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
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
            <Box>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>Use This API</Typography>
              <Tabs
                value={snippetTab}
                onChange={(_, newValue: number) => setSnippetTab(newValue)}
                textColor="inherit"
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                  "& .MuiTab-root": {
                    color: "rgba(228, 255, 246, 0.78)",
                    textTransform: "none",
                    fontWeight: 700,
                    minHeight: 40,
                    px: 1.2,
                  },
                  "& .Mui-selected": {
                    color: "#FFFFFF",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#84E3CF",
                    height: 3,
                    borderRadius: 2,
                  },
                }}
              >
                {snippetItems.map((item) => (
                  <Tab key={item.label} label={item.label} />
                ))}
              </Tabs>
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.1, mb: 0.8 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon fontSize="small" />}
                onClick={copySnippet}
                sx={{
                  textTransform: "none",
                  borderColor: "rgba(132, 227, 207, 0.55)",
                  color: "#D8FFF4",
                  "&:hover": {
                    borderColor: "rgba(170, 245, 229, 0.9)",
                    backgroundColor: "rgba(132, 227, 207, 0.14)",
                  },
                }}
              >
                Copy
              </Button>
            </Stack>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.4,
                borderRadius: 1.5,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(7, 28, 34, 0.68)",
                color: "rgba(228, 255, 246, 0.93)",
                overflow: "auto",
                maxHeight: 320,
                fontSize: "0.82rem",
                lineHeight: 1.55,
              }}
            >
              {activeSnippet.code}
            </Box>

            <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.82rem", mt: 1 }}>
              Helpful tip: use these snippets to test quickly before integrating with your app layer.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1.2 }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Generated Data</Typography>
              <Typography sx={{ color: "rgba(228, 255, 246, 0.72)", fontSize: "0.86rem" }}>
                Showing {visibleRows.length} of {sampleData.length} rows
              </Typography>
            </Stack>

            {columns.length === 0 ? (
              <Typography sx={{ color: "rgba(228, 255, 246, 0.56)", py: 2 }}>No sample data available.</Typography>
            ) : (
              <TableContainer
                onScroll={handleTableScroll}
                sx={{
                  maxHeight: 430,
                  borderRadius: 1.5,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(18, 15, 35, 0.5)",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell key={col} sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {columns.map((col) => (
                          <TableCell key={col} sx={{ color: "rgba(228, 255, 246, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
                            {String(row[col] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {visibleCount < sampleData.length && (
              <Button
                variant="outlined"
                onClick={() =>
                  setFetchResult((prev) => ({
                    ...prev,
                    visibleCount: Math.min(prev.visibleCount + 100, sampleData.length),
                  }))
                }
                sx={{
                  mt: 1.2,
                  textTransform: "none",
                  borderColor: "rgba(132, 227, 207, 0.55)",
                  color: "#D8FFF4",
                  "&:hover": {
                    borderColor: "rgba(170, 245, 229, 0.9)",
                    backgroundColor: "rgba(132, 227, 207, 0.14)",
                  },
                }}
              >
                Load More Rows
              </Button>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}


"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
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

type ApiViewProps = {
  project: string;
  api: string;
};

type MockUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  city: string;
  createdAt: string;
};

const ROLES = ["admin", "editor", "viewer", "analyst"];
const CITIES = ["Bengaluru", "Pune", "Hyderabad", "Mumbai", "Delhi", "Chennai"];

function buildMockUsers(total: number): MockUser[] {
  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;
    const role = ROLES[index % ROLES.length];
    const city = CITIES[index % CITIES.length];
    return {
      id,
      name: `User ${id}`,
      email: `user${id}@mockyantra.dev`,
      role,
      city,
      createdAt: `2026-03-${String((index % 28) + 1).padStart(2, "0")}`,
    };
  });
}

function getCodeSnippets(endpoint: string, method: string) {
  return {
    curl: `curl -X ${method} "${endpoint}" -H "Authorization: Bearer <token>" -H "Content-Type: application/json"`,
    fetch: `const response = await fetch("${endpoint}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer <token>",
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
    Authorization: "Bearer <token>",
    "Content-Type": "application/json"
  }
});

console.log(data);`,
    python: `import requests

url = "${endpoint}"
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.request("${method}", url, headers=headers)
print(response.json())`,
  };
}

export default function ApiView({ project, api }: ApiViewProps) {
  const endpoint = `https://api.mockyantra.dev/${api.toLowerCase().replace(/\s+/g, "-")}`;
  const method = "GET";

  const allRows = useMemo(() => buildMockUsers(1000), []);
  const [visibleCount, setVisibleCount] = useState(50);
  const [snippetTab, setSnippetTab] = useState(0);

  const visibleRows = allRows.slice(0, visibleCount);
  const snippets = useMemo(() => getCodeSnippets(endpoint, method), [endpoint]);
  const snippetItems = [
    { label: "cURL", code: snippets.curl },
    { label: "Fetch", code: snippets.fetch },
    { label: "Axios", code: snippets.axios },
    { label: "Python", code: snippets.python },
  ];

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 40;
    if (nearBottom && visibleCount < allRows.length) {
      setVisibleCount((prev) => Math.min(prev + 50, allRows.length));
    }
  };

  const activeSnippet = snippetItems[snippetTab];

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
    } catch {
      // no-op for browsers blocking clipboard access
    }
  };

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" separator="/" sx={{ color: "#F4F2FF" }}>
        <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", fontWeight: 500 }}>
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

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip label={method} sx={{ backgroundColor: "#CFC7FF", color: "#1D163C", fontWeight: 800 }} />
                <Typography sx={{ color: "rgba(244, 242, 255, 0.92)", wordBreak: "break-all" }}>{endpoint}</Typography>
              </Box>

              <Grid container spacing={1.2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.82rem" }}>Auth</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>Bearer Token</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.82rem" }}>Response</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>JSON</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.82rem" }}>Rate Limit</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>120 req/min</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.82rem" }}>Mock Rows</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>{allRows.length}</Typography>
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
                    color: "rgba(244, 242, 255, 0.78)",
                    textTransform: "none",
                    fontWeight: 700,
                    minHeight: 40,
                    px: 1.2,
                  },
                  "& .Mui-selected": {
                    color: "#FFFFFF",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#CFC7FF",
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
                  borderColor: "rgba(207, 199, 255, 0.58)",
                  color: "#E8E3FF",
                  "&:hover": {
                    borderColor: "rgba(222, 216, 255, 0.9)",
                    backgroundColor: "rgba(207, 199, 255, 0.14)",
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
                backgroundColor: "rgba(15, 12, 30, 0.65)",
                color: "rgba(244, 242, 255, 0.93)",
                overflow: "auto",
                maxHeight: 320,
                fontSize: "0.82rem",
                lineHeight: 1.55,
              }}
            >
              {activeSnippet.code}
            </Box>

            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.82rem", mt: 1 }}>
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
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Generated Data (Infinite Table)</Typography>
              <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.86rem" }}>
                Showing {visibleRows.length} of {allRows.length} rows
              </Typography>
            </Stack>

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
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ background: "rgba(31, 27, 56, 0.98)", color: "#FFFFFF", fontWeight: 700 }}>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>{row.id}</TableCell>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>{row.name}</TableCell>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>{row.email}</TableCell>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
                        {row.role}
                      </TableCell>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>{row.city}</TableCell>
                      <TableCell sx={{ color: "rgba(244, 242, 255, 0.9)", borderColor: "rgba(255,255,255,0.08)" }}>{row.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {visibleCount < allRows.length && (
              <Button
                variant="outlined"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 100, allRows.length))}
                sx={{
                  mt: 1.2,
                  textTransform: "none",
                  borderColor: "rgba(207, 199, 255, 0.58)",
                  color: "#E8E3FF",
                  "&:hover": {
                    borderColor: "rgba(222, 216, 255, 0.9)",
                    backgroundColor: "rgba(207, 199, 255, 0.14)",
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

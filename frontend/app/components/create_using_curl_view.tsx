"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

type CurlHeader = {
  key: string;
  value: string;
};

type CurlParam = {
  key: string;
  value: string;
};

type CurlParseResult = {
  method: string;
  url: string;
  path: string;
  pathParams: CurlParam[];
  queryParams: CurlParam[];
  headers: CurlHeader[];
  body: string;
  error: string | null;
};

const EXAMPLE_CURL =
  "curl -X POST https://api.mockyantra.dev/users?limit=10 -H 'Content-Type: application/json' -H 'Authorization: Bearer demo-token' --data-raw '{\"name\":\"Alice\",\"email\":\"alice@demo.com\"}'";

function stripQuotes(value: string) {
  if (value.length < 2) {
    return value;
  }

  const startsWithSingle = value.startsWith("'") && value.endsWith("'");
  const startsWithDouble = value.startsWith('"') && value.endsWith('"');
  if (startsWithSingle || startsWithDouble) {
    return value.slice(1, -1);
  }
  return value;
}

function tokenize(command: string) {
  const matches = command.match(/"[^"]*"|'[^']*'|\S+/g);
  if (!matches) {
    return [];
  }
  return matches.map((token) => stripQuotes(token));
}

function parseHeader(rawHeader: string): CurlHeader {
  const separatorIndex = rawHeader.indexOf(":");
  if (separatorIndex === -1) {
    return { key: rawHeader.trim(), value: "" };
  }

  return {
    key: rawHeader.slice(0, separatorIndex).trim(),
    value: rawHeader.slice(separatorIndex + 1).trim(),
  };
}

function inferPathParams(pathname: string): CurlParam[] {
  const segments = pathname.split("/").filter(Boolean);
  const params: CurlParam[] = [];

  segments.forEach((segment, index) => {
    if (segment.startsWith(":") && segment.length > 1) {
      params.push({ key: segment.slice(1), value: "(from path template)" });
      return;
    }

    if (segment.startsWith("{") && segment.endsWith("}") && segment.length > 2) {
      params.push({ key: segment.slice(1, -1), value: "(from path template)" });
      return;
    }

    // Heuristic: treat id-like segments as path params when names are not provided.
    const isLikelyId = /^\d+$/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment);
    if (isLikelyId) {
      params.push({ key: `segment${index + 1}`, value: segment });
    }
  });

  return params;
}

function extractUrlParts(rawUrl: string) {
  const fallback = { path: "", pathParams: [] as CurlParam[], queryParams: [] as CurlParam[] };
  if (!rawUrl) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(rawUrl);
    const queryParams = Array.from(parsedUrl.searchParams.entries()).map(([key, value]) => ({ key, value }));
    const path = parsedUrl.pathname || "/";
    const pathParams = inferPathParams(path);
    return { path, pathParams, queryParams };
  } catch {
    return fallback;
  }
}

function parseCurlCommand(command: string): CurlParseResult {
  const trimmed = command.trim();
  if (!trimmed) {
    return {
      method: "GET",
      url: "",
      path: "",
      pathParams: [],
      queryParams: [],
      headers: [],
      body: "",
      error: null,
    };
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return {
      method: "GET",
      url: "",
      path: "",
      pathParams: [],
      queryParams: [],
      headers: [],
      body: "",
      error: "Unable to parse command.",
    };
  }

  const startIndex = tokens[0].toLowerCase() === "curl" ? 1 : 0;
  let method = "GET";
  let url = "";
  let body = "";
  const headers: CurlHeader[] = [];

  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];

    if ((token === "-X" || token === "--request") && index + 1 < tokens.length) {
      method = tokens[index + 1].toUpperCase();
      index += 1;
      continue;
    }

    if ((token === "-H" || token === "--header") && index + 1 < tokens.length) {
      headers.push(parseHeader(tokens[index + 1]));
      index += 1;
      continue;
    }

    if (
      (token === "-d" ||
        token === "--data" ||
        token === "--data-raw" ||
        token === "--data-binary" ||
        token === "--data-urlencode") &&
      index + 1 < tokens.length
    ) {
      body = tokens[index + 1];
      if (method === "GET") {
        method = "POST";
      }
      index += 1;
      continue;
    }

    if ((token === "--url" || token === "-L") && index + 1 < tokens.length) {
      if (token === "--url") {
        url = tokens[index + 1];
      }
      index += 1;
      continue;
    }

    if (!token.startsWith("-") && (token.startsWith("http://") || token.startsWith("https://"))) {
      url = token;
      continue;
    }
  }

  if (!url) {
    return {
      method,
      url: "",
      path: "",
      pathParams: [],
      queryParams: [],
      headers,
      body,
      error: "No URL found. Include a URL like https://api.example.com/users",
    };
  }

  const { path, pathParams, queryParams } = extractUrlParts(url);
  return { method, url, path, pathParams, queryParams, headers, body, error: null };
}

export default function CreateUsingCurlView() {
  const [curlCommand, setCurlCommand] = useState(EXAMPLE_CURL);
  const [dataMode, setDataMode] = useState<"manual" | "prompt">("manual");
  const [manualFields, setManualFields] = useState("name, email, role");
  const [recordCount, setRecordCount] = useState("100");
  const [dataPrompt, setDataPrompt] = useState("");
  const [parsed, setParsed] = useState<CurlParseResult>(() => parseCurlCommand(EXAMPLE_CURL));

  const handleSubmit = () => {
    const parsedResult = parseCurlCommand(curlCommand);
    setParsed(parsedResult);
  };

  const handleClear = () => {
    setCurlCommand("");
    setDataMode("manual");
    setManualFields("");
    setRecordCount("");
    setDataPrompt("");
    setParsed(parseCurlCommand(""));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "rgba(255, 255, 255, 0.04)",
      }}
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "linear-gradient(180deg, rgba(38, 31, 73, 0.5) 0%, rgba(23, 20, 48, 0.5) 100%)",
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack spacing={1.6}>
                <Box>
                  <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.6 }}>Paste your cURL command</Typography>
                  <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.9rem" }}>
                    We parse method, endpoint, path params, query params, headers, and body.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  minRows={12}
                  value={curlCommand}
                  onChange={(event) => setCurlCommand(event.target.value)}
                  placeholder="curl https://api.example.com/users -H 'Authorization: Bearer token'"
                />

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.4,
                    borderRadius: 1.5,
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <Stack spacing={1.1}>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Generate Mock Data</Typography>
                    <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.88rem" }}>
                      Choose how you want to describe the data that this API should generate.
                    </Typography>

                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      value={dataMode}
                      onChange={(_, value: "manual" | "prompt" | null) => {
                        if (value) {
                          setDataMode(value);
                        }
                      }}
                      sx={{
                        "& .MuiToggleButton-root": {
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#E8E3FF",
                          borderColor: "rgba(207, 199, 255, 0.4)",
                          py: 0.9,
                        },
                        "& .MuiToggleButton-root.Mui-selected": {
                          color: "#F8F6FF",
                          backgroundColor: "#8C79D8",
                          borderColor: "#8C79D8",
                        },
                        "& .MuiToggleButton-root.Mui-selected:hover": {
                          backgroundColor: "#7B67CC",
                        },
                      }}
                    >
                      <ToggleButton value="manual">Manual</ToggleButton>
                      <ToggleButton value="prompt">Prompt</ToggleButton>
                    </ToggleButtonGroup>

                    {dataMode === "manual" ? (
                      <>
                        <TextField
                          fullWidth
                          label="Fields"
                          value={manualFields}
                          onChange={(event) => setManualFields(event.target.value)}
                          placeholder="name, email, role"
                          helperText="Comma-separated field names"
                        />
                        <TextField
                          fullWidth
                          type="number"
                          label="Number of records"
                          value={recordCount}
                          onChange={(event) => setRecordCount(event.target.value)}
                          inputProps={{ min: 1 }}
                        />
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Data generation prompt"
                        value={dataPrompt}
                        onChange={(event) => setDataPrompt(event.target.value)}
                        placeholder="Generate realistic B2B SaaS users with company, plan type, and signup source"
                      />
                    )}
                  </Stack>
                </Paper>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      backgroundColor: "#8C79D8",
                      color: "#F8F6FF",
                      "&:hover": {
                        backgroundColor: "#7B67CC",
                      },
                    }}
                  >
                    Create API & Generate Data
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "rgba(207, 199, 255, 0.58)",
                      color: "#E8E3FF",
                      "&:hover": {
                        borderColor: "rgba(222, 216, 255, 0.9)",
                        backgroundColor: "rgba(207, 199, 255, 0.14)",
                      },
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack spacing={1.4}>
                <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Parsed Request Preview</Typography>
                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />

                {parsed.error ? (
                  <Typography sx={{ color: "#FFB4B4" }}>{parsed.error}</Typography>
                ) : (
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={parsed.method}
                        sx={{
                          fontWeight: 800,
                          color: "#1D163C",
                          backgroundColor: "#CFC7FF",
                        }}
                      />
                      <Typography sx={{ color: "rgba(244, 242, 255, 0.92)", wordBreak: "break-all" }}>
                        {parsed.url}
                      </Typography>
                    </Box>

                    <Grid container spacing={1.2}>
                      <Grid size={{ xs: 12 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.5 }}>Path</Typography>
                          <Typography sx={{ color: "rgba(244, 242, 255, 0.88)", wordBreak: "break-all" }}>
                            {parsed.path || "/"}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                            height: "100%",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.6 }}>Path Params</Typography>
                          {parsed.pathParams.length === 0 ? (
                            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.9rem" }}>
                              No path params found.
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {parsed.pathParams.map((param, index) => (
                                <Typography key={`${param.key}-${index}`} sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                  {param.key}: {param.value || "(no value)"}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                            height: "100%",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.6 }}>Query Params</Typography>
                          {parsed.queryParams.length === 0 ? (
                            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.9rem" }}>
                              No query params found.
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {parsed.queryParams.map((param, index) => (
                                <Typography key={`${param.key}-${index}`} sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                  {param.key}: {param.value || "(empty)"}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                            height: "100%",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.6 }}>Headers</Typography>
                          {parsed.headers.length === 0 ? (
                            <Typography sx={{ color: "rgba(244, 242, 255, 0.72)", fontSize: "0.9rem" }}>
                              No headers found.
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {parsed.headers.map((header, index) => (
                                <Typography key={`${header.key}-${index}`} sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                  {header.key}: {header.value || "(no value)"}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                            height: "100%",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.6 }}>Body</Typography>
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            value={parsed.body || "No body found."}
                            slotProps={{
                              input: {
                                readOnly: true,
                              },
                            }}
                          />
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                          }}
                        >
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, mb: 0.6 }}>Mock Data Plan</Typography>
                          <Stack spacing={0.5}>
                            <Typography sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                              Mode: {dataMode === "manual" ? "Manual" : "Prompt"}
                            </Typography>
                            {dataMode === "manual" ? (
                              <>
                                <Typography sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                  Fields: {manualFields || "(not provided)"}
                                </Typography>
                                <Typography sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                  Records: {recordCount || "(not provided)"}
                                </Typography>
                              </>
                            ) : (
                              <Typography sx={{ color: "rgba(244, 242, 255, 0.88)" }}>
                                Prompt: {dataPrompt || "(not provided)"}
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type HeaderRow = {
  name: string;
  description: string;
};

type ResponseRow = {
  statusCode: string;
  description: string;
  body: string;
};

type VisualBuilderProps = {
  projectId: string;
};

type SubmissionStatus = {
  kind: "success" | "error";
  title: string;
  message: string;
  apiName?: string;
  method?: string;
  endpoint?: string;
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function parseFieldList(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function VisualBuilder({ projectId }: VisualBuilderProps) {
  const [activeStep, setActiveStep] = useState(0);

  const [apiName, setApiName] = useState("");
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/users");
  const [description, setDescription] = useState("");

  const [headers, setHeaders] = useState<HeaderRow[]>([{ name: "", description: "" }]);

  const [requestBody, setRequestBody] = useState("{");
  const [responses, setResponses] = useState<ResponseRow[]>([
    {
      statusCode: "200",
      description: "Success",
      body: "{\n  \"message\": \"success\"\n}",
    },
  ]);

  const [recordCount, setRecordCount] = useState("100");
  const [nullRate, setNullRate] = useState("5");
  const [locale, setLocale] = useState("en-US");
  const [dataMode, setDataMode] = useState<"manual" | "prompt">("manual");
  const [dataPrompt, setDataPrompt] = useState("");
  const [fields, setFields] = useState("id, name, email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);

  const requestBodyEnabled = useMemo(() => {
    return method === "POST" || method === "PUT" || method === "PATCH";
  }, [method]);

  const addHeader = () => {
    setHeaders((prev) => [...prev, { name: "", description: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof HeaderRow, value: string) => {
    setHeaders((prev) =>
      prev.map((row, i) => {
        if (i !== index) {
          return row;
        }
        return { ...row, [field]: value };
      })
    );
  };

  const addResponse = () => {
    setResponses((prev) => [
      ...prev,
      { statusCode: "400", description: "Bad Request", body: "{\n  \"error\": \"invalid input\"\n}" },
    ]);
  };

  const removeResponse = (index: number) => {
    setResponses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateResponse = (index: number, field: keyof ResponseRow, value: string) => {
    setResponses((prev) =>
      prev.map((row, i) => {
        if (i !== index) {
          return row;
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleCreateApi = async () => {
    if (!apiName.trim() || !endpoint.trim()) {
      setSubmissionStatus({
        kind: "error",
        title: "Missing Required Fields",
        message: "API Name and Endpoint are required.",
      });
      return;
    }

    const fieldNames = parseFieldList(fields);
    const properties = Object.fromEntries(
      fieldNames.map((fieldName) => [fieldName, { type: "string" }])
    );

    setSubmissionStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/apis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "manual",
          name: apiName.trim(),
          method,
          endpointPath: endpoint.trim(),
          description: description.trim() || undefined,
          recordCount: Math.min(100, Math.max(1, Number(recordCount) || 10)),
          responseSchema: {
            type: "object",
            properties,
            required: fieldNames,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmissionStatus({
          kind: "error",
          title: "API Creation Failed",
          message: data.error ?? "Failed to create API.",
        });
        return;
      }

      setSubmissionStatus({
        kind: "success",
        title: "API Created Successfully",
        message: "Your API was created and is available in this project.",
        apiName: data.name,
        method: data.method,
        endpoint: data.endpoint,
      });
    } catch (error) {
      console.error("Error creating API from visual builder:", error);
      setSubmissionStatus({
        kind: "error",
        title: "Unexpected Error",
        message: "Something went wrong while creating the API.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "rgba(255, 255, 255, 0.04)",
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          width: "fit-content",
          mx: "auto",
          mb: 3,
          "& .MuiStep-root": { px: 1 },
          "& .MuiStepLabel-iconContainer": { pr: 1 },
          "& .MuiStepLabel-label": { color: "rgba(244, 242, 255, 0.82)" },
          "& .MuiStepLabel-label.Mui-active": { color: "#FFFFFF" },
          "& .MuiStepLabel-label.Mui-completed": { color: "#CFC7FF" },
        }}
      >
        <Step>
          <StepLabel>API Structure</StepLabel>
        </Step>
        <Step>
          <StepLabel>Generate Data</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 && (
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1.5 }}>1. Basic API Info</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="API Name"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="method-label">Method</InputLabel>
                  <Select
                    labelId="method-label"
                    label="Method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    {METHODS.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.14)" }} />

          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1.5 }}>2. Headers</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.78)", mb: 1.5, fontSize: "0.92rem" }}>
              Example: Authorization - Bearer token required, x-api-key - API key for access.
            </Typography>
            <Stack spacing={1.25}>
              {headers.map((row, index) => (
                <Grid container spacing={1.5} key={`header-${index}`}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      label="Header Name"
                      value={row.name}
                      onChange={(e) => updateHeader(index, "name", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 11, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Description (optional)"
                      value={row.description}
                      onChange={(e) => updateHeader(index, "description", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 1, md: 1 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconButton
                      aria-label="remove header"
                      color="inherit"
                      onClick={() => removeHeader(index)}
                      disabled={headers.length === 1}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addHeader}
              sx={{
                mt: 1.5,
                textTransform: "none",
                borderColor: "rgba(207, 199, 255, 0.58)",
                color: "#E8E3FF",
                "&:hover": {
                  borderColor: "rgba(222, 216, 255, 0.9)",
                  backgroundColor: "rgba(207, 199, 255, 0.14)",
                },
              }}
            >
              Add Header
            </Button>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.14)" }} />

          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1.5 }}>
              3. Request Body (POST / PUT / PATCH)
            </Typography>
            <TextField
              fullWidth
              disabled={!requestBodyEnabled}
              label="JSON Body"
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              multiline
              minRows={6}
              helperText={requestBodyEnabled ? "Provide JSON request payload" : "Enable by selecting POST, PUT, or PATCH"}
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.14)" }} />

          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1.5 }}>4. Response Configuration</Typography>
            <Stack spacing={1.5}>
              {responses.map((response, index) => (
                <Box
                  key={`response-${index}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        fullWidth
                        label="Status Code"
                        value={response.statusCode}
                        onChange={(e) => updateResponse(index, "statusCode", e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 11, md: 9 }}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={response.description}
                        onChange={(e) => updateResponse(index, "description", e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{ xs: 1, md: 1 }}
                      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <IconButton
                        aria-label="remove response"
                        color="inherit"
                        onClick={() => removeResponse(index)}
                        disabled={responses.length === 1}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Response Body (JSON)"
                        value={response.body}
                        onChange={(e) => updateResponse(index, "body", e.target.value)}
                        multiline
                        minRows={5}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addResponse}
              sx={{
                mt: 1.5,
                textTransform: "none",
                borderColor: "rgba(207, 199, 255, 0.58)",
                color: "#E8E3FF",
                "&:hover": {
                  borderColor: "rgba(222, 216, 255, 0.9)",
                  backgroundColor: "rgba(207, 199, 255, 0.14)",
                },
              }}
            >
              Add Response
            </Button>
          </Box>
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.8 }}>Data Generation Preferences</Typography>
            <Typography sx={{ color: "rgba(244, 242, 255, 0.78)", mb: 1.4, fontSize: "0.92rem" }}>
              Choose Manual for explicit controls, or Prompt to describe your dataset in plain language.
            </Typography>

            <TextField
              fullWidth
              label="Fields"
              value={fields}
              onChange={(e) => setFields(e.target.value)}
              placeholder="id, name, email"
              helperText="Comma or newline separated field names for response schema"
              sx={{ mb: 1.5 }}
            />

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
                mb: 1.5,
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
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="How many records?"
                    value={recordCount}
                    onChange={(e) => setRecordCount(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Null Value %"
                    value={nullRate}
                    onChange={(e) => setNullRate(e.target.value)}
                    helperText="Example: 0 to 30"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    helperText="Example: en-US"
                  />
                </Grid>
              </Grid>
            ) : (
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Data generation prompt"
                value={dataPrompt}
                onChange={(e) => setDataPrompt(e.target.value)}
                placeholder="Generate realistic ecommerce orders with customer profile, product categories, discounts, and shipping status"
                helperText="Describe the shape and realism of data you want."
              />
            )}
          </Box>
        </Stack>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
          sx={{
            textTransform: "none",
            borderColor: "rgba(207, 199, 255, 0.5)",
            color: "#E8E3FF",
            "&:hover": {
              borderColor: "rgba(222, 216, 255, 0.9)",
              backgroundColor: "rgba(207, 199, 255, 0.12)",
            },
            "&.Mui-disabled": {
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.45)",
            },
          }}
        >
          Back
        </Button>

        {activeStep < 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            sx={{
              textTransform: "none",
              backgroundColor: "#8C79D8",
              color: "#F8F6FF",
              "&:hover": {
                backgroundColor: "#7B67CC",
              },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateApi}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              backgroundColor: "#8C79D8",
              color: "#F8F6FF",
              "&:hover": {
                backgroundColor: "#7B67CC",
              },
            }}
          >
            {isSubmitting ? "Creating..." : "Create API & Generate"}
          </Button>
        )}
      </Stack>

      {submissionStatus && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 1.6,
            borderRadius: 1.5,
            border:
              submissionStatus.kind === "success"
                ? "1px solid rgba(123, 220, 195, 0.45)"
                : "1px solid rgba(255, 143, 163, 0.45)",
            background:
              submissionStatus.kind === "success"
                ? "rgba(16, 61, 52, 0.35)"
                : "rgba(86, 29, 45, 0.35)",
          }}
        >
          <Typography
            sx={{
              color: submissionStatus.kind === "success" ? "#BDF7E6" : "#FFC1CF",
              fontWeight: 700,
              fontSize: "0.98rem",
              mb: 0.5,
            }}
          >
            {submissionStatus.title}
          </Typography>

          <Typography sx={{ color: "rgba(244, 242, 255, 0.9)", fontSize: "0.92rem" }}>
            {submissionStatus.message}
          </Typography>

          {submissionStatus.kind === "success" && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ color: "rgba(244, 242, 255, 0.9)", fontSize: "0.88rem" }}>
                Name: {submissionStatus.apiName}
              </Typography>
              <Typography sx={{ color: "rgba(244, 242, 255, 0.9)", fontSize: "0.88rem" }}>
                Route: {submissionStatus.method} {submissionStatus.endpoint}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Paper>
  );
}

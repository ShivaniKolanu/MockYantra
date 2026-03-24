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

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function VisualBuilder() {
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
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>
            Data Generation Preferences (Manual)
          </Typography>

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
            sx={{
              textTransform: "none",
              backgroundColor: "#8C79D8",
              color: "#F8F6FF",
              "&:hover": {
                backgroundColor: "#7B67CC",
              },
            }}
          >
            Create API & Generate
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

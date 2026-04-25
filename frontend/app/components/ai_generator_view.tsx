"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type AiGeneratorViewProps = {
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

export default function AiGeneratorView({ projectId }: AiGeneratorViewProps) {
  const [prompt, setPrompt] = useState("i want to create a get users api");
  const [fields, setFields] = useState("name, email, address");
  const [recordCount, setRecordCount] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);

  const handleCreateApi = async () => {
    if (!prompt.trim()) {
      setSubmissionStatus({
        kind: "error",
        title: "Missing Prompt",
        message: "Please enter a prompt before creating the API.",
      });
      return;
    }

    setSubmissionStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/apis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "ai",
          aiPrompt: prompt.trim(),
          aiFields: fields.trim() || undefined,
          recordCount: Math.min(500, Math.max(1, Number(recordCount) || 5)),
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
        message: "Your new mock API was generated and saved to this project.",
        apiName: data.name,
        method: data.method,
        endpoint: data.endpoint,
      });
    } catch (error) {
      console.error("Error creating API:", error);
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
        p: 3,
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "rgba(255, 255, 255, 0.04)",
      }}
    >
      <Stack spacing={2.2}>
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.8 }}>
            Describe your API and data
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="i want to create a get users api"
          />
        </Box>

        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.8 }}>
            Fields (optional)
          </Typography>
          <TextField
            fullWidth
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            placeholder="name, email, address"
            helperText="Comma-separated field names"
          />
        </Box>

        <Box sx={{ maxWidth: 260 }}>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, mb: 0.8 }}>
            Number of records
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={recordCount}
            onChange={(e) => setRecordCount(e.target.value)}
            inputProps={{ min: 1, max: 500 }}
          />
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleCreateApi}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#1FA38F",
              color: "#F4FFFB",
              "&:hover": {
                backgroundColor: "#167567",
              },
            }}
          >
            {isSubmitting ? "Creating..." : "Create API & Generate Data"}
          </Button>
        </Box>

        {submissionStatus && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
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
            <CardContent sx={{ p: 1.8, "&:last-child": { pb: 1.8 } }}>
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

              <Typography sx={{ color: "rgba(228, 255, 246, 0.9)", fontSize: "0.92rem" }}>
                {submissionStatus.message}
              </Typography>

              {submissionStatus.kind === "success" && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ color: "rgba(228, 255, 246, 0.9)", fontSize: "0.88rem" }}>
                    Name: {submissionStatus.apiName}
                  </Typography>
                  <Typography sx={{ color: "rgba(228, 255, 246, 0.9)", fontSize: "0.88rem" }}>
                    Route: {submissionStatus.method} {submissionStatus.endpoint}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Paper>
  );
}


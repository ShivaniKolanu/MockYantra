"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function AiGeneratorView() {
  const [prompt, setPrompt] = useState("i want to create a get users api");
  const [fields, setFields] = useState("name, email, address");
  const [recordCount, setRecordCount] = useState("5");

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
            inputProps={{ min: 1 }}
          />
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
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
        </Box>
      </Stack>
    </Paper>
  );
}

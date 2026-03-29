"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type AddProjectPayload = {
  name: string;
  description: string;
  baseUrl: string;
};

type AddProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: AddProjectPayload) => void;
};

export default function AddProjectModal({ open, onClose, onCreate }: AddProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const isNameValid = useMemo(() => name.trim().length > 0, [name]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setBaseUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = () => {
    if (!isNameValid) {
      return;
    }

    onCreate?.({
      name: name.trim(),
      description: description.trim(),
      baseUrl: baseUrl.trim(),
    });
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(12, 10, 30, 0.42)",
            backdropFilter: "blur(3px)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: 520 },
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.38)",
          background: "linear-gradient(180deg, rgba(86, 74, 146, 0.94) 0%, rgba(60, 51, 112, 0.94) 100%)",
          boxShadow: "0 24px 60px rgba(12, 10, 28, 0.32)",
          p: 2.2,
          outline: "none",
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography sx={{ color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 700 }}>
              Add New Project
            </Typography>
            <Typography sx={{ color: "rgba(252, 250, 255, 0.86)", mt: 0.4, fontSize: "0.92rem" }}>
              Start with the project basics. You can configure more details later.
            </Typography>
          </Box>

          <TextField
            fullWidth
            required
            label="Project Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={!isNameValid && name.length > 0}
            helperText={!isNameValid && name.length > 0 ? "Project name is required" : " "}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          />

          <TextField
            fullWidth
            label="Project Description"
            multiline
            minRows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you building with this API project?"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          />

          <TextField
            fullWidth
            label="Base URL (optional)"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.example.com"
            helperText="Recommended if most APIs in this project share one base URL."
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                textTransform: "none",
                borderColor: "rgba(255, 255, 255, 0.56)",
                color: "#FFFFFF",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.9)",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!isNameValid}
              onClick={handleCreate}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#8C79D8",
                color: "#F8F6FF",
                "&:hover": {
                  backgroundColor: "#7B67CC",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(140, 121, 216, 0.45)",
                  color: "rgba(248, 246, 255, 0.65)",
                },
              }}
            >
              Create Project
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
}
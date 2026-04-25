"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import AddProjectModal from "./add_project_modal";

export default function Header() {
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

    const handleOpenAddProject = () => {
        setIsAddProjectOpen(true);
    };

    const handleCloseAddProject = () => {
        setIsAddProjectOpen(false);
    };

    const handleCreateProject = async (payload: {
        name: string;
        projectCode: string;
        description: string;
        baseUrl: string;
    }) => {
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                alert("Failed to create project");
                return;
            }

            window.location.reload();
        } catch {
            alert("Error creating project");
        }
    };

    return (
        <>
            <Box
                component="div"
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    background: "rgba(7, 39, 48, 0.64)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 8px 20px rgba(10, 8, 20, 0.22)",
                    zIndex: 1000,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.05 }}>
                    <Box
                        component="img"
                        src="/icon.png"
                        alt="MockYantra icon"
                        sx={{
                            width: 112,
                            height: 44,
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                    />
                    <Typography variant="h6" component="h1" sx={{ color: "#E9FFF8", fontWeight: 700, fontSize: "1.45rem" }}>
                        MockYantra
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddProject}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        fontSize: "1.175rem",
                        backgroundColor: "rgba(255, 255, 255, 0.18)",
                        color: "#E9FFF8",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.28)",
                        },
                    }}
                >
                    Add New Project
                </Button>
            </Box>

            <AddProjectModal open={isAddProjectOpen} onClose={handleCloseAddProject} onCreate={handleCreateProject} />
        </>
    );
}

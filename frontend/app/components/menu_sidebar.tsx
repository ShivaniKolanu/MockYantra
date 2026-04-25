"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Chip, Divider, Stack } from "@mui/material";

type CurrentView = "dashboard" | "api" | "create-api";

type MenuSidebarProps = {
    selectedProject: string | null;
    selectedApi: string | null;
    getSelectedProject: (project: string | null) => void;
    getSelectedApi: (api: string | null) => void;
    currentView: CurrentView;
    getCurrentView: (view: CurrentView) => void;
    refreshKey?: number;
};

type Project = {
    id: string;
    name: string;
    apis: Array<{ id: string; name: string; method?: string; isActive?: boolean }>;
};

export default function MenuSidebar({
    selectedProject,
    selectedApi,
    getSelectedProject,
    getSelectedApi,
    currentView,
    getCurrentView,
    refreshKey = 0,
}: MenuSidebarProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as Project[];
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [refreshKey]);

    return (
        <Drawer
            variant="permanent"
            sx={{
                position: "fixed",
                left: 0,
                top: "64px",
                width: 180,
                height: "calc(100vh - 64px)",
                "& .MuiDrawer-paper": {
                    position: "fixed",
                    left: 0,
                    top: "64px",
                    width: 240,
                    height: "calc(100vh - 64px)",
                    background: "rgba(8, 44, 56, 0.56)",
                    backdropFilter: "blur(12px)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#DDFCF4",
                },
            }}
        >
            <ListItem disablePadding sx={{ px: 1, pt: 2, pb: 1.5 }}>
                <ListItemButton
                    selected={currentView === "dashboard"}
                    onClick={() => {
                        getSelectedProject(null);
                        getSelectedApi(null);
                        getCurrentView("dashboard");
                    }}
                    sx={{
                        borderRadius: 1.5,
                        color: "inherit",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.12)",
                        },
                        "&:active": {
                            backgroundColor: "rgba(255, 255, 255, 0.18)",
                        },
                        "&.Mui-selected": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            color: "#FFFFFF",
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.24)",
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                        <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Dashboard"
                        primaryTypographyProps={{
                            fontSize: "1.05rem",
                            fontWeight: 600,
                        }}
                    />
                </ListItemButton>
            </ListItem>
            <Divider sx={{ borderBottomWidth: 2, borderColor: "rgba(255, 255, 255, 0.28)" }} />
            <List sx={{ px: 1, py: 2 }}>
                {loading ? (
                    <ListItemText primary="Loading projects..." sx={{ px: 2, color: "rgba(255, 255, 255, 0.5)" }} />
                ) : projects.length === 0 ? (
                    <ListItemText primary="No projects yet" sx={{ px: 2, color: "rgba(255, 255, 255, 0.5)" }} />
                ) : (
                    projects.map((project) => (
                        <ListItem key={project.id} disablePadding sx={{ display: "block", mb: 1 }}>
                            <Accordion
                                disableGutters
                                elevation={0}
                                sx={{
                                    background: "transparent",
                                    color: "inherit",
                                    "&::before": { display: "none" },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: "inherit" }} />}
                                    sx={{
                                        minHeight: 44,
                                        borderRadius: 1.5,
                                        transition: "background-color 0.2s ease, color 0.2s ease",
                                        "& .MuiAccordionSummary-content": {
                                            my: 0,
                                            alignItems: "center",
                                        },
                                        "&.Mui-expanded": {
                                            backgroundColor: "rgba(255, 255, 255, 0.12)",
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.16)",
                                        },
                                        "&:active": {
                                            backgroundColor: "rgba(255, 255, 255, 0.22)",
                                        },
                                    }}
                                    onClick={() => {
                                        getSelectedProject(project.id);
                                        getSelectedApi(null);
                                        getCurrentView("dashboard");
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                                        <RocketLaunchIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={project.name}
                                        sx={{
                                            "& .MuiListItemText-primary": {
                                                fontSize: "1.15rem",
                                                lineHeight: 1.35,
                                            },
                                        }}
                                        primaryTypographyProps={{
                                            fontSize: "1.15rem",
                                            fontWeight: selectedProject === project.id ? 700 : 600,
                                            color: selectedProject === project.id ? "#FFFFFF" : "#DDFCF4",
                                        }}
                                    />
                                </AccordionSummary>

                                <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 0 }}>
                                    <List dense disablePadding>
                                        {project.apis.map((api) => {
                                            return (
                                            <ListItem key={api.id} disablePadding>
                                                <ListItemButton
                                                    onClick={() => {
                                                        getSelectedProject(project.id);
                                                        getSelectedApi(api.id);
                                                        getCurrentView("api");
                                                    }}
                                                    selected={currentView === "api" && selectedProject === project.id && selectedApi === api.id}
                                                    sx={{
                                                        pl: 6,
                                                        borderRadius: 1.5,
                                                        transition: "background-color 0.2s ease, color 0.2s ease",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.12)",
                                                        },
                                                        "&:active": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.18)",
                                                        },
                                                        "&.Mui-selected": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                            color: "#FFFFFF",
                                                        },
                                                        "&.Mui-selected:hover": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.24)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={api.name}
                                                        sx={{
                                                            "& .MuiListItemText-primary": {
                                                                fontSize: "1.02rem",
                                                                lineHeight: 1.35,
                                                            },
                                                        }}
                                                        primaryTypographyProps={{
                                                            fontSize: "1.02rem",
                                                            fontWeight: currentView === "api" && selectedProject === project.id && selectedApi === api.id ? 600 : 500,
                                                        }}
                                                    />
                                                    <Stack direction="row" alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                                                        <Chip
                                                            size="small"
                                                            label={api.isActive ? "Active" : "Inactive"}
                                                            sx={{
                                                                height: 20,
                                                                fontSize: "0.68rem",
                                                                fontWeight: 700,
                                                                color: api.isActive ? "#dcfce7" : "#fee2e2",
                                                                backgroundColor: api.isActive
                                                                    ? "rgba(34, 197, 94, 0.24)"
                                                                    : "rgba(239, 68, 68, 0.24)",
                                                                border: api.isActive
                                                                    ? "1px solid rgba(34, 197, 94, 0.45)"
                                                                    : "1px solid rgba(239, 68, 68, 0.45)",
                                                            }}
                                                        />
                                                    </Stack>
                                                </ListItemButton>
                                            </ListItem>
                                            );
                                        })}

                                        <ListItem disablePadding sx={{ mt: 0.5 }}>
                                            <ListItemButton
                                                selected={currentView === "create-api" && selectedProject === project.id}
                                                onClick={() => {
                                                    getSelectedProject(project.id);
                                                    getSelectedApi(null);
                                                    getCurrentView("create-api");
                                                }}
                                                sx={{
                                                    pl: 4.5,
                                                    borderRadius: 1.5,
                                                    color: "#E9FFF8",
                                                    border: "1px dashed rgba(255, 255, 255, 0.22)",
                                                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255, 255, 255, 0.12)",
                                                        borderColor: "rgba(255, 255, 255, 0.38)",
                                                    },
                                                    "&:active": {
                                                        backgroundColor: "rgba(255, 255, 255, 0.18)",
                                                    },
                                                    "&.Mui-selected": {
                                                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                        borderColor: "rgba(255, 255, 255, 0.45)",
                                                        color: "#FFFFFF",
                                                    },
                                                    "&.Mui-selected:hover": {
                                                        backgroundColor: "rgba(255, 255, 255, 0.24)",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                                                    <AddIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Create New API"
                                                    primaryTypographyProps={{
                                                        fontSize: "0.95rem",
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </ListItem>
                    ))
                )}
            </List>
        </Drawer>
    );
}

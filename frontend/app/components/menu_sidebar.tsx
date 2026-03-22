"use client";

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
import { useState } from "react";

const projects = ["Project 1", "Project 2", "Project 3"];
const apis = ["API 1", "API 2"];

export default function MenuSidebar() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedApi, setSelectedApi] = useState<string | null>(null);

    return(
        <Drawer
            variant="permanent"
            sx={{
                position: "fixed",
                left: 0,
                top: "64px",
                width: 280,
                height: "calc(100vh - 64px)",
                "& .MuiDrawer-paper": {
                    position: "fixed",
                    left: 0,
                    top: "64px",
                    width: 280,
                    height: "calc(100vh - 64px)",
                    background: "rgba(36, 37, 72, 0.5)",
                    backdropFilter: "blur(12px)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#E9E7F8",
                }
            }}
        >
            <List sx={{ px: 1, py: 2 }}>
                {projects.map((project) => (
                    <ListItem key={project} disablePadding sx={{ display: "block", mb: 1 }}>
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
                                onClick={() => setSelectedProject(project)}
                            >
                                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                                    <RocketLaunchIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={project}
                                    sx={{
                                        "& .MuiListItemText-primary": {
                                            fontSize: "1.15rem",
                                            lineHeight: 1.35,
                                        },
                                    }}
                                    primaryTypographyProps={{
                                        fontSize: "1.15rem",
                                        fontWeight: selectedProject === project ? 700 : 600,
                                        color: selectedProject === project ? "#FFFFFF" : "#E9E7F8",
                                    }}
                                />
                            </AccordionSummary>

                            <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 0 }}>
                                <List dense disablePadding>
                                    {apis.map((api) => (
                                        <ListItem key={`${project}-${api}`} disablePadding>
                                            <ListItemButton
                                                selected={selectedApi === `${project}-${api}`}
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setSelectedApi(`${project}-${api}`);
                                                }}
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
                                                    primary={api}
                                                    sx={{
                                                        "& .MuiListItemText-primary": {
                                                            fontSize: "1.02rem",
                                                            lineHeight: 1.35,
                                                        },
                                                    }}
                                                    primaryTypographyProps={{
                                                        fontSize: "1.02rem",
                                                        fontWeight: selectedApi === `${project}-${api}` ? 600 : 500,
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}

                                    <ListItem disablePadding sx={{ mt: 0.5 }}>
                                        <ListItemButton
                                            sx={{
                                                pl: 4.5,
                                                borderRadius: 1.5,
                                                color: "#F4F2FF",
                                                border: "1px dashed rgba(255, 255, 255, 0.22)",
                                                transition: "background-color 0.2s ease, border-color 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                                                    borderColor: "rgba(255, 255, 255, 0.38)",
                                                },
                                                "&:active": {
                                                    backgroundColor: "rgba(255, 255, 255, 0.18)",
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
                ))}
            </List>
        </Drawer>
    );
}
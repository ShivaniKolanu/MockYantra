"use client";

import { useState } from "react";
import Typography from "@mui/material/Typography";
import Header from "./components/header";
import MenuSidebar from "./components/menu_sidebar";
import DashboardView from "./components/dashboard_view";
import ApiView from "./components/api_view";
import CreateApiView from "./components/create_api_view";

type CurrentView = "dashboard" | "api" | "create-api";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>("dashboard");

  const getSelectedProject = (project: string | null) => {
    setSelectedProject(project);
  };

  const getSelectedApi = (api: string | null) => {
    setSelectedApi(api);
  };

  const getCurrentView = (view: CurrentView) => {
    setCurrentView(view);
  };

  return (
    <>
      <Header />
      <MenuSidebar
        selectedProject={selectedProject}
        selectedApi={selectedApi}
        getSelectedProject={getSelectedProject}
        getSelectedApi={getSelectedApi}
        currentView={currentView}
        getCurrentView={getCurrentView}
      />
      <main style={{ paddingTop: "64px", paddingLeft: "240px" }}>
        {currentView === "dashboard" && <DashboardView />}

        {currentView === "api" && selectedProject && selectedApi && (
          <ApiView project={selectedProject} api={selectedApi} />
        )}

        {currentView === "create-api" && selectedProject && (
          <CreateApiView project={selectedProject} />
        )}

        {((currentView === "api" && (!selectedProject || !selectedApi)) ||
          (currentView === "create-api" && !selectedProject)) && (
          <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", px: 4, py: 3 }}>
            Select a project and API from the sidebar.
          </Typography>
        )}
      </main>
    </>
  );
}

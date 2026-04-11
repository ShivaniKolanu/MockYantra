"use client";

import { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import Header from "./components/header";
import MenuSidebar from "./components/menu_sidebar";
import DashboardView from "./components/dashboard_view";
import ApiView from "./components/api_view";
import CreateApiView from "./components/create_api_view";

type CurrentView = "dashboard" | "api" | "create-api";

type ProjectSummary = {
  id: string;
  name: string;
  apis: Array<{
    id: string;
    name: string;
  }>;
};

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>("dashboard");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ProjectSummary[];
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [selectedProject, selectedApi]);

  const selectedProjectName = useMemo(() => {
    if (!selectedProject) {
      return null;
    }

    const project = projects.find((item) => item.id === selectedProject);
    return project?.name ?? selectedProject;
  }, [projects, selectedProject]);

  const selectedApiName = useMemo(() => {
    if (!selectedProject || !selectedApi) {
      return null;
    }

    const project = projects.find((item) => item.id === selectedProject);
    const api = project?.apis.find((item) => item.id === selectedApi);
    return api?.name ?? selectedApi;
  }, [projects, selectedProject, selectedApi]);

  const getSelectedProject = (project: string | null) => {
    setSelectedProject(project);
  };

  const getSelectedApi = (api: string | null) => {
    setSelectedApi(api);
  };

  const getCurrentView = (view: CurrentView) => {
    setCurrentView(view);
  };

  const handleHostingStatusChanged = () => {
    setSidebarRefreshKey((prev) => prev + 1);
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
        refreshKey={sidebarRefreshKey}
      />
      <main style={{ paddingTop: "84px", paddingLeft: "240px" }}>
        {currentView === "dashboard" && <DashboardView />}

        {currentView === "api" && selectedProject && selectedApi && (
          <ApiView
            project={selectedProjectName ?? selectedProject}
            api={selectedApiName ?? selectedApi}
            apiId={selectedApi}
            onHostingStatusChanged={handleHostingStatusChanged}
          />
        )}

        {currentView === "create-api" && selectedProject && (
          <CreateApiView
            projectId={selectedProject}
            projectName={selectedProjectName ?? selectedProject}
          />
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

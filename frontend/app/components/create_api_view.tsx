"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import VisualBuilder from "./visual_builder";
import AiGeneratorView from "./ai_generator_view";
import CreateUsingCurlView from "./create_using_curl_view";

type CreateApiViewProps = {
  projectId: string;
  projectName: string;
};

export default function CreateApiView({ projectId, projectName }: CreateApiViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" separator="/" sx={{ color: "#F4F2FF" }}>
        <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", fontWeight: 500 }}>
          {projectName}
        </Typography>
        <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>Create New API</Typography>
      </Breadcrumbs>

      <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", mt: 2 }}>
        Create API page placeholder content.
      </Typography>

      <Box
        sx={{
          mt: 3,
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.16)",
          background: "rgba(20, 18, 40, 0.35)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue: number) => setActiveTab(newValue)}
          textColor="inherit"
          sx={{
            px: 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            "& .MuiTab-root": {
              color: "rgba(244, 242, 255, 0.78)",
              textTransform: "none",
              fontSize: "0.98rem",
              fontWeight: 600,
              minHeight: 52,
            },
            "& .Mui-selected": {
              color: "#FFFFFF",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#CFC7FF",
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="AI Generator" />
          <Tab label="Visual Builder" />
          <Tab label="Create using cURL" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <AiGeneratorView projectId={projectId} />}
          {activeTab === 1 && (
            <VisualBuilder projectId={projectId} />
          )}
          {activeTab === 2 && <CreateUsingCurlView />}
        </Box>
      </Box>
    </Box>
  );
}

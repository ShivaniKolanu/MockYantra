import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";

type ApiViewProps = {
  project: string;
  api: string;
};

export default function ApiView({ project, api }: ApiViewProps) {
  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" separator="/" sx={{ color: "#F4F2FF" }}>
        <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", fontWeight: 500 }}>
          {project}
        </Typography>
        <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>{api}</Typography>
      </Breadcrumbs>

      <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", mt: 2 }}>
        API page placeholder content.
      </Typography>
    </Box>
  );
}

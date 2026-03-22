import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function DashboardView() {
  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography sx={{ color: "#FFFFFF", fontSize: "1.25rem", fontWeight: 700 }}>
        Dashboard
      </Typography>
      <Typography sx={{ color: "rgba(244, 242, 255, 0.82)", mt: 1 }}>
        Dashboard placeholder content.
      </Typography>
    </Box>
  );
}

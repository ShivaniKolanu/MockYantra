import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

export default function Header() {
    return (
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
                background: "rgba(45, 45, 82, 0.58)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 8px 20px rgba(10, 8, 20, 0.22)",
                zIndex: 1000,
            }}
        >
            <Typography variant="h6" component="h1" sx={{ color: "#F4F2FF", fontWeight: 600 }}>
                MockYantra
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: "1.175rem",
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    color: "#F4F2FF",
                    "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.28)",
                    },
                }}
            >
                Add New Project
            </Button>
        </Box>
    );
}
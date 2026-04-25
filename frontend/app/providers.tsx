"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1FA38F",
      dark: "#167567",
      light: "#84E3CF",
      contrastText: "#F4FFFB",
    },
    secondary: {
      main: "#7ED2C5",
    },
    background: {
      default: "transparent",
      paper: "rgba(6, 41, 52, 0.4)",
    },
    text: {
      primary: "#ECFFF9",
      secondary: "rgba(228, 255, 246, 0.8)",
    },
  },
  typography: {
    fontFamily: "var(--font-electrolize), var(--font-geist-sans), sans-serif",
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

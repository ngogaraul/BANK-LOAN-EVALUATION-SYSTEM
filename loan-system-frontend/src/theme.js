import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0b3d91" },     // bank blue
    secondary: { main: "#0ea5e9" },   // accent
    background: { default: "#f6f8fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 10px 30px rgba(2, 6, 23, 0.06)",
        },
      },
    },
  },
});

export default theme;

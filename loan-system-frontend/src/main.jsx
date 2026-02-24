import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { SnackbarProvider } from "notistack";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={2500} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);

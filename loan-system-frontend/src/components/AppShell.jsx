import { useMemo } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";

import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Chip
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const drawerWidth = 240;

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const auth = getAuth();
  const role = auth?.role || "ANALYST";
  const name = auth?.name || "User";

  const menu = useMemo(() => {
    // Analysts see normal items, Admin sees everything.
    const base = [
      { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
      { to: "/applications", label: "Applications", icon: <AssignmentIcon /> },
      { to: "/clients", label: "Clients", icon: <PeopleIcon /> },
    ];

    const create = [
      { to: "/clients/new", label: "New Client", icon: <PersonAddIcon /> },
      { to: "/applications/new", label: "New Application", icon: <NoteAddIcon /> },
    ];

    const admin = [
      { to: "/admin", label: "Admin", icon: <AdminPanelSettingsIcon /> },
    ];

    return role === "ADMIN" ? [...base, ...create, ...admin] : [...base, ...create];
  }, [role]);

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  const activePath = location.pathname;

  return (
    <Box sx={{ display: "flex" }}>
      {/* TOP BAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          background: "linear-gradient(90deg, rgba(11,61,145,1) 0%, rgba(14,165,233,1) 100%)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Loan Analyst Portal
          </Typography>

          <Chip
            size="small"
            label={`${name} • ${role}`}
            sx={{ mr: 2, bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
          />

          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 100%)",
            color: "white",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Navigation</Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

        <List>
          {menu.map((m) => {
            const selected = activePath === m.to || (m.to !== "/" && activePath.startsWith(m.to));
            return (
              <ListItemButton
                key={m.to}
                component={RouterLink}
                to={m.to}
                selected={selected}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  color: "rgba(255,255,255,0.9)",
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                <ListItemIcon sx={{ color: "rgba(255,255,255,0.85)", minWidth: 40 }}>
                  {m.icon}
                </ListItemIcon>
                <ListItemText primary={m.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          minHeight: "100vh",
          background:
            "radial-gradient(1200px 600px at 10% 10%, rgba(14,165,233,0.10), transparent 60%)," +
            "radial-gradient(900px 500px at 90% 20%, rgba(11,61,145,0.10), transparent 55%)," +
            "linear-gradient(180deg, #f6f8fb 0%, #eef2ff 100%)",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

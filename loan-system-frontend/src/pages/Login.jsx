import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { saveAuth } from "../auth/auth";
import { useSnackbar } from "notistack";

import {
  Box, Paper, Typography, TextField, Button, Stack, Divider
} from "@mui/material";

const BANK_BG =
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=2000&q=80";

export default function Login() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      // expected: { token, role, name, user_id }
      // ✅ normalize role so UI permissions work reliably
      saveAuth({
        ...res.data,
        role: String(res.data?.role || "").trim().toUpperCase(),
      });

      enqueueSnackbar("Welcome back!", { variant: "success" });
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.70)), url(${BANK_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Loan Analyst Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Secure sign-in to review applications and model output.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Typography variant="caption" color="text.secondary">
              Tip: Use Analyst/Admin accounts created from your backend.
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
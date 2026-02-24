import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useSnackbar } from "notistack";
import { Box, Paper, Typography, TextField, Button, Stack } from "@mui/material";

export default function NewClient() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [account, setAccount] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!account.trim()) {
      enqueueSnackbar("Account is required.", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/clients", {
        account: account.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      enqueueSnackbar("Client created successfully.", { variant: "success" });
      const clientId = res.data.client_id;
      // go to financials form
      navigate(`/clients/${clientId}/edit-financials`);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "Failed to create client";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Create Client</Typography>
      <Paper sx={{ p: 2, maxWidth: 650 }}>
        <Stack spacing={2}>
          <TextField
            label="Account (unique)"
            placeholder="ACC001"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <TextField
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            label="Phone"
            placeholder="0780000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button variant="contained" onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Create Client"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useSnackbar } from "notistack";

import {
  Box, Paper, Typography, Stack, TextField, Button, CircularProgress, MenuItem
} from "@mui/material";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function NewApplication() {
  const query = useQuery();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const preClientId = query.get("client_id") || "";

  const [clientSearch, setClientSearch] = useState("");
  const [clientOptions, setClientOptions] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(preClientId);

  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [term, setTerm] = useState("");

  async function searchClients() {
    setLoadingClients(true);
    try {
      const res = await api.get("/clients", { params: { search: clientSearch.trim() } });
      setClientOptions(res.data || []);
    } catch (e) {
      enqueueSnackbar("Failed to search clients.", { variant: "error" });
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    // if prefilled client id, we can still load options to show something
    if (preClientId) {
      (async () => {
        try {
          const res = await api.get(`/clients/${preClientId}`);
          setClientOptions([{
            id: res.data.id,
            account: res.data.account,
            full_name: res.data.full_name,
            phone: res.data.phone
          }]);
        } catch {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (!selectedClientId) {
      enqueueSnackbar("Select a client.", { variant: "warning" });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      enqueueSnackbar("Amount must be a valid number.", { variant: "warning" });
      return;
    }
    if (!term || Number(term) <= 0) {
      enqueueSnackbar("Term must be valid.", { variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/applications", {
        client_id: Number(selectedClientId),
        amount_requested: Number(amount),
        purpose: purpose.trim(),
        term_requested: Number(term),
      });
      enqueueSnackbar("Application created successfully.", { variant: "success" });
      navigate(`/applications/${res.data.application_id}`);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "Failed to create application";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Create Application</Typography>

      <Paper sx={{ p: 2, maxWidth: 720 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Select Client</Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Search client"
              placeholder="ACC001 / John"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" onClick={searchClients} disabled={loadingClients}>
              {loadingClients ? "Searching..." : "Search"}
            </Button>
          </Stack>

          <TextField
            select
            label="Client"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            {clientOptions.length === 0 ? (
              <MenuItem value="">
                {loadingClients ? "Loading..." : "No clients found. Search above."}
              </MenuItem>
            ) : (
              clientOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.account} — {c.full_name}
                </MenuItem>
              ))
            )}
          </TextField>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>Application Details</Typography>

          <TextField
            label="Amount Requested"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2000000"
          />

          <TextField
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Business expansion"
          />

          <TextField
            label="Term Requested (months)"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="12"
          />

          <Button variant="contained" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Create Application"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
